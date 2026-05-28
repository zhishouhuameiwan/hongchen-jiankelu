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
})
