import EventRecorder from './recorder'

const dummyWindowObject = () => {
    let events = []
    return {
        _getListeners: () => events,
        _trigger: (type, props={}) => {
            events.filter(e => e.type === type).forEach(e => {
                e.callback({
                    type,
                    ...props,
                })
            })
        },
        addEventListener: (type, callback) => {
            events.push({ type, callback })
        },
        removeEventListener: (type, callback) => {
            events = events.filter(e =>
                !(e.type === type && e.callback === callback)
            )
        },
    }
}

describe('EventRecorder', () => {
    const context = dummyWindowObject()
    const eventTypes = [ 'click', 'mousemove', ]

    let recorder

    test('initialize', () => {
        recorder = new EventRecorder(eventTypes, {
            context,
            extract: event => eventTypes.indexOf(event.type) > -1 ? event : null
        })

        expect(recorder.queue.length).toBe(0)
    })

    test('start', () => {
        recorder.start()

        expect(context._getListeners().length).toBe(eventTypes.length)
    })

    test('capture (click)', () => {
        const timeStamp = Date.now()

        context._trigger('click', { timeStamp })

        expect(recorder.queue[0]).toMatchObject({
            type: 'click',
            timeStamp,
        })
    })

    test('capture (mousemove)', () => {
        context._trigger('mousemove')

        expect(recorder.queue[1]).toMatchObject({
            type: 'mousemove'
        })
    })

    test('capture (unknown event)', () => {
        context._trigger('blablabla')

        expect(recorder.queue.length).toBe(2)
    })

    test('stop', () => {
        recorder.stop()

        expect(context._getListeners().length).toBe(0)
    })
})
