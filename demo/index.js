import EventDispatcher from '../src/dispatcher'
import EventRecorder from '../src/recorder'

/* `tracked` is an iframe containing the webpage we want to track.
 */
const tracked = document.getElementById('tracked')

/*
 * Initialize a new EventRecorder instance to track three types of events
 * - mousemove
 * - click
 * - scroll
 * When those events are triggered use the `extract` method provided to
 * extract the data & meta-data we need for each of those events.
 * Use the contentWindow of the `tracked` iframe as the context of the recorder.
 */
const recorder = new EventRecorder([
    'mousemove',
    'click',
    'scroll',
    'resize',
], {
    extract,
    context: tracked.contentWindow,
})

function extract(event, context) {
    switch(event.type) {
        case 'scroll':
            return {
                type: event.type,
                timestamp: event.timestamp || event.timeStamp,
                scrollY: context.scrollY,
                scrollX: context.scrollX,
            }
        case 'resize':
            return {
                type: event.type,
                timestamp: event.timestamp || event.timeStamp,
                width: context.innerWidth,
                height: context.innerHeight,
            }
        case 'click':
        case 'mousemove':
            return {
                type: event.type,
                clientX: event.clientX,
                clientY: event.clientY,
                timestamp: event.timestamp || event.timeStamp,
            }
    }
}

/*
 * Create new EventDispatcher instance to replay our captured events.
 * Use the provided `trigger` function to determine how each type of event
 * is to be replayed on the webpage.
 * Like above, set the context to be the contentWindow of our tracked iframe.
 */
const player = new EventDispatcher({
    trigger,
    context: tracked.contentWindow,
})

function trigger(event, context) {
    let cursor = context.document.getElementById('cursor')
    if (!cursor) {
        cursor = context.document.createElement('div')
        cursor.id = 'cursor'
        cursor.style.backgroundColor = 'red'
        cursor.style.position = 'fixed'
        cursor.style.width = '15px'
        cursor.style.height = '15px'
        context.document.body.appendChild(cursor)
    }
    switch(event.type) {
        case 'mousemove':
            // todo: use CSS transitions, use GPU off main thread
            cursor.style.top = (event.clientY) + 'px'
            cursor.style.left = (event.clientX) + 'px'
            break
        case 'click':
            const clone = cursor.cloneNode()
            clone.removeAttribute('id')
            clone.style.position = 'absolute'
            clone.style.top = (context.scrollY + event.clientY) + 'px'
            clone.style.left = (context.scrollX + event.clientX) + 'px'
            context.document.body.appendChild(clone)
            break
        case 'scroll':
            context.scrollTo(event.scrollX, event.scrollY)
            break
    }
}

/*
 * Provide some helper methods so that the user can easily start/pause
 * recordings.
 */
window.play = () => {
    tracked.contentWindow.scrollTo(0, 0)
    recorder.stop()
    player.play(recorder.queue)
}

window.pause = () => {
    player.stop()
}

window.record = () => {
    player.stop()
    recorder.start()
}
window.restart = () => {
    player.restart()
}
