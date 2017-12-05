class EventRecorder {
    constructor(events, { extract, context=window }) {
        this.events = events
        this.capture = this.capture.bind(this)
        this.queue = []
        this.props = {
            extract,
            context,
        }
    }
    start() {
        const { events, capture } = this
        const { context } = this.props

        events.map(name =>
            context.addEventListener(name, capture)
        )
    }
    stop() {
        const { events, capture } = this
        const { context } = this.props

        events.map(name =>
            context.removeEventListener(name, capture)
        )
    }
    capture(event) {
        const { extract, context } = this.props
        const { queue } = this

        const action = extract(event, context)

        if (action) {
            console.log('capture', action.type, action)
            queue.push(action)
        }
    }
}

export default EventRecorder
