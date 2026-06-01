import { describe, expect, it } from 'vitest'
import { cookRecipe, getCookingLevel, getKnownRecipes, learnRecipe } from '../engine/cookingEngine'
import { gainItem, consumeItem } from '../engine/itemEngine'
import { itemById } from '../data/items'
import { makeState } from './helpers'

describe('cookingEngine', () => {
  it('defines food items separately from medicine and quest items', () => {
    expect(itemById.steamed_bun.category).toBe('food')
    expect(itemById.herb_chicken_soup.category).toBe('food')
    expect(itemById.small_healing_pill.category).toBe('consumable')
    expect(itemById.steamed_bun.effects).toContainEqual({ type: 'restore_stamina', value: 1 })
  })

  it('learns a recipe and cooks food from ingredients while gaining cooking experience', () => {
    const stocked = gainItem(gainItem(learnRecipe(makeState(), 'steamed_bun'), 'wheat_flour', 2), 'spring_water')

    const next = cookRecipe(stocked, 'steamed_bun')

    expect(next.itemBag.wheat_flour).toBe(1)
    expect(next.itemBag.spring_water).toBeUndefined()
    expect(next.itemBag.steamed_bun).toBe(1)
    expect(next.cooking.exp).toBe(3)
    expect(getCookingLevel(next)).toBe(1)
    expect(next.log.at(-1)).toBe('烹饪完成：蒸饼。厨艺 +3。')
  })

  it('requires known recipes, ingredients, and sufficient cooking level', () => {
    const stocked = gainItem(gainItem({ ...makeState(), cooking: { knownRecipes: [], exp: 0 } }, 'wheat_flour', 2), 'spring_water')

    const withoutRecipe = cookRecipe(stocked, 'steamed_bun')
    const afterLearning = learnRecipe(stocked, 'herb_chicken_soup')
    const tooHard = cookRecipe(afterLearning, 'herb_chicken_soup')

    expect(withoutRecipe.itemBag.steamed_bun).toBeUndefined()
    expect(tooHard.itemBag.herb_chicken_soup).toBeUndefined()
    expect(tooHard.cooking.exp).toBe(0)
  })

  it('makes food edible through the item engine and removes the final stack', () => {
    const hungry = { ...gainItem(makeState(), 'steamed_bun'), stamina: 4 }

    const next = consumeItem(hungry, 'steamed_bun')

    expect(next.stamina).toBe(5)
    expect(next.itemBag.steamed_bun).toBeUndefined()
    expect(next.log.at(-1)).toBe('食用：蒸饼。')
  })

  it('lists only recipes that are known and within current cooking level', () => {
    const state = { ...makeState(), cooking: { knownRecipes: ['steamed_bun', 'herb_chicken_soup'], exp: 0 } }

    expect(getKnownRecipes(state).map((recipe) => recipe.id)).toEqual(['steamed_bun'])
  })
})
