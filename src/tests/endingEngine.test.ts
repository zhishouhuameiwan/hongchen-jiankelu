import { describe, expect, it } from 'vitest'
import { chooseEnding } from '../engine/endingEngine'
import { endings } from '../data/endings'
import { makeState } from './helpers'

describe('endingEngine', () => {
  it('chooses demon ending by priority', () => {
    const state = makeState()
    state.player.stats.demonHeart = 10
    expect(chooseEnding(state, endings).id).toBe('demon_fall')
  })

  it('chooses a heroine good ending when affection and route resolution are both complete', () => {
    const state = makeState()
    state.heroineStates.bai_zhi.affection = 32
    state.flags.push('blood_river_cured')

    expect(chooseEnding(state, endings).id).toBe('bai_zhi_good')
  })

  it('falls back to nameless wanderer when the final deadline passes without a resolved main goal', () => {
    const state = makeState()
    state.player.stats.reputation = 4
    state.player.stats.demonHeart = 2

    expect(chooseEnding(state, endings).id).toBe('nameless_wanderer')
  })
})
