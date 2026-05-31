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

  it('shows only three location cards on the map at a time', () => {
    useGameStore.setState({ state: createInitialGameState('测试侠客', 'wandering_swordsman'), setupScreen: 'menu' })

    render(<App />)

    expect(screen.getAllByRole('button', { name: /路程体力/ })).toHaveLength(3)
    expect(screen.getByRole('button', { name: /青石镇/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /听雨茶楼/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /黑松林/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /百草医馆/ })).not.toBeInTheDocument()
  })

  it('hides location cards that have no unseen event left instead of spending stamina on empty travel', () => {
    const state = createInitialGameState('测试侠客', 'wandering_swordsman')
    useGameStore.setState({
      state: {
        ...state,
        screen: 'map',
        flags: [
          'seen_town_bandit_notice_01',
          'visited_weapon_stall',
          'ch1_black_market_boss_defeated',
          'seen_teahouse_blood_river_rumor_01',
          'seen_teahouse_blood_river_investigation_02',
          'seen_forest_inner_power_trial_01',
          'seen_forest_mad_warrior_01',
          'seen_forest_iron_body_trial_01',
        ],
      },
      setupScreen: 'menu',
    })

    render(<App />)

    expect(screen.getAllByRole('button', { name: /路程体力/ })).toHaveLength(2)
    expect(screen.queryByRole('button', { name: /青石镇/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /听雨茶楼/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /黑松林/ })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /百草医馆/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /青霜剑派别院/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /破庙黑市/ })).not.toBeInTheDocument()
  })

  it('does not add hot/cold or manual cycling logic to the location deck', () => {
    useGameStore.setState({ state: createInitialGameState('测试侠客', 'wandering_swordsman'), setupScreen: 'menu' })

    render(<App />)

    expect(screen.queryByRole('button', { name: '换一批地点' })).not.toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /路程体力/ })).toHaveLength(3)
    expect(screen.getByRole('button', { name: /青石镇/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /听雨茶楼/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /黑松林/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /百草医馆/ })).not.toBeInTheDocument()
  })

  it('shows current goals on the map based on story progress', () => {
    const early = createInitialGameState('测试侠客', 'wandering_swordsman')
    useGameStore.setState({ state: { ...early, screen: 'map' }, setupScreen: 'menu' })

    const { rerender } = render(<App />)

    expect(screen.getByText('当前目标')).toBeInTheDocument()
    expect(screen.getByText('第一章：去青石镇接镖局悬赏，攒银两添置兵器。')).toBeInTheDocument()

    const routed = createInitialGameState('测试侠客', 'wandering_swordsman')
    useGameStore.setState({ state: { ...routed, screen: 'map', flags: ['route_locked_bai_zhi', 'ch1_black_market_boss_defeated'] }, setupScreen: 'menu' })
    rerender(<App />)

    expect(screen.getByText('推进白芷缘线：关注医馆与相关选择。')).toBeInTheDocument()

    const late = createInitialGameState('测试侠客', 'wandering_swordsman')
    useGameStore.setState({ state: { ...late, screen: 'map', day: 26, flags: ['blood_river_fragment_found', 'ch1_black_market_boss_defeated'] }, setupScreen: 'menu' })
    rerender(<App />)

    expect(screen.getByText('终局将近：前往破庙黑市处理血河异动，或回茶馆作最终抉择。')).toBeInTheDocument()
  })

  it('shows location travel stamina costs on the map', () => {
    useGameStore.setState({ state: createInitialGameState('测试侠客', 'wandering_swordsman'), setupScreen: 'menu' })

    render(<App />)

    expect(screen.getByRole('button', { name: /青石镇/ })).toHaveTextContent('路程体力 -1')
    expect(screen.getByRole('button', { name: /听雨茶楼/ })).toHaveTextContent('路程体力 -1')
    expect(screen.getByRole('button', { name: /黑松林/ })).toHaveTextContent('路程体力 -2')
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

  it('lets the player return to the map when an event has no affordable choices', () => {
    const state = createInitialGameState('测试侠客', 'wandering_swordsman')
    useGameStore.setState({
      state: {
        ...state,
        stamina: 0,
        screen: 'event',
        currentLocationId: 'forest',
        currentEventId: 'forest_mad_warrior_01',
      },
      setupScreen: 'menu',
    })

    render(<App />)

    expect(screen.getByRole('button', { name: /返回地图/ })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /返回地图/ }))

    expect(useGameStore.getState().state!.screen).toBe('map')
  })

  it('automatically advances the phase instead of entering an event when travel drains all stamina', () => {
    const state = createInitialGameState('测试侠客', 'wandering_swordsman')
    useGameStore.setState({ state: { ...state, stamina: 2, screen: 'map' }, setupScreen: 'menu' })

    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /黑松林/ }))

    expect(useGameStore.getState().state!.phase).toBe('night')
    expect(useGameStore.getState().state!.screen).toBe('map')
    expect(screen.getByText(/夜晚/)).toBeInTheDocument()
    expect(screen.getByText(/夜色渐深，江湖暗流浮现。/)).toBeInTheDocument()
  })

  it('automatically resolves the enemy action after playing a combat card', () => {
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
          drawnCardIds: ['basic_slash', 'frost_seal'],
          playerStatuses: [],
          enemyStatuses: [],
          log: ['山道劫匪 拦住了你的去路。'],
          actionTaken: false,
        },
      },
      setupScreen: 'menu',
    })

    render(<App />)
    expect(screen.queryByRole('button', { name: /结束回合/ })).not.toBeInTheDocument()
    expect(screen.getByText('出招后会自动结算敌方行动，进入下一回合。')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /劈风斩/ }))

    expect(useGameStore.getState().state!.currentCombat?.turn).toBe(2)
    expect(screen.getByText(/回合 2/)).toBeInTheDocument()
    expect(screen.getByText(/山道劫匪 攻击，造成 6 点伤害。/)).toBeInTheDocument()
  })

  it('shows the latest combat moment as an action cue', () => {
    const state = createInitialGameState('测试侠客', 'wandering_swordsman')
    useGameStore.setState({
      state: {
        ...state,
        screen: 'combat',
        currentCombat: {
          enemyId: 'black_market_master',
          enemyHp: 48,
          playerBlock: 0,
          enemyBlock: 0,
          turn: 2,
          drawnCardIds: ['red_lotus_poison'],
          playerStatuses: [],
          enemyStatuses: [{ id: 'poison', amount: 4 }],
          log: ['红莲蚀骨 施加 poison。'],
          actionTaken: true,
          lastMoment: { type: 'poison', text: '黑市高手身中中毒 4 层。' },
        },
      },
      setupScreen: 'menu',
    })

    render(<App />)

    expect(screen.getByRole('status', { name: '战斗表现' })).toHaveTextContent('黑市高手身中中毒 4 层。')
    expect(screen.getByRole('status', { name: '战斗表现' })).toHaveClass('combat-moment--poison')
  })

  it('shows player avatar, enemy portrait, and status icons during combat', () => {
    const state = createInitialGameState('测试侠客', 'wandering_swordsman')
    useGameStore.setState({
      state: {
        ...state,
        screen: 'combat',
        currentCombat: {
          enemyId: 'black_market_master',
          enemyHp: 60,
          playerBlock: 0,
          enemyBlock: 0,
          turn: 1,
          drawnCardIds: ['basic_slash'],
          playerStatuses: [{ id: 'poison', amount: 3 }],
          enemyStatuses: [{ id: 'sealed', amount: 2 }],
          log: ['黑市高手 拦住了你的去路。'],
          actionTaken: false,
        },
      },
      setupScreen: 'menu',
    })

    render(<App />)

    expect(screen.getAllByAltText('测试侠客头像')[0]).toHaveAttribute('src', '/assets/figures/players/wandering_swordsman.svg')
    expect(screen.getByAltText('黑市高手画像')).toHaveAttribute('src', '/assets/figures/enemies/black_market_master.svg')
    expect(screen.getByAltText('poison状态')).toHaveAttribute('src', '/assets/statuses/poison.svg')
    expect(screen.getByAltText('sealed状态')).toHaveAttribute('src', '/assets/statuses/sealed.svg')
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

  it('shows heroine portraits on the relationship page', () => {
    const state = createInitialGameState('测试侠客', 'wandering_swordsman')
    useGameStore.setState({ state: { ...state, screen: 'heroine' }, setupScreen: 'menu' })

    render(<App />)

    expect(screen.getByAltText('沈青霜立绘')).toHaveAttribute('src', '/assets/figures/heroines/shen_qingshuang.svg')
    expect(screen.getByAltText('洛红绫立绘')).toHaveAttribute('src', '/assets/figures/heroines/luo_hongling.svg')
    expect(screen.getByAltText('白芷立绘')).toHaveAttribute('src', '/assets/figures/heroines/bai_zhi.svg')
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
    expect(next.log).toContain('战斗胜利，获得 8 两与 横剑格挡。')
    expect(next.log).toContain('新卡入库：横剑格挡。去卡组查看。')
    expect(next.log).toContain('获得物品：小还丹。')
    expect(next.itemBag.small_healing_pill).toBe(1)
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

  it('groups deck cards and highlights heroine-exclusive cards with compact sizing', () => {
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
    expect(screen.getByText('劈风斩').closest('article')).toHaveClass('deck-card--compact')
    expect(screen.getByText('青霜一剑').closest('article')).toHaveTextContent('红颜专属')
    expect(screen.getByText('并肩御敌').closest('article')).toHaveClass('heroine-card', 'deck-card--mini')
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

  it('uses shared card/image sizing classes for map, deck, combat, and heroine cards', () => {
    const state = createInitialGameState('测试侠客', 'wandering_swordsman')
    useGameStore.setState({ state: { ...state, screen: 'map' }, setupScreen: 'menu' })

    const { rerender } = render(<App />)

    expect(screen.getByRole('button', { name: /青石镇/ })).toHaveClass('card', 'location-card')

    useGameStore.setState({ state: { ...state, screen: 'deck', deck: ['basic_slash'] }, setupScreen: 'menu' })
    rerender(<App />)
    expect(screen.getByText('劈风斩').closest('article')).toHaveClass('card', 'deck-card', 'deck-card--compact')
    expect(screen.getByAltText('劈风斩插画')).toHaveClass('card-art', 'card-image')

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
    rerender(<App />)
    expect(screen.getByRole('button', { name: /劈风斩/ })).toHaveClass('card', 'combat-card')
    expect(screen.getByAltText('劈风斩插画')).toHaveClass('card-art', 'card-image')
    expect(screen.getAllByAltText('测试侠客头像').some((image) => image.classList.contains('portrait') && image.classList.contains('card-image'))).toBe(true)

    useGameStore.setState({ state: { ...state, screen: 'heroine' }, setupScreen: 'menu' })
    rerender(<App />)
    expect(screen.getByText('沈青霜').closest('article')).toHaveClass('card', 'heroine-card')
    expect(screen.getByAltText('沈青霜立绘')).toHaveClass('portrait', 'card-image')
  })

  it('shows an animated hint after a new card is added', () => {
    const state = createInitialGameState('测试侠客', 'wandering_swordsman')
    useGameStore.setState({
      state: {
        ...state,
        screen: 'map',
        log: [...state.log, '新卡入库：横剑格挡。去卡组查看。'],
      },
      setupScreen: 'menu',
    })

    render(<App />)

    expect(screen.getByRole('status')).toHaveClass('card-gain-toast')
    expect(screen.getByText('新卡入库：横剑格挡')).toBeInTheDocument()
    expect(screen.getByText('去卡组查看。')).toBeInTheDocument()
  })

  it('hides location cards whose special events have all dissipated', () => {
    const state = createInitialGameState('测试侠客', 'wandering_swordsman')
    useGameStore.setState({
      state: {
        ...state,
        flags: ['seen_town_bandit_notice_01', 'visited_weapon_stall', 'ch1_black_market_boss_defeated'],
        screen: 'map',
      },
      setupScreen: 'menu',
    })

    render(<App />)

    expect(screen.queryByRole('button', { name: /青石镇/ })).not.toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /路程体力/ })).toHaveLength(3)
    expect(screen.getByRole('button', { name: /听雨茶楼/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /黑松林/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /百草医馆/ })).toBeInTheDocument()
  })
})
