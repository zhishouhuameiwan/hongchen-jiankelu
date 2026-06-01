import { describe, expect, it } from 'vitest'
import { endPlayerTurn, playCombatCard, startCombat } from '../engine/combatEngine'
import { cardById } from '../data/cards'
import { enemyById } from '../data/enemies'
import { makeState } from './helpers'

describe('combat turn flow', () => {
  it('spends action points across multiple card actions before the turn advances', () => {
    const enemy = enemyById.bandit
    const state = startCombat(makeState(), enemy)
    const afterFirst = playCombatCard(state, cardById.basic_slash)
    const afterSecond = playCombatCard(afterFirst, cardById.basic_guard)

    expect(afterFirst.currentCombat?.actionTaken).toBe(true)
    expect(afterFirst.currentCombat?.actionPoints).toBe(2)
    expect(afterSecond.currentCombat?.turn).toBe(1)
    expect(afterSecond.currentCombat?.actionPoints).toBe(1)
    expect(afterSecond.currentCombat?.playerBlock).toBe(9)

    const afterEndTurn = endPlayerTurn(afterSecond, enemy)
    expect(afterEndTurn.currentCombat?.turn).toBe(2)
    expect(afterEndTurn.currentCombat?.actionPoints).toBe(3)
    expect(afterEndTurn.currentCombat?.actionTaken).toBe(false)
  })

  it('records visible combat moments for striking, being hit, poison, and healing', () => {
    const enemy = enemyById.black_market_master
    const wounded = {
      ...makeState(),
      deck: ['basic_slash', 'red_lotus_poison', 'silver_needle'],
      player: { ...makeState().player, stats: { ...makeState().player.stats, hp: 40, innerPower: 3 } },
    }
    const started = startCombat(wounded, enemy)
    const combat = {
      ...started,
      currentCombat: {
        ...started.currentCombat!,
        turn: 2,
        drawnCardIds: ['basic_slash', 'red_lotus_poison', 'silver_needle'],
      },
    }

    const afterAttack = playCombatCard(combat, cardById.basic_slash)
    expect(afterAttack.currentCombat?.lastMoment).toEqual({ type: 'enemy_hit', text: '劈风斩命中黑市高手，造成 6 点伤害。' })

    const afterEnemyHit = endPlayerTurn(afterAttack, enemy)
    const enemyHitMoment = afterEnemyHit.currentCombat?.lastMoment
    expect(enemyHitMoment).toEqual({ type: 'player_hit', text: '黑市高手击中你，造成 11 点伤害。' })

    const readyForPoison = { ...afterEnemyHit, player: { ...afterEnemyHit.player, stats: { ...afterEnemyHit.player.stats, innerPower: 3 } } }
    const afterPoison = playCombatCard(readyForPoison, cardById.red_lotus_poison)
    expect(afterPoison.currentCombat?.lastMoment).toEqual({ type: 'poison', text: '黑市高手身中中毒 4 层。' })

    const nextTurn = { ...afterPoison, player: { ...afterPoison.player, stats: { ...afterPoison.player.stats, innerPower: 3 } }, currentCombat: { ...afterPoison.currentCombat!, actionTaken: false } }
    const afterHeal = playCombatCard(nextTurn, cardById.silver_needle)
    expect(afterHeal.currentCombat?.lastMoment).toEqual({ type: 'heal', text: '银针续命为你治疗 10 点气血。' })
  })
})
