import type { CardDefinition, CombatMoment, EnemyDefinition, EnemyIntent, GameState } from '../types/game'
import { enemyById } from '../data/enemies'
import { getEquippedStatBonus } from './equipmentEngine'

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

function setCombatMoment(combat: NonNullable<GameState['currentCombat']>, moment: CombatMoment) {
  combat.lastMoment = moment
}

function describeStatusName(status: string): string {
  const names: Record<string, string> = { poison: '中毒', vulnerable: '破绽', bleed: '流血', sealed: '封脉', counter: '反击' }
  return names[status] ?? status
}

export function playCombatCard(state: GameState, card: CardDefinition): GameState {
  const next: GameState = structuredClone(state)
  const combat = next.currentCombat
  if (!combat) return next
  if (combat.actionTaken) { combat.log.push('本回合已行动。'); return next }
  if (next.player.stats.innerPower < card.costInnerPower) { combat.log.push('内力不足。'); return next }
  const enemy = enemyById[combat.enemyId]
  if (!enemy) return next
  next.player.stats.innerPower -= card.costInnerPower
  combat.actionTaken = true
  for (const effect of card.effects) {
    if (effect.type === 'damage') { const damage = Math.max(0, effect.amount + getEquippedStatBonus(next, 'attack') - combat.enemyBlock); combat.enemyHp = Math.max(0, combat.enemyHp - damage); combat.log.push(`${card.name} 造成 ${damage} 点伤害。`); setCombatMoment(combat, { type: 'enemy_hit', text: `${card.name}命中${enemy.name}，造成 ${damage} 点伤害。` }) }
    if (effect.type === 'block') { const block = effect.amount + getEquippedStatBonus(next, 'defense'); combat.playerBlock += block; combat.log.push(`${card.name} 获得 ${block} 点格挡。`); setCombatMoment(combat, { type: 'guard', text: `${card.name}护住周身，获得 ${block} 点格挡。` }) }
    if (effect.type === 'heal') { const beforeHp = next.player.stats.hp; next.player.stats.hp = Math.min(next.player.stats.maxHp, next.player.stats.hp + effect.amount); const healed = next.player.stats.hp - beforeHp; combat.log.push(`${card.name} 恢复 ${effect.amount} 点气血。`); setCombatMoment(combat, { type: 'heal', text: `${card.name}为你治疗 ${healed} 点气血。` }) }
    if (effect.type === 'gain_inner_power') { next.player.stats.innerPower = Math.min(next.player.stats.maxInnerPower, next.player.stats.innerPower + effect.amount); combat.log.push(`${card.name} 恢复 ${effect.amount} 点内力。`) }
    if (effect.type === 'apply_status') { combat.enemyStatuses.push({ id: effect.status, amount: effect.amount }); combat.log.push(`${card.name} 施加 ${effect.status}。`); setCombatMoment(combat, { type: effect.status === 'poison' ? 'poison' : 'status', text: `${enemy.name}身中${describeStatusName(effect.status)} ${effect.amount} 层。` }) }
    if (effect.type === 'gain_demon_heart') next.player.stats.demonHeart += effect.amount
  }
  if (combat.enemyHp <= 0) { combat.result = 'victory'; combat.log.push('你赢得了战斗。'); return next }
  return next
}

export function endPlayerTurn(state: GameState, enemy: EnemyDefinition): GameState {
  const next = resolveEnemyTurn(state, enemy)
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
  if (intent.type === 'attack') { const damage = Math.max(0, intent.amount - combat.playerBlock - getEquippedStatBonus(next, 'defense')); next.player.stats.hp = Math.max(0, next.player.stats.hp - damage); combat.log.push(`${enemy.name} 攻击，造成 ${damage} 点伤害。`); setCombatMoment(combat, { type: 'player_hit', text: `${enemy.name}击中你，造成 ${damage} 点伤害。` }) }
  if (intent.type === 'guard') { combat.enemyBlock += intent.amount; combat.log.push(`${enemy.name} 转为守势。`); setCombatMoment(combat, { type: 'guard', text: `${enemy.name}转为守势，获得 ${intent.amount} 点格挡。` }) }
  if (intent.type === 'apply_status') { combat.playerStatuses.push({ id: intent.status, amount: intent.amount }); combat.log.push(`${enemy.name} 施加 ${intent.status}。`); setCombatMoment(combat, { type: intent.status === 'poison' ? 'poison' : 'status', text: `你身中${describeStatusName(intent.status)} ${intent.amount} 层。` }) }
  return next
}
