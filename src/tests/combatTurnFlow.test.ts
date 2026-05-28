import { describe, expect, it } from 'vitest'
import { endPlayerTurn, playCombatCard, startCombat } from '../engine/combatEngine'
import { cardById } from '../data/cards'
import { enemyById } from '../data/enemies'
import { makeState } from './helpers'

describe('combat turn flow', () => {
  it('lets player play multiple cards before ending turn', () => {
    const enemy = enemyById.bandit
    const state = startCombat(makeState(), enemy)
    const afterFirst = playCombatCard(state, cardById.basic_slash)
    const afterSecond = playCombatCard(afterFirst, cardById.basic_guard)

    expect(afterSecond.currentCombat?.turn).toBe(1)
    expect(afterSecond.currentCombat?.playerBlock).toBeGreaterThan(0)

    const afterEndTurn = endPlayerTurn(afterSecond, enemy)
    expect(afterEndTurn.currentCombat?.turn).toBe(2)
  })
})
