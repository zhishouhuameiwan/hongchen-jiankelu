import { afterEach, describe, expect, it } from 'vitest'
import { createInitialGameState } from '../store/gameStore'
import { CURRENT_SAVE_VERSION, hasSavedGame, loadGame, saveGame } from '../engine/saveEngine'

const saveKey = 'hongchen_jiankelu_save_v1'

afterEach(() => {
  localStorage.clear()
})

describe('save engine versioning and recovery', () => {
  it('writes the current save version into persisted saves', () => {
    const state = createInitialGameState('测试侠客', 'wandering_swordsman')

    saveGame(state)

    const raw = localStorage.getItem(saveKey)
    expect(raw).not.toBeNull()
    expect(JSON.parse(raw!)).toMatchObject({ saveVersion: CURRENT_SAVE_VERSION })
  })

  it('migrates legacy saves with missing optional systems and combat action points', () => {
    const state = createInitialGameState('旧档侠客', 'fallen_noble') as unknown as Record<string, unknown>
    delete state.equipmentBag
    delete state.itemBag
    delete state.cooking
    state.currentCombat = {
      enemyId: 'bandit',
      enemyHp: 20,
      playerBlock: 0,
      enemyBlock: 0,
      turn: 1,
      drawnCardIds: ['basic_slash'],
      playerStatuses: [],
      enemyStatuses: [],
      log: ['旧版本战斗中。'],
    }
    localStorage.setItem(saveKey, JSON.stringify(state))

    const loaded = loadGame()

    expect(loaded).not.toBeNull()
    expect((loaded as Record<string, unknown>).saveVersion).toBe(CURRENT_SAVE_VERSION)
    expect(loaded!.equipmentBag).toEqual([])
    expect(loaded!.itemBag).toEqual({})
    expect(loaded!.cooking).toEqual({ knownRecipes: ['steamed_bun'], exp: 0 })
    expect(loaded!.currentCombat!.actionPoints).toBe(3)
    expect(loaded!.currentCombat!.actionTaken).toBe(false)
  })

  it('clears corrupt saves instead of leaving a broken continue button', () => {
    localStorage.setItem(saveKey, '{not valid json')

    expect(loadGame()).toBeNull()
    expect(hasSavedGame()).toBe(false)
    expect(localStorage.getItem(saveKey)).toBeNull()
  })
})
