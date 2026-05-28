import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from '../App'
import { createInitialGameState, useGameStore } from '../store/gameStore'

afterEach(() => {
  cleanup()
  useGameStore.setState({ state: null, setupScreen: 'menu' })
})

describe('route UI presentation', () => {
  it('disables continue and explains when no saved game exists', () => {
    render(<App />)

    expect(screen.getByRole('button', { name: '继续游戏' })).toBeDisabled()
    expect(screen.getByText('暂无存档，先开始新游戏吧。')).toBeInTheDocument()
  })

  it('explains the core loop and win pressure on the main menu', () => {
    render(<App />)

    expect(screen.getByText('三十日江湖抉择')).toBeInTheDocument()
    expect(screen.getByText(/白天与夜晚前往不同地点/)).toBeInTheDocument()
    expect(screen.getByText(/事件会带来线索、银两、卡牌或战斗/)).toBeInTheDocument()
    expect(screen.getByText(/红颜缘线会锁定专属剧情与结局/)).toBeInTheDocument()
    expect(screen.getByText(/第 25 日后血河经终局会逼近/)).toBeInTheDocument()
  })

  it('shows current goals on the map based on story progress', () => {
    const early = createInitialGameState('测试侠客', 'wandering_swordsman')
    useGameStore.setState({ state: { ...early, screen: 'map' }, setupScreen: 'menu' })

    const { rerender } = render(<App />)

    expect(screen.getByText('当前目标')).toBeInTheDocument()
    expect(screen.getByText('寻找血河经线索：茶馆与黑松林常有风声。')).toBeInTheDocument()

    const routed = createInitialGameState('测试侠客', 'wandering_swordsman')
    useGameStore.setState({ state: { ...routed, screen: 'map', flags: ['route_locked_bai_zhi'] }, setupScreen: 'menu' })
    rerender(<App />)

    expect(screen.getByText('推进白芷缘线：关注医馆与相关选择。')).toBeInTheDocument()

    const late = createInitialGameState('测试侠客', 'wandering_swordsman')
    useGameStore.setState({ state: { ...late, screen: 'map', day: 26, flags: ['blood_river_fragment_found'] }, setupScreen: 'menu' })
    rerender(<App />)

    expect(screen.getByText('终局将近：前往破庙黑市处理血河异动，或回茶馆作最终抉择。')).toBeInTheDocument()
  })

  it('shows location travel stamina costs on the map', () => {
    useGameStore.setState({ state: createInitialGameState('测试侠客', 'wandering_swordsman'), setupScreen: 'menu' })

    render(<App />)

    expect(screen.getByRole('button', { name: /青石镇/ })).toHaveTextContent('路程体力 -1')
    expect(screen.getByRole('button', { name: /黑松林/ })).toHaveTextContent('路程体力 -2')
    expect(screen.getByRole('button', { name: /青霜剑派别院/ })).toHaveTextContent('路程体力 -2')
  })

  it('shows remaining stamina previews for event choices', () => {
    const state = createInitialGameState('测试侠客', 'wandering_swordsman')
    useGameStore.setState({
      state: {
        ...state,
        stamina: 4,
        screen: 'event',
        currentLocationId: 'town',
        currentEventId: 'town_bandit_notice_01',
      },
      setupScreen: 'menu',
    })

    render(<App />)

    expect(screen.getByRole('button', { name: /接下悬赏/ })).toHaveTextContent('体力-2，剩余 2')
    expect(screen.getByRole('button', { name: /接下悬赏/ })).toHaveTextContent('战斗')
    expect(screen.getByRole('button', { name: /帮忙搬运货物/ })).toHaveTextContent('体力-1，剩余 3')
    expect(screen.getByRole('button', { name: /帮忙搬运货物/ })).toHaveTextContent('银两')
  })

  it('shows detailed effect previews for event choices', () => {
    const state = createInitialGameState('测试侠客', 'wandering_swordsman')
    useGameStore.setState({
      state: {
        ...state,
        stamina: 4,
        screen: 'event',
        currentLocationId: 'town',
        currentEventId: 'town_bandit_notice_01',
      },
      setupScreen: 'menu',
    })

    render(<App />)

    expect(screen.getByRole('button', { name: /帮忙搬运货物/ })).toHaveTextContent('预览：银两 +6')
  })

  it('disables combat cards when inner power is insufficient and explains why', () => {
    const state = createInitialGameState('测试侠客', 'wandering_swordsman')
    useGameStore.setState({
      state: {
        ...state,
        screen: 'combat',
        player: {
          ...state.player,
          stats: { ...state.player.stats, innerPower: 0 },
        },
        currentCombat: {
          enemyId: 'bandit',
          enemyHp: 28,
          playerBlock: 0,
          enemyBlock: 0,
          turn: 1,
          drawnCardIds: ['frost_seal'],
          playerStatuses: [],
          enemyStatuses: [],
          log: ['山道劫匪 拦住了你的去路。'],
        },
      },
      setupScreen: 'menu',
    })

    render(<App />)

    const card = screen.getByRole('button', { name: /霜河封脉/ })
    expect(card).toHaveTextContent('内力 2')
    expect(card).toHaveTextContent('内力不足')
    expect(card).toBeDisabled()
  })

  it('shows battle result stakes before finishing combat', () => {
    const state = createInitialGameState('测试侠客', 'wandering_swordsman')
    useGameStore.setState({
      state: {
        ...state,
        screen: 'combat',
        currentCombat: {
          enemyId: 'bandit',
          enemyHp: 0,
          playerBlock: 0,
          enemyBlock: 0,
          turn: 1,
          drawnCardIds: ['basic_slash'],
          playerStatuses: [],
          enemyStatuses: [],
          log: ['你赢得了战斗。'],
          result: 'victory',
        },
      },
      setupScreen: 'menu',
    })

    render(<App />)

    expect(screen.getByText('胜利战果')).toBeInTheDocument()
    expect(screen.getByText('可得：银两 +8，卡牌候选：劈风斩、横剑格挡')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '劈风斩' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '横剑格挡' })).toBeInTheDocument()
  })

  it('adds the selected combat reward card after victory', () => {
    const state = createInitialGameState('测试侠客', 'wandering_swordsman')
    useGameStore.setState({
      state: {
        ...state,
        deck: ['basic_slash'],
        screen: 'combat',
        currentCombat: {
          enemyId: 'bandit',
          enemyHp: 0,
          playerBlock: 0,
          enemyBlock: 0,
          turn: 1,
          drawnCardIds: ['basic_slash'],
          playerStatuses: [],
          enemyStatuses: [],
          log: ['你赢得了战斗。'],
          result: 'victory',
        },
      },
      setupScreen: 'menu',
    })

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '横剑格挡' }))

    const next = useGameStore.getState().state!
    expect(next.screen).toBe('map')
    expect(next.deck).toContain('basic_guard')
    expect(next.player.silver).toBe(state.player.silver + 8)
    expect(next.log.at(-1)).toBe('战斗胜利，获得 8 两与 横剑格挡。')
  })

  it('shows defeat consequences before accepting combat defeat', () => {
    const state = createInitialGameState('测试侠客', 'wandering_swordsman')
    useGameStore.setState({
      state: {
        ...state,
        screen: 'combat',
        currentCombat: {
          enemyId: 'bandit',
          enemyHp: 16,
          playerBlock: 0,
          enemyBlock: 0,
          turn: 2,
          drawnCardIds: ['basic_slash'],
          playerStatuses: [],
          enemyStatuses: [],
          log: ['你败下阵来。'],
          result: 'defeat',
        },
      },
      setupScreen: 'menu',
    })

    render(<App />)

    expect(screen.getByText('败局后果')).toBeInTheDocument()
    expect(screen.getByText('失去部分气血并退回地图，江湖不会等你。')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '接受败局' })).toBeInTheDocument()
  })

  it('shows the enemy intent on combat page before ending turn', () => {
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
          drawnCardIds: ['basic_slash'],
          playerStatuses: [],
          enemyStatuses: [],
          log: ['山道劫匪 拦住了你的去路。'],
        },
      },
      setupScreen: 'menu',
    })

    render(<App />)

    expect(screen.getByText('敌人意图：攻击 6')).toBeInTheDocument()
  })

  it('groups deck cards and highlights heroine-exclusive cards', () => {
    const state = createInitialGameState('测试侠客', 'wandering_swordsman')
    useGameStore.setState({
      state: {
        ...state,
        screen: 'deck',
        deck: ['basic_slash', 'qingshuang_sword', 'stand_together', 'red_lotus_poison'],
      },
      setupScreen: 'menu',
    })

    render(<App />)

    expect(screen.getByRole('heading', { name: '基础武学' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '红颜专属' })).toBeInTheDocument()
    expect(screen.getByText('青霜一剑').closest('article')).toHaveTextContent('红颜专属')
    expect(screen.getByText('并肩御敌').closest('article')).toHaveClass('heroine-card')
  })

  it('shows the locked heroine route in the top bar', () => {
    const state = createInitialGameState('测试侠客', 'wandering_swordsman')
    useGameStore.setState({
      state: {
        ...state,
        screen: 'map',
        flags: ['route_locked_shen_qingshuang'],
      },
      setupScreen: 'menu',
    })

    render(<App />)

    expect(screen.getByText('缘线：沈青霜')).toBeInTheDocument()
  })

  it('shows endgame pressure after day 25 in the top bar', () => {
    const state = createInitialGameState('测试侠客', 'wandering_swordsman')
    useGameStore.setState({
      state: {
        ...state,
        day: 25,
        screen: 'map',
      },
      setupScreen: 'menu',
    })

    render(<App />)

    expect(screen.getByText('终局将近：血河经异动加剧')).toBeInTheDocument()
  })

  it('shows locked route status and heroine reward cards on heroine page', () => {
    const state = createInitialGameState('测试侠客', 'wandering_swordsman')
    useGameStore.setState({
      state: {
        ...state,
        screen: 'heroine',
        flags: ['route_locked_shen_qingshuang'],
        heroineStates: {
          ...state.heroineStates,
          shen_qingshuang: { ...state.heroineStates.shen_qingshuang, affection: 30, belief: 22, routeStage: 2, unlockedCards: ['qingshuang_sword', 'stand_together'] },
          luo_hongling: { ...state.heroineStates.luo_hongling, locked: true },
          bai_zhi: { ...state.heroineStates.bai_zhi, locked: true },
        },
      },
      setupScreen: 'menu',
    })

    render(<App />)

    expect(screen.getByText('已定缘线')).toBeInTheDocument()
    expect(screen.getAllByText('缘线已错过')).toHaveLength(2)
    expect(screen.getByText('已解锁：青霜一剑、并肩御敌')).toBeInTheDocument()
  })
})
