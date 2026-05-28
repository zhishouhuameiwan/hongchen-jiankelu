import { useGameStore } from '../store/gameStore'
import { heroines } from '../data/world'

export function TopBar() {
  const state = useGameStore((s) => s.state)!
  const lockedHeroine = heroines.find((heroine) => state.flags.includes(`route_locked_${heroine.id}`))

  return (
    <div className="topbar">
      <b>第 {state.day}/30 日 · {state.phase === 'day' ? '白天' : '夜晚'}</b>
      <span>体力 {state.stamina}/{state.maxStamina}</span>
      <span>气血 {state.player.stats.hp}/{state.player.stats.maxHp}</span>
      <span>内力 {state.player.stats.innerPower}/{state.player.stats.maxInnerPower}</span>
      <span>名声 {state.player.stats.reputation}</span>
      <span>魔心 {state.player.stats.demonHeart}</span>
      <span>银两 {state.player.silver}</span>
      {lockedHeroine ? <span className="route-chip">缘线：{lockedHeroine.name}</span> : null}
      {state.day >= 25 ? <strong className="endgame-warning">终局将近：血河经异动加剧</strong> : null}
    </div>
  )
}
