import { describe, expect, it } from 'vitest'
import { applyEffect } from '../engine/effectEngine'
import { makeState } from './helpers'

describe('effectEngine', () => {
  it('applies stat and heroine effects immutably', () => {
    const state = makeState()
    const next = applyEffect(state, { type: 'heroine_affection', heroine: 'bai_zhi', value: 5 })
    expect(next.heroineStates.bai_zhi.affection).toBe(5)
    expect(state.heroineStates.bai_zhi.affection).toBe(0)
  })
})
