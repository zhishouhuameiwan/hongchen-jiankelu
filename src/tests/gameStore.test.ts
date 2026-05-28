import { describe, expect, it } from 'vitest'
import { locationById } from '../data/world'
import { createInitialGameState, useGameStore } from '../store/gameStore'
import type { Choice } from '../types/game'

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

describe('gameStore event feedback', () => {
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
    expect(state.log.at(-1)).toBe('获得：银两 +12、卡牌「横剑格挡」、沈青霜好感 +1、魔心 +2')
  })
})
