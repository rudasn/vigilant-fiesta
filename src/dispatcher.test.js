import EventDispatcher from './dispatcher'

jest.useFakeTimers()

describe('EventDispatcher', () => {
    const date = Date.now()
    const eventInterval = 1000
    const events = [
        { type: 'click', timestamp: date },
        { type: 'click', timestamp: date + eventInterval },
        { type: 'click', timestamp: date + (eventInterval * 2) },
        { type: 'click', timestamp: date + (eventInterval * 3) },
        { type: 'click', timestamp: date + (eventInterval * 4) },
        { type: 'click', timestamp: date + (eventInterval * 5) },
    ]

    const trigger = event => {
        console.log('triggered', event)
        triggers.push(event.timestamp)
    }

    let triggers = []
    let dispatcher

    beforeEach(() => {
        triggers = []
    })

    test('initialize', () => {
        dispatcher = new EventDispatcher({
            trigger,
        })

        expect(dispatcher.isPaused).toBe(true)
    })

    test('play at frame 0', () => {
        dispatcher.play(events, 0)

        jest.runAllTimers()

        triggers.forEach((t, i) => {
            expect(t).toBe(date + (i * eventInterval))
        })
    })

    test('play at frame 2', () => {
        dispatcher.play(events, 2)

        jest.runAllTimers()

        triggers.forEach((t, i) => {
            expect(t).toBe(date + ((i + 2) * eventInterval))
        })
    })

    test('play at frame 0, stop at frame 2', () => {
        dispatcher.play(events, 0)

        jest.runOnlyPendingTimers()
        expect(triggers[0]).toBe(events[0].timestamp)

        jest.runOnlyPendingTimers()
        expect(triggers[1]).toBe(events[1].timestamp)

        jest.runOnlyPendingTimers()
        expect(triggers[2]).toBe(events[2].timestamp)

        dispatcher.stop()
        jest.runAllTimers()

        expect(triggers.length).toBe(3)
    })

    test('resume playing', () => {
        dispatcher.play(events)

        jest.runAllTimers()
        expect(triggers[0]).toBe(events[3].timestamp)

        triggers.forEach((t, i) => {
            expect(t).toBe(date + ((i + 3) * eventInterval))
        })
    })

    test('restart playing', () => {
        dispatcher.restart()

        jest.runAllTimers()

        triggers.forEach((t, i) => {
            expect(t).toBe(date + (i * eventInterval))
        })
    })

    test('stops playback if `trigger` throws an error', () => {
        dispatcher = new EventDispatcher({
            trigger: () => { throw 'triggerError' }
        })

        dispatcher.play(events)

        expect(() => {
            jest.runAllTimers()
        }).toThrow('triggerError')

        expect(triggers.length).toBe(0)
    })
})
