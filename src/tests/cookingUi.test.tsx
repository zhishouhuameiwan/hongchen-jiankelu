import '@testing-library/jest-dom/vitest'
import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { DeckPage } from '../components/DeckPage'
import { gainItem } from '../engine/itemEngine'
import { learnRecipe } from '../engine/cookingEngine'
import { useGameStore, createInitialGameState } from '../store/gameStore'

describe('cooking UI', () => {
  it('shows cooking level, known recipes, ingredients, and cooks food from the bag', () => {
    let state = createInitialGameState('测试侠客', 'wandering_swordsman')
    state = gainItem(gainItem(state, 'wheat_flour'), 'spring_water')
    state = learnRecipe(state, 'steamed_bun')
    useGameStore.setState({ state, setupScreen: 'menu' })

    render(<DeckPage />)

    expect(screen.getByText('厨艺')).toBeInTheDocument()
    expect(screen.getByText('厨艺等级 1 · 经验 0')).toBeInTheDocument()
    expect(screen.getByText(/麦粉 ×1、山泉水 ×1/)).toBeInTheDocument()
    expect(screen.getByAltText('蒸饼成品')).toHaveClass('cooking-art', 'compact-asset-image')
    expect(screen.getByAltText('蒸饼成品')).not.toHaveClass('card-art')

    fireEvent.click(screen.getByRole('button', { name: '烹饪蒸饼' }))

    expect(useGameStore.getState().state?.itemBag.steamed_bun).toBe(1)
    expect(useGameStore.getState().state?.itemBag.wheat_flour).toBeUndefined()
    expect(useGameStore.getState().state?.cooking.exp).toBe(3)
  })
})
