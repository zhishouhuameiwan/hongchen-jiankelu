import { describe, expect, it } from 'vitest'
import { describeEnemyIntent, playCombatCard, startCombat } from '../engine/combatEngine'
import { cardById } from '../data/cards'
import { enemyById } from '../data/enemies'
import { makeState } from './helpers'

describe('combatEngine', () => {
  it('starts combat and plays a card', () => {
    const enemy = enemyById.bandit
    const state = startCombat(makeState(), enemy)
    const next = playCombatCard(state, cardById.basic_slash)
    expect(next.currentCombat?.enemyHp).toBeLessThan(enemy.maxHp)
  })

  it('describes enemy intent for the current turn', () => {
    expect(describeEnemyIntent({ type: 'attack', amount: 6 })).toBe('攻击 6')
    expect(describeEnemyIntent({ type: 'guard', amount: 4 })).toBe('防守 4')
    expect(describeEnemyIntent({ type: 'apply_status', status: 'poison', amount: 3 })).toBe('施加 poison 3')
  })
})
