class EventDispatcher {
    constructor({ trigger, context=window }) {
        this.props = {
            trigger,
            context,
        }
        this.isPaused = true
        this.currentFrame = 0
        this.currentActions = []
    }
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
            requestAnimationFrame(() => {
                try {
                    trigger(next, context)
                } catch(e) {
                    console.error(`Error triggering event "${ next.type }"`)
                    console.error(e)
                }

                this.dispatch(actions, ++frame)
            })
        }, timeout)
    }
    play(actions, frame) {
        this.isPaused = false
        this.dispatch(actions, frame)
        console.log('play', frame)
    }
    stop() {
        this.isPaused = true
        console.log('stop')
    }
    restart() {
        this.play(this.currentActions, 0)
    }
}

export default EventDispatcher
