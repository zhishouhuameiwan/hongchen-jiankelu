import type { GameState } from '../types/game'
const SAVE_KEY = 'hongchen_jiankelu_save_v1'
export function saveGame(state: GameState): void { localStorage.setItem(SAVE_KEY, JSON.stringify(state)) }
export function loadGame(): GameState | null { const raw = localStorage.getItem(SAVE_KEY); if (!raw) return null; try { return JSON.parse(raw) as GameState } catch { return null } }
export function hasSavedGame(): boolean { return localStorage.getItem(SAVE_KEY) !== null }
export function clearSave(): void { localStorage.removeItem(SAVE_KEY) }
