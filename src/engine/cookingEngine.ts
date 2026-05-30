import type { CookingRecipe, GameState } from '../types/game'
import { itemById } from '../data/items'

export const cookingRecipes: CookingRecipe[] = [
  {
    id: 'steamed_bun',
    name: '蒸饼',
    outputItemId: 'steamed_bun',
    ingredients: [{ itemId: 'wheat_flour', amount: 1 }, { itemId: 'spring_water', amount: 1 }],
    requiredLevel: 1,
    expGain: 3,
    description: '麦粉和山泉水蒸出的饱腹点心。',
  },
  {
    id: 'herb_chicken_soup',
    name: '药膳鸡汤',
    outputItemId: 'herb_chicken_soup',
    ingredients: [{ itemId: 'young_chicken', amount: 1 }, { itemId: 'wild_herb', amount: 1 }, { itemId: 'spring_water', amount: 1 }],
    requiredLevel: 2,
    expGain: 6,
    description: '江湖郎中常做的温补药膳。',
  },
]

export const recipeById = Object.fromEntries(cookingRecipes.map((recipe) => [recipe.id, recipe])) as Record<string, CookingRecipe>

export function getCookingLevel(state: GameState): number {
  return Math.max(1, Math.floor(state.cooking.exp / 10) + 1)
}

export function learnRecipe(state: GameState, recipeId: string): GameState {
  if (!recipeById[recipeId] || state.cooking.knownRecipes.includes(recipeId)) return state
  return { ...state, cooking: { ...state.cooking, knownRecipes: [...state.cooking.knownRecipes, recipeId] }, log: [...state.log, `学会菜谱：${recipeById[recipeId].name}。`] }
}

export function canCookRecipe(state: GameState, recipeId: string): boolean {
  const recipe = recipeById[recipeId]
  if (!recipe) return false
  if (!state.cooking.knownRecipes.includes(recipeId)) return false
  if (getCookingLevel(state) < recipe.requiredLevel) return false
  return recipe.ingredients.every((ingredient) => (state.itemBag[ingredient.itemId] ?? 0) >= ingredient.amount)
}

export function getKnownRecipes(state: GameState): CookingRecipe[] {
  const level = getCookingLevel(state)
  return state.cooking.knownRecipes
    .map((recipeId) => recipeById[recipeId])
    .filter((recipe): recipe is CookingRecipe => Boolean(recipe) && recipe.requiredLevel <= level)
}

export function cookRecipe(state: GameState, recipeId: string): GameState {
  const recipe = recipeById[recipeId]
  if (!recipe || !canCookRecipe(state, recipeId) || !itemById[recipe.outputItemId]) return state

  const itemBag = { ...state.itemBag }
  for (const ingredient of recipe.ingredients) {
    const nextCount = (itemBag[ingredient.itemId] ?? 0) - ingredient.amount
    if (nextCount > 0) itemBag[ingredient.itemId] = nextCount
    else delete itemBag[ingredient.itemId]
  }
  itemBag[recipe.outputItemId] = (itemBag[recipe.outputItemId] ?? 0) + 1

  return {
    ...state,
    itemBag,
    cooking: { ...state.cooking, exp: state.cooking.exp + recipe.expGain },
    log: [...state.log, `烹饪完成：${recipe.name}。厨艺 +${recipe.expGain}。`],
  }
}
