import { describe, expect, it } from 'vitest'
import { pickEventForLocation } from '../engine/eventEngine'
import { events } from '../data/events'
import { makeState } from './helpers'

describe('pickEventForLocation', () => {
  it('rotates away from already seen events when alternatives are available', () => {
    const state = { ...makeState(), flags: ['seen_event_a'] }
    const townEvent = events.find((event) => event.locationId === 'town')!
    const selected = pickEventForLocation(state, [
      { ...townEvent, id: 'event_a', weight: 100, requirements: [] },
      { ...townEvent, id: 'event_b', weight: 50, requirements: [] },
    ], 'town')

    expect(selected?.id).toBe('event_b')
  })
})
