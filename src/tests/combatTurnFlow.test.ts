import { describe, expect, it } from 'vitest'
import { endPlayerTurn, playCombatCard, startCombat } from '../engine/combatEngine'
import { cardById } from '../data/cards'
import { enemyById } from '../data/enemies'
import { makeState } from './helpers'

describe('combat turn flow', () => {
  it('allows only one card action before the turn advances', () => {
    const enemy = enemyById.bandit
    const state = startCombat(makeState(), enemy)
    const afterFirst = playCombatCard(state, cardById.basic_slash)
    const afterSecond = playCombatCard(afterFirst, cardById.basic_guard)

    expect(afterFirst.currentCombat?.actionTaken).toBe(true)
    expect(afterSecond.currentCombat?.turn).toBe(1)
    expect(afterSecond.currentCombat?.playerBlock).toBe(0)
    expect(afterSecond.currentCombat?.log.at(-1)).toBe('本回合已行动。')

    const afterEndTurn = endPlayerTurn(afterSecond, enemy)
    expect(afterEndTurn.currentCombat?.turn).toBe(2)
    expect(afterEndTurn.currentCombat?.actionTaken).toBe(false)
  })
})
