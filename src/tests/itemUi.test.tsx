import '@testing-library/jest-dom/vitest'
import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DeckPage } from '../components/DeckPage'
import { useGameStore, createInitialGameState } from '../store/gameStore'
import { gainItem } from '../engine/itemEngine'

describe('item UI', () => {
  it('shows usable items in the bag and lets the player consume one', () => {
    const state = gainItem(createInitialGameState('测试侠客', 'wandering_swordsman'), 'small_healing_pill')
    const wounded = {
      ...state,
      player: { ...state.player, stats: { ...state.player.stats, hp: 40 } },
    }
    useGameStore.setState({ state: wounded, setupScreen: 'menu' })

    render(<DeckPage />)

    expect(screen.getByText('物品')).toBeInTheDocument()
    expect(screen.getByText('小还丹 ×1')).toBeInTheDocument()
    expect(screen.getByAltText('小还丹插画')).toHaveClass('item-art', 'compact-asset-image')
    expect(screen.getByAltText('小还丹插画')).not.toHaveClass('card-art')

    fireEvent.click(screen.getByRole('button', { name: '使用小还丹' }))

    expect(useGameStore.getState().state?.player.stats.hp).toBe(52)
    expect(useGameStore.getState().state?.itemBag.small_healing_pill).toBeUndefined()
  })
})
