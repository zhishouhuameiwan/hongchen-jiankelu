import { describe, expect, it } from 'vitest'
import { applyEffects } from '../engine/effectEngine'
import { makeState } from './helpers'

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
})
