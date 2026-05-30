export type Screen = 'menu' | 'new_game' | 'map' | 'event' | 'combat' | 'heroine' | 'deck' | 'ending'
export type Phase = 'day' | 'night'
export type LocationId = 'town' | 'teahouse' | 'forest' | 'clinic' | 'sword_house' | 'ruined_temple'
export type HeroineId = 'shen_qingshuang' | 'luo_hongling' | 'bai_zhi'
export type StatKey = 'hp' | 'maxHp' | 'innerPower' | 'maxInnerPower' | 'attack' | 'defense' | 'agility' | 'mind' | 'reputation' | 'demonHeart' | 'silver'

export type PlayerStats = {
  hp: number
  maxHp: number
  innerPower: number
  maxInnerPower: number
  attack: number
  defense: number
  agility: number
  mind: number
  reputation: number
  demonHeart: number
}

export type HeroineState = {
  id: HeroineId
  affection: number
  belief: number
  routeStage: number
  locked: boolean
  unlockedCards: string[]
}

export type Requirement =
  | { type: 'flag'; value: string }
  | { type: 'flag_missing'; value: string }
  | { type: 'phase'; value: Phase }
  | { type: 'day_min'; value: number }
  | { type: 'day_max'; value: number }
  | { type: 'stamina_min'; value: number }
  | { type: 'silver_min'; value: number }
  | { type: 'heroine_affection_min'; heroine: HeroineId; value: number }
  | { type: 'heroine_belief_min'; heroine: HeroineId; value: number }
  | { type: 'heroine_stage'; heroine: HeroineId; value: number }
  | { type: 'reputation_min'; value: number }
  | { type: 'demon_heart_min'; value: number }

export type Effect =
  | { type: 'set_flag'; value: string }
  | { type: 'remove_flag'; value: string }
  | { type: 'gain_silver'; value: number }
  | { type: 'gain_card'; cardId: string }
  | { type: 'gain_item'; itemId: string; amount?: number }
  | { type: 'learn_recipe'; recipeId: string }
  | { type: 'gain_cooking_exp'; value: number }
  | { type: 'heal'; value: number }
  | { type: 'damage'; value: number }
  | { type: 'stat'; stat: StatKey; value: number }
  | { type: 'heroine_affection'; heroine: HeroineId; value: number }
  | { type: 'heroine_belief'; heroine: HeroineId; value: number }
  | { type: 'heroine_stage'; heroine: HeroineId; value: number }
  | { type: 'lock_route'; heroine: HeroineId }
  | { type: 'start_combat'; enemyId: string }
  | { type: 'go_to_event'; eventId: string }
  | { type: 'increase_max_stamina'; value: number }
  | { type: 'end_game'; endingId: string }

export type Choice = { id: string; text: string; staminaCost: number; requirements?: Requirement[]; effects: Effect[] }
export type GameEvent = { id: string; title: string; phase: Phase | 'any'; locationId: LocationId; weight: number; requirements: Requirement[]; text: string; choices: Choice[] }

export type ItemEffect =
  | { type: 'heal'; value: number }
  | { type: 'restore_stamina'; value: number }
  | { type: 'restore_inner_power'; value: number }

export type ItemCategory = 'consumable' | 'food' | 'ingredient' | 'quest'
export type ItemDefinition = { id: string; name: string; category: ItemCategory; description: string; effects: ItemEffect[]; source: string }
export type CookingState = { knownRecipes: string[]; exp: number }
export type CookingIngredient = { itemId: string; amount: number }
export type CookingRecipe = { id: string; name: string; outputItemId: string; ingredients: CookingIngredient[]; requiredLevel: number; expGain: number; description: string }

export type EquipmentSlot = 'weapon' | 'armor' | 'boots' | 'accessory'
export type EquipmentBonus = { stat: Exclude<StatKey, 'silver'>; value: number }
export type CardType = 'attack' | 'defense' | 'inner' | 'movement' | 'trick' | 'romance' | 'demonic' | 'equipment'
export type CardEffect =
  | { type: 'damage'; amount: number }
  | { type: 'block'; amount: number }
  | { type: 'heal'; amount: number }
  | { type: 'gain_inner_power'; amount: number }
  | { type: 'apply_status'; status: string; amount: number }
  | { type: 'draw'; amount: number }
  | { type: 'gain_demon_heart'; amount: number }
export type CardDefinition = { id: string; name: string; type: CardType; costInnerPower: number; description: string; effects: CardEffect[]; source: string; equipmentSlot?: EquipmentSlot; bonuses?: EquipmentBonus[] }

export type EnemyIntent = { type: 'attack'; amount: number } | { type: 'guard'; amount: number } | { type: 'apply_status'; status: string; amount: number }
export type EnemyDefinition = { id: string; name: string; maxHp: number; attack: number; defense: number; intents: EnemyIntent[]; rewardCardPool: string[]; rewardSilver: number }
export type CombatStatus = { id: string; amount: number }
export type CombatMoment = { type: 'enemy_hit' | 'player_hit' | 'poison' | 'heal' | 'guard' | 'status'; text: string }
export type CombatState = { enemyId: string; enemyHp: number; playerBlock: number; enemyBlock: number; turn: number; drawnCardIds: string[]; playerStatuses: CombatStatus[]; enemyStatuses: CombatStatus[]; log: string[]; lastMoment?: CombatMoment; actionTaken?: boolean; result?: 'victory' | 'defeat' }

export type GameState = {
  screen: Screen
  day: number
  phase: Phase
  stamina: number
  maxStamina: number
  playerName: string
  player: { stats: PlayerStats; silver: number; backgroundId: string }
  deck: string[]
  equipment: Partial<Record<EquipmentSlot, string>>
  equipmentBag: string[]
  itemBag: Record<string, number>
  cooking: CookingState
  flags: string[]
  heroineStates: Record<HeroineId, HeroineState>
  currentLocationId?: LocationId
  currentEventId?: string
  currentCombat?: CombatState
  endingId?: string
  log: string[]
}

export type HeroineDefinition = { id: HeroineId; name: string; title: string; faction: string; theme: string; description: string; mechanicName: string }
export type LocationInfo = { id: LocationId; name: string; dayDescription: string; nightDescription: string; staminaCost: number }
export type EndingDefinition = { id: string; title: string; priority: number; requirements: Requirement[]; text: string }
