import { create } from 'zustand'
import { starterDeck } from '../data/cards'
import type { Choice, EquipmentSlot, GameState, LocationId } from '../types/game'
import { applyChoice } from '../engine/eventEngine'
import { useItem } from '../engine/itemEngine'
import { cookRecipe } from '../engine/cookingEngine'
import { advancePhase } from '../engine/dayPhaseEngine'
import { clearSave, hasSavedGame, loadGame, saveGame } from '../engine/saveEngine'
import { chooseEnding } from '../engine/endingEngine'
import { endings } from '../data/endings'
import { events } from '../data/events'
import { enemyById } from '../data/enemies'
import { cardById } from '../data/cards'
import { endPlayerTurn, playCombatCard } from '../engine/combatEngine'
import { hasUnseenEventForLocation, pickEventForLocation } from '../engine/eventEngine'
import { locationById } from '../data/world'
import { equipEquipmentCard, unequipEquipmentCard } from '../engine/equipmentEngine'

export type GameStore = {
  state: GameState | null
  setupScreen: 'menu' | 'new_game'
  hasSave: boolean
  openNewGameSetup: () => void
  startNewGame: (name: string, backgroundId: string) => void
  loadSavedGame: () => boolean
  clearSavedGame: () => void
  go: (screen: GameState['screen']) => void
  exploreLocation: (locationId: LocationId) => void
  setCurrentLocation: (locationId: LocationId) => void
  setCurrentEvent: (eventId: string) => void
  chooseEventChoice: (choice: Choice) => void
  advancePhase: () => void
  playCard: (cardId: string) => void
  equipCard: (cardId: string) => void
  unequipSlot: (slot: EquipmentSlot) => void
  useItem: (itemId: string) => void
  cookRecipe: (recipeId: string) => void
  endTurn: () => void
  finishCombat: (rewardCardId?: string) => void
}

export function createInitialGameState(name: string, backgroundId: string): GameState {
  return {
    screen: 'map', day: 1, phase: 'day', stamina: 6, maxStamina: 6, playerName: name || '无名侠客',
    player: { backgroundId, silver: backgroundId === 'fallen_noble' ? 40 : 20, stats: { hp: backgroundId === 'medicine_apprentice' ? 70 : 60, maxHp: backgroundId === 'medicine_apprentice' ? 70 : 60, innerPower: 3, maxInnerPower: 3, attack: backgroundId === 'wandering_swordsman' ? 6 : 5, defense: 2, agility: backgroundId === 'street_survivor' ? 3 : 2, mind: 5, reputation: backgroundId === 'street_survivor' ? -1 : 0, demonHeart: 0 } },
    deck: [...starterDeck], equipment: {}, equipmentBag: [], itemBag: {}, cooking: { knownRecipes: ['steamed_bun'], exp: 0 }, flags: [],
    heroineStates: {
      shen_qingshuang: { id: 'shen_qingshuang', affection: 0, belief: 0, routeStage: 0, locked: false, unlockedCards: [] },
      luo_hongling: { id: 'luo_hongling', affection: 0, belief: 0, routeStage: 0, locked: false, unlockedCards: [] },
      bai_zhi: { id: 'bai_zhi', affection: 0, belief: 0, routeStage: 0, locked: false, unlockedCards: [] },
    },
    log: ['你踏入江湖的第一天，茶馆里正流传着《血河经》重现的传闻。'],
  }
}

function persist(state: GameState) { saveGame(state); return state }

export const useGameStore = create<GameStore>((set, get) => ({
  state: null,
  setupScreen: 'menu',
  hasSave: hasSavedGame(),
  openNewGameSetup: () => set({ setupScreen: 'new_game' }),
  startNewGame: (name, backgroundId) => set({ state: persist(createInitialGameState(name, backgroundId)), setupScreen: 'menu', hasSave: true }),
  loadSavedGame: () => { const saved = loadGame(); if (!saved) { set({ hasSave: false }); return false }; set({ state: saved, setupScreen: 'menu', hasSave: true }); return true },
  clearSavedGame: () => { clearSave(); set({ state: null, setupScreen: 'menu', hasSave: false }) },
  go: (screen) => { const state = get().state; if (state) set({ state: persist({ ...state, screen }) }) },
  exploreLocation: (locationId) => {
    const state = get().state
    if (!state) return
    const location = locationById[locationId]
    if (state.stamina < location.staminaCost) {
      set({ state: persist({ ...state, log: [...state.log, `体力不足，无法前往${location.name}。`] }) })
      return
    }
    if (!hasUnseenEventForLocation(state, events, locationId)) {
      set({ state: persist({ ...state, log: [...state.log, `${location.name}暂无可触发事件，先去别处看看。`] }) })
      return
    }
    const event = pickEventForLocation(state, events, locationId)
    const afterTravel = { ...state, stamina: state.stamina - location.staminaCost, currentLocationId: locationId, currentEventId: event?.id, screen: event ? 'event' as const : 'map' as const }
    set({ state: persist(afterTravel.stamina === 0 ? advancePhase(afterTravel) : afterTravel) })
  },
  setCurrentLocation: (locationId) => { const state = get().state; if (state) set({ state: persist({ ...state, currentLocationId: locationId }) }) },
  setCurrentEvent: (eventId) => { const state = get().state; if (state) set({ state: persist({ ...state, currentEventId: eventId, screen: 'event' }) }) },
  chooseEventChoice: (choice) => {
    const state = get().state
    if (!state) return
    const afterChoice = applyChoice(state, choice)
    if (afterChoice.screen === 'map' && !afterChoice.currentCombat && !afterChoice.endingId) {
      set({ state: persist(advancePhase(afterChoice)) })
      return
    }
    set({ state: persist(afterChoice) })
  },
  advancePhase: () => { const state = get().state; if (state) set({ state: persist(advancePhase(state)) }) },
  playCard: (cardId) => {
    const state = get().state
    if (!state?.currentCombat || state.currentCombat.result) return
    const afterCard = playCombatCard(state, cardById[cardId])
    set({ state: persist(afterCard) })
  },
  equipCard: (cardId) => { const state = get().state; if (state) set({ state: persist(equipEquipmentCard(state, cardId)) }) },
  unequipSlot: (slot) => { const state = get().state; if (state) set({ state: persist(unequipEquipmentCard(state, slot)) }) },
  useItem: (itemId) => { const state = get().state; if (state) set({ state: persist(useItem(state, itemId)) }) },
  cookRecipe: (recipeId) => { const state = get().state; if (state) set({ state: persist(cookRecipe(state, recipeId)) }) },
  endTurn: () => { const state = get().state; if (!state?.currentCombat || state.currentCombat.result) return; set({ state: persist(endPlayerTurn(state, enemyById[state.currentCombat.enemyId])) }) },
  finishCombat: (rewardCardId) => {
    const state = get().state; if (!state?.currentCombat) return
    if (state.currentCombat.result === 'victory') {
      const enemy = enemyById[state.currentCombat.enemyId]
      const rewardCard = rewardCardId ?? enemy.rewardCardPool[0]
      const gainedNewCard = !state.deck.includes(rewardCard)
      const chapterOneBossVictory = enemy.id === 'ch1_black_market_boss'
      const chapterOneFlags = chapterOneBossVictory ? ['ch1_black_market_boss_defeated', 'blood_river_fragment_found'] : []
      const chapterOneLogs = chapterOneBossVictory ? ['第一章完成：你击败黑市小头目，夺回血河经残页。'] : []
      const gainLogs = [`战斗胜利，获得 ${enemy.rewardSilver} 两与 ${cardById[rewardCard]?.name ?? rewardCard}。`, ...(gainedNewCard ? [`新卡入库：${cardById[rewardCard]?.name ?? rewardCard}。去卡组查看。`] : []), '获得物品：小还丹。', ...chapterOneLogs]
      const nextFlags = [...state.flags, ...chapterOneFlags.filter((flag) => !state.flags.includes(flag))]
      const next = { ...state, screen: 'map' as const, currentCombat: undefined, currentEventId: undefined, currentLocationId: undefined, flags: nextFlags, deck: gainedNewCard ? [...state.deck, rewardCard] : state.deck, itemBag: { ...state.itemBag, small_healing_pill: (state.itemBag.small_healing_pill ?? 0) + 1 }, player: { ...state.player, silver: state.player.silver + enemy.rewardSilver }, log: [...state.log, ...gainLogs] }
      set({ state: persist(advancePhase(next)) })
    } else {
      const ending = chooseEnding({ ...state, player: { ...state.player, stats: { ...state.player.stats, hp: 0 } } }, endings)
      set({ state: persist({ ...state, endingId: ending.id, screen: 'ending' }) })
    }
  },
}))
