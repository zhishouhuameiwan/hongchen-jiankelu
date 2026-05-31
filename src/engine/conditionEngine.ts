import type { GameState, Requirement } from '../types/game'

export function checkRequirement(state: GameState, req: Requirement): boolean {
  switch (req.type) {
    case 'flag': return state.flags.includes(req.value)
    case 'flag_missing': return !state.flags.includes(req.value)
    case 'phase': return state.phase === req.value
    case 'day_min': return state.day >= req.value
    case 'day_max': return state.day <= req.value
    case 'stamina_min': return state.stamina >= req.value
    case 'silver_min': return state.player.silver >= req.value
    case 'has_equipped': return Object.values(state.equipment ?? {}).includes(req.cardId)
    case 'has_item': return (state.itemBag[req.itemId] ?? 0) >= (req.amount ?? 1)
    case 'heroine_affection_min': return state.heroineStates[req.heroine].affection >= req.value
    case 'heroine_belief_min': return state.heroineStates[req.heroine].belief >= req.value
    case 'heroine_stage': return state.heroineStates[req.heroine].routeStage === req.value
    case 'reputation_min': return state.player.stats.reputation >= req.value
    case 'demon_heart_min': return state.player.stats.demonHeart >= req.value
  }
}

export function checkRequirements(state: GameState, requirements: Requirement[] = []): boolean {
  return requirements.every((req) => checkRequirement(state, req))
}
