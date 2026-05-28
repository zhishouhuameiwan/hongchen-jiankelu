import { describe, expect, it } from 'vitest'
import { advancePhase, spendStamina } from '../engine/dayPhaseEngine'
import { makeState } from './helpers'

describe('dayPhaseEngine', () => {
  it('spends stamina and advances phase', () => {
    expect(spendStamina(makeState(), 2).stamina).toBe(4)
    expect(advancePhase(makeState()).phase).toBe('night')
  })

  it('restores half maximum stamina when ending daytime', () => {
    const state = { ...makeState(), phase: 'day' as const, stamina: 1, maxStamina: 7 }

    const next = advancePhase(state)

    expect(next.phase).toBe('night')
    expect(next.stamina).toBe(5)
  })

  it('does not exceed maximum stamina when daytime rest recovery is applied', () => {
    const state = { ...makeState(), phase: 'day' as const, stamina: 5, maxStamina: 6 }

    const next = advancePhase(state)

    expect(next.phase).toBe('night')
    expect(next.stamina).toBe(6)
  })
})
