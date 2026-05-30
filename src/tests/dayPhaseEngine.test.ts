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
    expect(next.log.at(-1)).toBe('夜色渐深，江湖暗流浮现。体力恢复 4 点（1→5）。')
  })

  it('does not exceed maximum stamina when daytime rest recovery is applied', () => {
    const state = { ...makeState(), phase: 'day' as const, stamina: 5, maxStamina: 6 }

    const next = advancePhase(state)

    expect(next.phase).toBe('night')
    expect(next.stamina).toBe(6)
  })

  it('announces a new daytime and full stamina recovery when night ends', () => {
    const state = {
      ...makeState(),
      day: 2,
      phase: 'night' as const,
      stamina: 1,
      maxStamina: 7,
      player: { ...makeState().player, stats: { ...makeState().player.stats, innerPower: 0, maxInnerPower: 4 } },
    }

    const next = advancePhase(state)

    expect(next.day).toBe(3)
    expect(next.phase).toBe('day')
    expect(next.stamina).toBe(7)
    expect(next.player.stats.innerPower).toBe(4)
    expect(next.log.at(-1)).toBe('第 3 天，晨光照入窗棂。体力恢复 6 点（1→7），内力已回满。')
  })
})
