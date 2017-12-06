/**
 * EventDispatcher
 *
 * The purpose of the event dispatcher is to apply a series of actions
 * captured from the EventRecorder on the specified context.
 *
 * @example Dispatch a series of `mousemove` and `click` actions.
 *  const player = new EventDispatcher({
 *      trigger: (event, context) => {
 *          console.log(`Triggered "${ event.type }"`)
 *      }
 *  })
 *  player.play(recorder.queue)
 *
 * @constructor
 * @param {object} props
 * @param {function} props.trigger - the function to call when triggering
 *      an event. Accents the extracted `event` and the provided `context`.
 * @param {object} [props.context] - The context of the event recorder.
 *      Listeners will be attached on this object.
 *      Can be a DOM `node`, `document`, or `window`.
 */
class EventDispatcher {
    constructor({ trigger, context }) {
        this.props = {
            trigger,
            context,
        }
        this.isPaused = true
        this.currentFrame = 0
        this.currentActions = []
    }
    /**
     * Dispatch the event at `frame` from the `actions` array.
     * Provides a time delay considering the time delta between the
     * previous event in the `actions` and the current event.
     *
     * @param {object[]} - An array of captured events
     * @param {number} [frame] - The index of the event we want to dispatch
     */
    dispatch(actions=this.currentActions, frame=this.currentFrame) {
        const { trigger, context } = this.props
        const { isPaused } = this

        const next = actions[frame]
        const previous = actions[frame - 1]

        if (!next || isPaused) { return }

        this.currentActions = actions
        this.currentFrame = frame

        const timeout = previous ?
            new Date(next.timestamp) - new Date(previous.timestamp) :
            0

        console.log(`dispatching #${ frame } (${ next.type }) in ${ timeout }ms`)

        setTimeout(() => {
            if (this.isPaused) { return }

            raf(() => {
                try {
                    trigger(next, context)
                    this.dispatch(actions, frame + 1)
                } catch(e) {
                    console.error(`Error triggering event "${ next.type }"`)
                    throw e
                }
            })
        }, timeout)
    }
    /**
     * Apply a set of events.
     *
     * @param {object[]} - An array of captured events
     * @param {number} [frame] - The index of the event we want to begin with
     */
    play(actions, frame) {
        this.isPaused = false
        this.dispatch(actions, frame)
        console.log('play', frame)
        return this
    }
    /**
     * Stop the playback of events.
     */
    stop() {
        this.isPaused = true
        console.log('stop')
        return this
    }
    /**
     * Restart playback of events, starting from the first one.
     */
    restart() {
        return this.play(this.currentActions, 0)
    }
}

const raf = global.requestAnimationFrame || (cb => cb())

export default EventDispatcher
