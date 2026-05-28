import { describe, expect, it } from 'vitest'
import { checkRequirement } from '../engine/conditionEngine'
import { makeState } from './helpers'

describe('conditionEngine', () => {
  it('checks flags and day', () => {
    const state = { ...makeState(), flags: ['x'], day: 3 }
    expect(checkRequirement(state, { type: 'flag', value: 'x' })).toBe(true)
    expect(checkRequirement(state, { type: 'flag_missing', value: 'y' })).toBe(true)
    expect(checkRequirement(state, { type: 'day_min', value: 2 })).toBe(true)
  })
})
