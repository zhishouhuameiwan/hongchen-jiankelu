import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from '../App'
import { createInitialGameState, useGameStore } from '../store/gameStore'

afterEach(() => {
  cleanup()
  useGameStore.getState().clearSavedGame()
})

describe('equipment UI', () => {
  it('shows an equipment bag in the deck page and lets the player equip a card', () => {
    const state = createInitialGameState('测试侠客', 'wandering_swordsman')
    useGameStore.setState({
      state: { ...state, screen: 'deck', equipmentBag: ['plain_iron_sword'] },
      setupScreen: 'menu',
    })

    render(<App />)

    expect(screen.getByText('装备')).toBeInTheDocument()
    expect(screen.getByText('粗铁剑')).toBeInTheDocument()
    expect(screen.getByAltText('粗铁剑插画')).toHaveClass('equipment-art', 'compact-asset-image')
    expect(screen.getByAltText('粗铁剑插画')).not.toHaveClass('card-art')
    expect(screen.getByText('武器 · 攻击 +2')).toBeInTheDocument()
    expect(screen.getAllByText('装备中：无').length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole('button', { name: /装备粗铁剑/ }))

    expect(screen.getByText('装备中：粗铁剑')).toBeInTheDocument()
    expect(screen.getByText('攻击 +2')).toBeInTheDocument()
  })
})
