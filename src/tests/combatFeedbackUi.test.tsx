import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from '../App'
import { createInitialGameState, useGameStore } from '../store/gameStore'

afterEach(() => {
  cleanup()
  useGameStore.setState({ state: null, setupScreen: 'menu' })
})

describe('combat tutorial feedback', () => {
  it('explains enemy intent stance, card tactic, matchup, and tracked statuses', () => {
    const state = createInitialGameState('测试侠客', 'wandering_swordsman')
    useGameStore.setState({
      state: {
        ...state,
        screen: 'combat',
        currentCombat: {
          enemyId: 'bandit',
          enemyHp: 28,
          playerBlock: 0,
          enemyBlock: 0,
          turn: 1,
          actionPoints: 3,
          drawnCardIds: ['basic_slash', 'basic_guard', 'frost_seal'],
          playerStatuses: [{ id: 'sealed', amount: 1 }],
          enemyStatuses: [{ id: 'vulnerable', amount: 2 }],
          enemyIntentOverride: { type: 'attack', amount: 6, tactic: 'assault' },
          log: ['山道劫匪 拦住了你的去路。'],
          actionTaken: false,
        },
      },
      setupScreen: 'menu',
    })

    render(<App />)

    expect(screen.getByText('战斗入门')).toBeInTheDocument()
    expect(screen.getByText(/行动点：每回合 3 点/)).toBeInTheDocument()
    expect(screen.getByText('敌人架势：猛攻')).toBeInTheDocument()
    expect(screen.getByText('猛攻：优先用格挡或身法化解。')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /横剑格挡/ })).toHaveTextContent('战术：格挡')
    expect(screen.getByRole('button', { name: /横剑格挡/ })).toHaveTextContent('克制：优势')
    expect(screen.getByRole('button', { name: /劈风斩/ })).toHaveTextContent('战术：攻击')
    expect(screen.getByRole('button', { name: /霜河封脉/ })).toHaveTextContent('战术：破势')
    expect(screen.getByLabelText('玩家状态')).toHaveTextContent('封脉 ×1')
    expect(screen.getByLabelText('敌人状态')).toHaveTextContent('破绽 ×2')
  })
})
