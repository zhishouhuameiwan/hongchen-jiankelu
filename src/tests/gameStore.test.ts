import { describe, expect, it } from 'vitest'
import { locationById } from '../data/world'
import { createInitialGameState, useGameStore } from '../store/gameStore'
import type { Choice } from '../types/game'
import { startCombat } from '../engine/combatEngine'
import { enemyById } from '../data/enemies'

describe('gameStore menu flow', () => {
  it('opens new game setup without creating a playable save state', () => {
    const store = useGameStore.getState()
    store.clearSavedGame()

    store.openNewGameSetup()

    const state = useGameStore.getState().state
    expect(state).toBeNull()
    expect(useGameStore.getState().setupScreen).toBe('new_game')
  })
})

describe('gameStore exploration flow', () => {
  it('spends the destination stamina cost before entering a location event', () => {
    const store = useGameStore.getState()
    store.clearSavedGame()
    useGameStore.setState({ state: createInitialGameState('测试侠客', 'wandering_swordsman'), setupScreen: 'menu' })

    store.exploreLocation('forest')

    const state = useGameStore.getState().state!
    expect(state.currentLocationId).toBe('forest')
    expect(state.screen).toBe('event')
    expect(state.stamina).toBe(6 - locationById.forest.staminaCost)
  })

  it('automatically advances the phase when travel uses the last stamina point', () => {
    const store = useGameStore.getState()
    store.clearSavedGame()
    useGameStore.setState({ state: { ...createInitialGameState('测试侠客', 'wandering_swordsman'), stamina: locationById.forest.staminaCost }, setupScreen: 'menu' })

    store.exploreLocation('forest')

    const state = useGameStore.getState().state!
    expect(state.phase).toBe('night')
    expect(state.screen).toBe('map')
    expect(state.stamina).toBe(Math.ceil(state.maxStamina / 2))
    expect(state.currentLocationId).toBeUndefined()
    expect(state.currentEventId).toBeUndefined()
    expect(state.log).toEqual(expect.arrayContaining([expect.stringContaining('夜色渐深，江湖暗流浮现。')]))
  })

  it('does not spend travel stamina when a location no longer has an unseen event', () => {
    const store = useGameStore.getState()
    store.clearSavedGame()
    const state = createInitialGameState('测试侠客', 'wandering_swordsman')
    useGameStore.setState({ state: { ...state, flags: ['seen_town_bandit_notice_01', 'visited_weapon_stall', 'ch1_black_market_boss_defeated'] }, setupScreen: 'menu' })

    store.exploreLocation('town')

    const next = useGameStore.getState().state!
    expect(next.screen).toBe('map')
    expect(next.stamina).toBe(state.stamina)
    expect(next.currentLocationId).toBeUndefined()
    expect(next.currentEventId).toBeUndefined()
    expect(next.log.at(-1)).toBe('青石镇暂无可触发事件，先去别处看看。')
  })

  it('keeps the hero on the map and records a hint when destination stamina is insufficient', () => {
    const store = useGameStore.getState()
    store.clearSavedGame()
    useGameStore.setState({ state: { ...createInitialGameState('测试侠客', 'wandering_swordsman'), stamina: 1 }, setupScreen: 'menu' })

    store.exploreLocation('forest')

    const state = useGameStore.getState().state!
    expect(state.currentLocationId).toBeUndefined()
    expect(state.currentEventId).toBeUndefined()
    expect(state.screen).toBe('map')
    expect(state.stamina).toBe(1)
    expect(state.log.at(-1)).toBe('体力不足，无法前往黑松林。')
  })
})

describe('gameStore combat flow', () => {
  it('keeps the player turn open after playing one card until explicitly ending the turn', () => {
    const store = useGameStore.getState()
    store.clearSavedGame()
    const combatState = startCombat(createInitialGameState('测试侠客', 'wandering_swordsman'), enemyById.bandit)
    useGameStore.setState({ state: combatState, setupScreen: 'menu' })

    store.playCard('basic_slash')

    const afterCard = useGameStore.getState().state!
    expect(afterCard.currentCombat?.turn).toBe(1)
    expect(afterCard.currentCombat?.actionPoints).toBe(2)
    expect(afterCard.currentCombat?.actionTaken).toBe(true)
    expect(afterCard.currentCombat?.log).not.toContain('山道劫匪 攻击，造成 6 点伤害。')

    store.endTurn()

    const afterTurn = useGameStore.getState().state!
    expect(afterTurn.currentCombat?.turn).toBe(2)
    expect(afterTurn.currentCombat?.actionPoints).toBe(3)
    expect(afterTurn.currentCombat?.actionTaken).toBe(false)
    expect(afterTurn.currentCombat?.log).toContain('山道劫匪 攻击，造成 6 点伤害。')
  })
})

describe('gameStore event feedback', () => {
  it('automatically advances from day to night after choosing a non-combat event option and restores half stamina', () => {
    const store = useGameStore.getState()
    store.clearSavedGame()
    useGameStore.setState({ state: { ...createInitialGameState('测试侠客', 'wandering_swordsman'), stamina: 1 }, setupScreen: 'menu' })
    const choice: Choice = {
      id: 'test_day_auto_advance',
      text: '帮忙搬运货物',
      staminaCost: 1,
      effects: [{ type: 'gain_silver', value: 6 }],
    }

    store.chooseEventChoice(choice)

    const state = useGameStore.getState().state!
    expect(state.phase).toBe('night')
    expect(state.stamina).toBe(3)
    expect(state.log).toEqual(expect.arrayContaining([expect.stringContaining('夜色渐深，江湖暗流浮现。')]))
  })

  it('records a readable reward summary after choosing an event option', () => {
    const store = useGameStore.getState()
    store.clearSavedGame()
    useGameStore.setState({ state: createInitialGameState('测试侠客', 'wandering_swordsman'), setupScreen: 'menu' })
    const choice: Choice = {
      id: 'test_reward_summary',
      text: '收下谢礼',
      staminaCost: 1,
      effects: [
        { type: 'gain_silver', value: 12 },
        { type: 'gain_card', cardId: 'basic_guard' },
        { type: 'heroine_affection', heroine: 'shen_qingshuang', value: 1 },
        { type: 'stat', stat: 'demonHeart', value: 2 },
      ],
    }

    store.chooseEventChoice(choice)

    const state = useGameStore.getState().state!
    expect(state.log.at(-2)).toBe('获得：银两 +12、卡牌「横剑格挡」、沈青霜好感 +1、魔心 +2')
  })
})
