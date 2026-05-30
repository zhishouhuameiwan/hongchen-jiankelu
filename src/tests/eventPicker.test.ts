import { describe, expect, it } from 'vitest'
import { hasUnseenEventForLocation, pickEventForLocation } from '../engine/eventEngine'
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

  it('throws when no event-bearing clinic card is available instead of falling back to ordinary travel', () => {
    const base = makeState()
    const state = { ...base, player: { ...base.player, stats: { ...base.player.stats, hp: 40 } } }

    expect(() => pickEventForLocation(state, [], 'clinic')).toThrow('No unseen event available for location: clinic')
    expect(hasUnseenEventForLocation(state, [], 'clinic')).toBe(false)
  })

  it('does not repeat a seen special event or replace it with ordinary travel', () => {
    const clinicEvent = events.find((event) => event.locationId === 'clinic')!
    const base = makeState()
    const state = {
      ...base,
      flags: [`seen_${clinicEvent.id}`],
      player: { ...base.player, stats: { ...base.player.stats, hp: 40 } },
    }

    expect(() => pickEventForLocation(state, [{ ...clinicEvent, requirements: [] }], 'clinic')).toThrow('No unseen event available for location: clinic')
    expect(hasUnseenEventForLocation(state, [{ ...clinicEvent, requirements: [] }], 'clinic')).toBe(false)
  })
})
