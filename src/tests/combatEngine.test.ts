import { describe, expect, it } from 'vitest'
import { describeEnemyIntent, getTacticMatchup, playCombatCard, startCombat } from '../engine/combatEngine'
import { equipEquipmentCard } from '../engine/equipmentEngine'
import { cardById } from '../data/cards'
import { enemyById } from '../data/enemies'
import { makeState } from './helpers'

describe('combatEngine', () => {
  it('starts combat with 3 action points and four drawn cards', () => {
    const result = startCombat(makeState(), enemyById.bandit)

    expect(result.currentCombat?.actionPoints).toBe(3)
    expect(result.currentCombat?.drawnCardIds).toHaveLength(4)
  })

  it('playing a one-action card spends action points without ending the enemy turn', () => {
    const state = startCombat(makeState(), enemyById.bandit)
    const beforeTurn = state.currentCombat!.turn

    const result = playCombatCard(state, cardById.basic_slash)

    expect(result.currentCombat?.actionPoints).toBe(2)
    expect(result.currentCombat?.turn).toBe(beforeTurn)
    expect(result.currentCombat?.actionTaken).toBe(true)
    expect(result.currentCombat?.drawnCardIds.filter((id) => id === 'basic_slash')).toHaveLength(
      state.currentCombat!.drawnCardIds.filter((id) => id === 'basic_slash').length - 1,
    )
  })

  it('reports tactical advantage for movement against assault', () => {
    expect(getTacticMatchup('movement', 'assault')).toBe('advantage')
  })

  it('reduces attack damage against a guarding enemy tactic', () => {
    const state = startCombat(makeState(), enemyById.bandit)
    const guarding = {
      ...state,
      currentCombat: {
        ...state.currentCombat!,
        enemyHp: 28,
        enemyBlock: 0,
        enemyIntentOverride: { type: 'guard' as const, amount: 0, tactic: 'guard' as const },
      },
    }

    const result = playCombatCard(guarding, cardById.basic_slash)

    expect(result.currentCombat?.enemyHp).toBe(25)
    expect(result.currentCombat?.log.at(-1)).toContain('劈风斩打在守势上，伤害降低')
  })

  it('break tactics expose charging enemies to vulnerable', () => {
    const state = startCombat(makeState(), enemyById.black_market_master)
    const charging = {
      ...state,
      currentCombat: {
        ...state.currentCombat!,
        enemyStatuses: [],
        drawnCardIds: ['qingshuang_sword'],
        enemyIntentOverride: { type: 'guard' as const, amount: 0, tactic: 'charge' as const },
      },
    }

    const result = playCombatCard(charging, cardById.qingshuang_sword)

    expect(result.currentCombat?.enemyStatuses).toContainEqual({ id: 'vulnerable', amount: 1 })
    expect(result.currentCombat?.log.join('\n')).toContain('青霜一剑破开蓄势，敌人露出破绽。')
  })

  it('starts combat and plays a card', () => {
    const enemy = enemyById.bandit
    const state = startCombat(makeState(), enemy)
    const next = playCombatCard(state, cardById.basic_slash)
    expect(next.currentCombat?.enemyHp).toBeLessThan(enemy.maxHp)
  })

  it('applies equipped weapon attack bonus to player damage and combat feedback', () => {
    const enemy = enemyById.bandit
    const armed = equipEquipmentCard({ ...makeState(), deck: [...makeState().deck, 'plain_iron_sword'] }, 'plain_iron_sword')
    const state = startCombat(armed, enemy)

    const next = playCombatCard(state, cardById.basic_slash)

    expect(next.currentCombat?.enemyHp).toBe(enemy.maxHp - 8)
    expect(next.currentCombat?.lastMoment?.text).toContain('粗铁剑备战：攻击 +2')
  })

  it('uses steamed bun fullness as the next combat opening recovery bonus', () => {
    const enemy = enemyById.bandit
    const rested = {
      ...makeState(),
      player: { ...makeState().player, stats: { ...makeState().player.stats, hp: 40, innerPower: 1 } },
      itemBag: { steamed_bun: 1 },
      log: [],
    }
    const afterMeal = startCombat(rested, enemy)

    expect(afterMeal.player.stats.hp).toBe(44)
    expect(afterMeal.player.stats.innerPower).toBe(2)
    expect(afterMeal.currentCombat?.log[0]).toContain('蒸饼备战：开战恢复 4 点气血与 1 点内力')
  })

  it('describes enemy intent for the current turn', () => {
    expect(describeEnemyIntent({ type: 'attack', amount: 6 })).toBe('攻击 6')
    expect(describeEnemyIntent({ type: 'guard', amount: 4 })).toBe('防守 4')
    expect(describeEnemyIntent({ type: 'apply_status', status: 'poison', amount: 3 })).toBe('施加 poison 3')
  })
})
