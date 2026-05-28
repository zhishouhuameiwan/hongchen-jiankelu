import { describe, expect, it } from 'vitest'
import { advancePhase, spendStamina } from '../engine/dayPhaseEngine'
import { makeState } from './helpers'

describe('dayPhaseEngine', () => {
  it('spends stamina and advances phase', () => {
    expect(spendStamina(makeState(), 2).stamina).toBe(4)
    expect(advancePhase(makeState()).phase).toBe('night')
  })
})
