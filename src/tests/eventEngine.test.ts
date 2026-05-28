import { describe, expect, it } from 'vitest'
import { getAvailableEvents } from '../engine/eventEngine'
import { events } from '../data/events'
import { makeState } from './helpers'

describe('eventEngine', () => {
  it('finds teahouse rumor event', () => {
    const found = getAvailableEvents(makeState(), events, 'teahouse')
    expect(found[0].id).toBe('teahouse_blood_river_rumor_01')
  })
})
