import type { CombatState, GameState } from '../types/game'

export const CURRENT_SAVE_VERSION = 2
const SAVE_KEY = 'hongchen_jiankelu_save_v1'

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function migrateCombat(combat: unknown): CombatState | undefined {
  if (!isObject(combat)) return undefined
  return {
    ...(combat as unknown as CombatState),
    actionPoints: typeof combat.actionPoints === 'number' ? combat.actionPoints : 3,
    drawnCardIds: Array.isArray(combat.drawnCardIds) ? combat.drawnCardIds as string[] : [],
    playerStatuses: Array.isArray(combat.playerStatuses) ? combat.playerStatuses as CombatState['playerStatuses'] : [],
    enemyStatuses: Array.isArray(combat.enemyStatuses) ? combat.enemyStatuses as CombatState['enemyStatuses'] : [],
    log: Array.isArray(combat.log) ? combat.log as string[] : [],
    actionTaken: typeof combat.actionTaken === 'boolean' ? combat.actionTaken : false,
  }
}

export function migrateSaveState(rawState: unknown): GameState | null {
  if (!isObject(rawState) || !isObject(rawState.player) || typeof rawState.playerName !== 'string') return null

  const state = rawState as Partial<GameState> & Record<string, unknown>
  const migrated: GameState = {
    ...(state as GameState),
    saveVersion: CURRENT_SAVE_VERSION,
    equipment: isObject(state.equipment) ? state.equipment as GameState['equipment'] : {},
    equipmentBag: Array.isArray(state.equipmentBag) ? state.equipmentBag as string[] : [],
    itemBag: isObject(state.itemBag) ? state.itemBag as Record<string, number> : {},
    cooking: isObject(state.cooking) && Array.isArray(state.cooking.knownRecipes) && typeof state.cooking.exp === 'number'
      ? state.cooking as GameState['cooking']
      : { knownRecipes: ['steamed_bun'], exp: 0 },
    flags: Array.isArray(state.flags) ? state.flags as string[] : [],
    log: Array.isArray(state.log) ? state.log as string[] : [],
    currentCombat: state.currentCombat ? migrateCombat(state.currentCombat) : undefined,
  }
  return migrated
}

export function saveGame(state: GameState): void {
  localStorage.setItem(SAVE_KEY, JSON.stringify({ ...state, saveVersion: CURRENT_SAVE_VERSION }))
}

export function loadGame(): GameState | null {
  const raw = localStorage.getItem(SAVE_KEY)
  if (!raw) return null
  try {
    const migrated = migrateSaveState(JSON.parse(raw))
    if (!migrated) localStorage.removeItem(SAVE_KEY)
    return migrated
  } catch {
    localStorage.removeItem(SAVE_KEY)
    return null
  }
}

export function hasSavedGame(): boolean {
  return localStorage.getItem(SAVE_KEY) !== null
}

export function clearSave(): void {
  localStorage.removeItem(SAVE_KEY)
}
