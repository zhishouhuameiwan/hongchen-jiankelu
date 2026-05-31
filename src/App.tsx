import './index.css'
import { cardById } from './data/cards'
import { cardArtById } from './data/cardArt'
import { endings } from './data/endings'
import { events } from './data/events'
import { locationArtById } from './data/locationArt'
import { heroines, locations } from './data/world'
import { enemyById } from './data/enemies'
import { describeEnemyIntent } from './engine/combatEngine'
import { pickSpecialEventForLocation } from './engine/eventEngine'
import { getLocationGuidance } from './engine/locationGuidanceEngine'
import { useGameStore } from './store/gameStore'
import { TopBar } from './components/TopBar'
import { EventPage } from './components/EventPage'
import { DeckPage } from './components/DeckPage'
import { GoalPanel } from './components/GoalPanel'
import type { GameState } from './types/game'
import { playerAvatarByBackgroundId, enemyArtById, heroineArtById, statusIconById } from './data/characterArt'

const backgrounds = [
  { id: 'wandering_swordsman', name: '江湖浪客', text: '初始攻击 +1' },
  { id: 'fallen_noble', name: '没落世家', text: '初始银两 +20' },
  { id: 'medicine_apprentice', name: '药庐学徒', text: '初始最大气血 +10' },
  { id: 'street_survivor', name: '市井孤儿', text: '初始身法 +1，名声 -1' },
]

function Menu() {
  const store = useGameStore()
  const openNewGameSetup = useGameStore((s) => s.openNewGameSetup)
  return <main className="hero"><h1>红尘剑客录</h1><p>血河经现世，正魔两道风雨欲来。三十日后，你会成为大侠、魔头、宗师，还是某人心中的遗憾？</p><section className="quick-guide" aria-label="玩法说明"><h2>三十日江湖抉择</h2><ul><li>白天与夜晚前往不同地点，寻找血河经线索与门派机缘。</li><li>事件会带来线索、银两、卡牌或战斗，抉择会改变名声与魔心。</li><li>红颜缘线会锁定专属剧情与结局，也会解锁独特战斗卡牌。</li><li>第 25 日后血河经终局会逼近，准备好再决定封印、治愈、远走或修炼。</li></ul></section><div className="menu-actions"><button onClick={openNewGameSetup}>开始新游戏</button><button disabled={!store.hasSave} onClick={() => store.loadSavedGame()}>继续游戏</button><button onClick={store.clearSavedGame}>清除存档</button></div>{!store.hasSave ? <p className="menu-hint">暂无存档，先开始新游戏吧。</p> : null}</main>
}

function NewGame() {
  const start = useGameStore((s) => s.startNewGame)
  return <main className="panel"><h2>选择出身</h2><div className="grid">{backgrounds.map((b) => <button className="card background-card" key={b.id} onClick={() => start('无名侠客', b.id)}><img className="portrait card-image background-portrait" src={playerAvatarByBackgroundId[b.id]} alt={`${b.name}头像`} /><b>{b.name}</b><small>{b.text}</small></button>)}</div></main>
}

function MapPage() {
  const state = useGameStore((s) => s.state)!
  const store = useGameStore()
  const visibleLocations = locations.filter((loc) => pickSpecialEventForLocation(state, events, loc.id) || getLocationGuidance(state, loc.id)).slice(0, 3)
  return <main><TopBar /><nav><button onClick={() => store.go('heroine')}>红颜</button><button onClick={() => store.go('deck')}>卡组</button></nav><GoalPanel state={state} /><section className="grid">{visibleLocations.map((loc) => { const specialEvent = pickSpecialEventForLocation(state, events, loc.id); const guidance = getLocationGuidance(state, loc.id); const affordable = state.stamina >= loc.staminaCost; return <button className="card location-card" key={loc.id} disabled={!affordable || !specialEvent} onClick={() => store.exploreLocation(loc.id)}><img className="location-art card-image" src={locationArtById[loc.id]} alt={`${loc.name}场景`} /><h3>{loc.name}</h3><p>{state.phase === 'day' ? loc.dayDescription : loc.nightDescription}</p>{guidance ? <small className="location-guidance">{guidance}</small> : null}<small>路程体力 -{loc.staminaCost}</small><small>{specialEvent ? `可触发：${specialEvent.title}` : '条件未满足'}</small>{!affordable ? <small>体力不足，先结束时段休整</small> : null}</button> })}</section><Log /></main>
}

function StatusList({ statuses, owner }: { statuses: { id: string; amount: number }[]; owner: string }) {
  if (!statuses.length) return null
  return <div className="status-row" aria-label={`${owner}状态`}>{statuses.map((status) => <span className="status-chip" key={`${owner}-${status.id}`}><img src={statusIconById[status.id]} alt={`${status.id}状态`} />{status.id} ×{status.amount}</span>)}</div>
}

function CombatMomentCue({ combat }: { combat: NonNullable<GameState['currentCombat']> }) {
  if (!combat.lastMoment) return null
  return <div role="status" aria-label="战斗表现" className={`combat-moment combat-moment--${combat.lastMoment.type}`}>{combat.lastMoment.text}</div>
}

function CombatPage() {
  const state = useGameStore((s) => s.state)!
  const store = useGameStore()
  const combat = state.currentCombat!
  const enemy = enemyById[combat.enemyId]
  const intent = enemy.intents[(combat.turn - 1) % enemy.intents.length]
  const rewardCardNames = enemy.rewardCardPool.map((id) => cardById[id]?.name ?? id).join('、')
  return <main><TopBar /><section className="panel combat-scene"><div className="combatants"><article className="combatant"><img className="portrait card-image" src={playerAvatarByBackgroundId[state.player.backgroundId]} alt={`${state.playerName}头像`} /><b>{state.playerName}</b><StatusList statuses={combat.playerStatuses} owner="玩家" /></article><article className="combatant enemy"><img className="portrait card-image" src={enemyArtById[enemy.id]} alt={`${enemy.name}画像`} /><b>{enemy.name}</b><span>气血 {combat.enemyHp}/{enemy.maxHp}</span><StatusList statuses={combat.enemyStatuses} owner="敌人" /></article></div><CombatMomentCue combat={combat} /><h2>{enemy.name}</h2><p>敌人气血：{combat.enemyHp}/{enemy.maxHp} · 回合 {combat.turn}</p><p className="intent">敌人意图：{describeEnemyIntent(intent)}</p>{combat.result ? <div className="result-panel"><h3>{combat.result === 'victory' ? '胜利战果' : '败局后果'}</h3><p>{combat.result === 'victory' ? `可得：银两 +${enemy.rewardSilver}，卡牌候选：${rewardCardNames}` : '失去部分气血并退回地图，江湖不会等你。'}</p>{combat.result === 'victory' ? <div className="grid reward-cards">{enemy.rewardCardPool.map((id) => <button className="card deck-card" key={id} onClick={() => store.finishCombat(id)}>{cardById[id]?.name ?? id}</button>)}</div> : <button onClick={() => store.finishCombat()}>{'接受败局'}</button>}</div> : <><p className="hint">出招后会自动结算敌方行动，进入下一回合。</p><div className="grid">{combat.drawnCardIds.map((id, index) => { const card = cardById[id]; const lacksInnerPower = state.player.stats.innerPower < card.costInnerPower; return <button className="card combat-card" key={`${id}-${index}`} disabled={lacksInnerPower} onClick={() => store.playCard(id)}><img className="card-art card-image" src={cardArtById[id]} alt={`${card.name}插画`} /><b>{card.name}</b><small>内力 {card.costInnerPower}</small><small>{card.description}</small>{lacksInnerPower ? <small className="warning">内力不足</small> : null}</button> })}</div></>}<pre>{combat.log.slice(-8).join('\n')}</pre></section></main>
}

function HeroinePage() {
  const state = useGameStore((s) => s.state)!
  const go = useGameStore((s) => s.go)
  return <main><TopBar /><button onClick={() => go('map')}>返回地图</button><section className="grid">{heroines.map((h) => {
    const s = state.heroineStates[h.id]
    const isChosen = state.flags.includes(`route_locked_${h.id}`)
    const unlockedCardNames = s.unlockedCards.map((id) => cardById[id]?.name ?? id)
    return <article className={`card heroine-card ${s.locked ? 'locked' : isChosen ? 'chosen' : ''}`} key={h.id}><img className="portrait card-image heroine-portrait" src={heroineArtById[h.id]} alt={`${h.name}立绘`} /><h2>{h.name}</h2><b>{h.title} · {h.faction}</b><p>{h.description}</p><p>好感 {s.affection} · 信念 {s.belief} · 阶段 {s.routeStage}</p><p className="route-status">{s.locked ? '缘线已错过' : isChosen ? '已定缘线' : '缘线未定'}</p><small>机制：{h.mechanicName}</small><small>{unlockedCardNames.length ? `已解锁：${unlockedCardNames.join('、')}` : '尚未解锁专属卡牌'}</small></article>
  })}</section></main>
}

function EndingPage() { const state = useGameStore((s) => s.state)!; const clear = useGameStore((s) => s.clearSavedGame); const ending = endings.find((e) => e.id === state.endingId) ?? endings.at(-1)!; return <main className="hero"><h1>{ending.title}</h1><p>{ending.text}</p><p>名声 {state.player.stats.reputation} · 魔心 {state.player.stats.demonHeart}</p><button onClick={clear}>返回主菜单</button></main> }
function Log() {
  const state = useGameStore((s) => s.state)!
  const latestCardGain = [...state.log].reverse().find((entry) => entry.startsWith('新卡入库：'))
  return <><pre className="log">{state.log.slice(-6).join('\n')}</pre>{latestCardGain ? <div className="card-gain-toast" role="status"><b>{latestCardGain.split('。')[0]}</b><small>去卡组查看。</small></div> : null}</>
}

export default function App() {
  const state = useGameStore((s) => s.state)
  const setupScreen = useGameStore((s) => s.setupScreen)
  if (!state) return setupScreen === 'new_game' ? <NewGame /> : <Menu />
  if (state.screen === 'event') return <EventPage />
  if (state.screen === 'combat') return <CombatPage />
  if (state.screen === 'heroine') return <HeroinePage />
  if (state.screen === 'deck') return <DeckPage />
  if (state.screen === 'ending') return <EndingPage />
  return <MapPage />
}
