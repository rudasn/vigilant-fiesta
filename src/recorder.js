/**
 * EventRecorder
 *
 * The purpose of the recorder is to add event listeners
 * and extract useful information from captured events.
 *
 * @example Capture `mousemove` and `click` events from the current window.
 *  const recorder = new EventRecorder([ 'mousemove', 'click' ], {
 *      // extract the type of the captured event.
 *      extract: (event, context) => ({ type: event.type }),
 *      context: window,
 *  })
 *  recorder.start()
 *  recorder.queue // => holds the captured events
 *
 * @constructor
 * @param {string[]} events - An array of event types to listen to.
 * @param {object} props
 * @param {function} props.extract - The function to extract data & meta-data
 *      from the captured events. Accepts the captured `event` and the
 *      provided `context` and optionally returns an `object`.
 * @param {object} [props.context] - The context of the event recorder.
 *      Listeners will be attached on this object.
 *      Can be a DOM `node`, `document`, or `window` (default).
 */
class EventRecorder {
    constructor(events, { extract=e => e, context=window }) {
        this.events = events
        this.capture = this.capture.bind(this)
        this.queue = []
        this.props = {
            extract,
            context,
        }
    }
    /**
     * Add a listener for each event on the context provided on initialization.
     */
    start() {
        const { events, capture } = this
        const { context } = this.props

        events.map(name =>
            context.addEventListener(name, capture, true)
        )
        return this
    }
    /**
     * Remove all event listeners.
     */
    stop() {
        const { events, capture } = this
        const { context } = this.props

        events.map(name =>
            context.removeEventListener(name, capture, true)
        )
        return this
    }
    /**
     * Callback for event listeners.
     * If the `extract` function provided on initialization returns a non-falsey
     * value the value is appended on the instance's `queue` property.
     */
    capture(event) {
        const { extract, context } = this.props
        const { queue } = this

        const action = extract(event, context)

        if (action) {
            console.log('captured', action.type, action)
            queue.push(action)
        }
    }
}

export default EventRecorder
