import type { CardDefinition, EnemyDefinition, EnemyIntent, GameState } from '../types/game'

export function drawCardIds(deck: string[], amount: number): string[] {
  if (deck.length <= amount) return deck
  return [...deck].sort(() => Math.random() - 0.5).slice(0, amount)
}

export function startCombat(state: GameState, enemy: EnemyDefinition): GameState {
  return { ...state, screen: 'combat', currentCombat: { enemyId: enemy.id, enemyHp: enemy.maxHp, playerBlock: 0, enemyBlock: 0, turn: 1, drawnCardIds: drawCardIds(state.deck, 3), playerStatuses: [], enemyStatuses: [], log: [`${enemy.name} 拦住了你的去路。`], actionTaken: false } }
}

export function describeEnemyIntent(intent: EnemyIntent): string {
  if (intent.type === 'attack') return `攻击 ${intent.amount}`
  if (intent.type === 'guard') return `防守 ${intent.amount}`
  return `施加 ${intent.status} ${intent.amount}`
}

export function playCombatCard(state: GameState, card: CardDefinition): GameState {
  let next: GameState = structuredClone(state)
  const combat = next.currentCombat
  if (!combat) return next
  if (combat.actionTaken) { combat.log.push('本回合已行动。'); return next }
  if (next.player.stats.innerPower < card.costInnerPower) { combat.log.push('内力不足。'); return next }
  next.player.stats.innerPower -= card.costInnerPower
  combat.actionTaken = true
  for (const effect of card.effects) {
    if (effect.type === 'damage') { const damage = Math.max(0, effect.amount - combat.enemyBlock); combat.enemyHp = Math.max(0, combat.enemyHp - damage); combat.log.push(`${card.name} 造成 ${damage} 点伤害。`) }
    if (effect.type === 'block') { combat.playerBlock += effect.amount; combat.log.push(`${card.name} 获得 ${effect.amount} 点格挡。`) }
    if (effect.type === 'heal') { next.player.stats.hp = Math.min(next.player.stats.maxHp, next.player.stats.hp + effect.amount); combat.log.push(`${card.name} 恢复 ${effect.amount} 点气血。`) }
    if (effect.type === 'gain_inner_power') { next.player.stats.innerPower = Math.min(next.player.stats.maxInnerPower, next.player.stats.innerPower + effect.amount); combat.log.push(`${card.name} 恢复 ${effect.amount} 点内力。`) }
    if (effect.type === 'apply_status') { combat.enemyStatuses.push({ id: effect.status, amount: effect.amount }); combat.log.push(`${card.name} 施加 ${effect.status}。`) }
    if (effect.type === 'gain_demon_heart') next.player.stats.demonHeart += effect.amount
  }
  if (combat.enemyHp <= 0) { combat.result = 'victory'; combat.log.push('你赢得了战斗。'); return next }
  return next
}

export function endPlayerTurn(state: GameState, enemy: EnemyDefinition): GameState {
  let next = resolveEnemyTurn(state, enemy)
  if (!next.currentCombat) return next
  if (next.player.stats.hp <= 0) { next.currentCombat.result = 'defeat'; next.currentCombat.log.push('你败下阵来。'); return next }
  next.currentCombat.turn += 1
  next.currentCombat.playerBlock = 0
  next.currentCombat.enemyBlock = 0
  next.currentCombat.drawnCardIds = drawCardIds(next.deck, 3)
  next.currentCombat.actionTaken = false
  return next
}

export function resolveEnemyTurn(state: GameState, enemy: EnemyDefinition): GameState {
  const next: GameState = structuredClone(state)
  const combat = next.currentCombat
  if (!combat) return next
  const intent = enemy.intents[(combat.turn - 1) % enemy.intents.length]
  if (intent.type === 'attack') { const damage = Math.max(0, intent.amount - combat.playerBlock); next.player.stats.hp = Math.max(0, next.player.stats.hp - damage); combat.log.push(`${enemy.name} 攻击，造成 ${damage} 点伤害。`) }
  if (intent.type === 'guard') { combat.enemyBlock += intent.amount; combat.log.push(`${enemy.name} 转为守势。`) }
  if (intent.type === 'apply_status') { combat.playerStatuses.push({ id: intent.status, amount: intent.amount }); combat.log.push(`${enemy.name} 施加 ${intent.status}。`) }
  return next
}
