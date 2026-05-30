import { describe, expect, it } from 'vitest'
import { applyEffects } from '../engine/effectEngine'
import { canChooseChoice } from '../engine/eventEngine'
import { makeState } from './helpers'
import type { Choice } from '../types/game'

describe('route lock and reward effects', () => {
  it('locks the chosen heroine route and marks competing routes as locked', () => {
    const next = applyEffects(makeState(), [{ type: 'lock_route', heroine: 'shen_qingshuang' }])

    expect(next.flags).toContain('route_locked_shen_qingshuang')
    expect(next.heroineStates.shen_qingshuang.locked).toBe(false)
    expect(next.heroineStates.luo_hongling.locked).toBe(true)
    expect(next.heroineStates.bai_zhi.locked).toBe(true)
  })

  it('records route reward cards on heroine state when gained from a heroine source', () => {
    const next = applyEffects(makeState(), [{ type: 'gain_card', cardId: 'qingshuang_sword' }])

    expect(next.deck).toContain('qingshuang_sword')
    expect(next.heroineStates.shen_qingshuang.unlockedCards).toContain('qingshuang_sword')
  })

  it('routes equipment rewards into the equipment bag instead of combat deck', () => {
    const next = applyEffects(makeState(), [{ type: 'gain_card', cardId: 'plain_iron_sword' }])

    expect(next.equipmentBag).toContain('plain_iron_sword')
    expect(next.deck).not.toContain('plain_iron_sword')
  })

  it('prevents unaffordable silver choices from being selected', () => {
    const choice: Choice = {
      id: 'buy_blade',
      text: '购入寒铁刀',
      staminaCost: 1,
      requirements: [{ type: 'silver_min', value: 20 }],
      effects: [{ type: 'gain_silver', value: -20 }],
    }
    const poor = { ...makeState(), player: { ...makeState().player, silver: 19 } }
    const enough = { ...makeState(), player: { ...makeState().player, silver: 20 } }

    expect(canChooseChoice(poor, choice)).toBe(false)
    expect(canChooseChoice(enough, choice)).toBe(true)
  })
})
