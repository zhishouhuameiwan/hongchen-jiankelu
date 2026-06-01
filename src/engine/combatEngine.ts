import type { CardDefinition, CombatMoment, CombatPrepBonus, CombatTactic, EnemyDefinition, EnemyIntent, EnemyTactic, GameState } from '../types/game'
import { enemyById } from '../data/enemies'
import { cardById } from '../data/cards'
import { itemById } from '../data/items'
import { getEquipmentBonusText, getEquippedStatBonus } from './equipmentEngine'

export function drawCardIds(deck: string[], amount: number): string[] {
  if (deck.length <= amount) return deck
  return [...deck].sort(() => Math.random() - 0.5).slice(0, amount)
}

export function startCombat(state: GameState, enemy: EnemyDefinition): GameState {
  const prepBonuses = getCombatPrepBonuses(state)
  const afterOpeningFood = applyOpeningFoodBonus(state)
  const openingLogs = prepBonuses.map((bonus) => bonus.text)
  return { ...afterOpeningFood, screen: 'combat', currentCombat: { enemyId: enemy.id, enemyHp: enemy.maxHp, playerBlock: 0, enemyBlock: 0, turn: 1, actionPoints: 3, drawnCardIds: drawCardIds(state.deck, 4), playerStatuses: [], enemyStatuses: [], prepBonuses, log: [...openingLogs, `${enemy.name} 拦住了你的去路。`], lastMoment: prepBonuses.length ? { type: 'prep', text: prepBonuses.map((bonus) => bonus.text).join('；') } : undefined, actionTaken: false } }
}

function getCombatPrepBonuses(state: GameState): CombatPrepBonus[] {
  const equipmentBonuses = Object.values(state.equipment ?? {}).flatMap((cardId) => {
    if (!cardId) return []
    const text = getEquipmentBonusText(cardId)
    return text ? [{ id: `equipment:${cardId}`, text: `${cardById[cardId]?.name ?? cardId}备战：${text}` }] : []
  })
  const hasSteamedBun = (state.itemBag.steamed_bun ?? 0) > 0
  return hasSteamedBun ? [...equipmentBonuses, { id: 'food:steamed_bun', text: `${itemById.steamed_bun.name}备战：开战恢复 4 点气血与 1 点内力` }] : equipmentBonuses
}

function applyOpeningFoodBonus(state: GameState): GameState {
  if ((state.itemBag.steamed_bun ?? 0) <= 0) return state
  return {
    ...state,
    player: {
      ...state.player,
      stats: {
        ...state.player.stats,
        hp: Math.min(state.player.stats.maxHp, state.player.stats.hp + 4),
        innerPower: Math.min(state.player.stats.maxInnerPower, state.player.stats.innerPower + 1),
      },
    },
  }
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

function describeEquipmentPrepBonus(state: GameState, stat: 'attack' | 'defense'): string {
  const cardId = Object.values(state.equipment ?? {}).find((id) => id && cardById[id]?.bonuses?.some((bonus) => bonus.stat === stat))
  const card = cardId ? cardById[cardId] : undefined
  const bonus = card?.bonuses?.find((entry) => entry.stat === stat)
  return card && bonus ? `${card.name}备战：${stat === 'attack' ? '攻击' : '防御'} +${bonus.value}` : ''
}

export function getCardActionCost(card: CardDefinition): number {
  return card.costAction ?? 1
}

export type TacticMatchup = 'advantage' | 'neutral' | 'disadvantage'

export function getCardTactic(card: CardDefinition): CombatTactic {
  if (card.tactic) return card.tactic
  if (card.type === 'attack') return 'attack'
  if (card.type === 'defense') return 'guard'
  if (card.type === 'movement') return 'movement'
  if (card.type === 'inner') return 'inner'
  if (card.type === 'demonic') return 'demonic'
  if (card.type === 'romance') return 'romance'
  return 'trick'
}

export function fallbackEnemyTactic(intent: EnemyIntent): EnemyTactic {
  if (intent.tactic) return intent.tactic
  if (intent.type === 'attack') return 'assault'
  if (intent.type === 'guard') return 'guard'
  return 'cast'
}

export function getTacticMatchup(cardTactic: CombatTactic, enemyTactic: EnemyTactic): TacticMatchup {
  const advantages: Partial<Record<CombatTactic, EnemyTactic[]>> = {
    attack: ['charge'],
    guard: ['assault'],
    movement: ['assault', 'feint'],
    break: ['guard', 'charge', 'cast'],
    inner: ['cast'],
    trick: ['cast', 'feint'],
    demonic: ['charge'],
    romance: ['cast'],
  }
  const disadvantages: Partial<Record<CombatTactic, EnemyTactic[]>> = {
    attack: ['guard', 'feint'],
    guard: ['charge'],
    break: ['feint'],
    inner: ['assault'],
    demonic: ['feint'],
  }
  if (advantages[cardTactic]?.includes(enemyTactic)) return 'advantage'
  if (disadvantages[cardTactic]?.includes(enemyTactic)) return 'disadvantage'
  return 'neutral'
}

function getCurrentEnemyIntent(combat: NonNullable<GameState['currentCombat']>, enemy: EnemyDefinition): EnemyIntent {
  return combat.enemyIntentOverride ?? enemy.intents[(combat.turn - 1) % enemy.intents.length]
}

function enemyTacticLabel(tactic: EnemyTactic): string {
  const labels: Record<EnemyTactic, string> = { assault: '猛攻', guard: '守势', charge: '蓄势', cast: '施术', feint: '虚招' }
  return labels[tactic]
}

function addStatus(statuses: { id: string; amount: number }[], id: string, amount: number): void {
  const existing = statuses.find((status) => status.id === id)
  if (existing) existing.amount += amount
  else statuses.push({ id, amount })
}

function getStatusAmount(statuses: { id: string; amount: number }[], id: string): number {
  return statuses.find((status) => status.id === id)?.amount ?? 0
}

function reduceStatus(statuses: { id: string; amount: number }[], id: string, amount: number): void {
  const existing = statuses.find((status) => status.id === id)
  if (!existing) return
  existing.amount -= amount
  if (existing.amount <= 0) statuses.splice(statuses.indexOf(existing), 1)
}

function tickDamageStatus(
  combat: NonNullable<GameState['currentCombat']>,
  side: 'enemy' | 'player',
  id: 'bleed' | 'poison',
  applyDamage: (amount: number) => void,
): void {
  const statuses = side === 'enemy' ? combat.enemyStatuses : combat.playerStatuses
  const amount = getStatusAmount(statuses, id)
  if (amount <= 0) return
  applyDamage(amount)
  combat.log.push(`${side === 'enemy' ? '敌人' : '你'}受到${describeStatusName(id)} ${amount} 点伤害。`)
  reduceStatus(statuses, id, 1)
}

function applyEndOfTurnStatuses(next: GameState): void {
  const combat = next.currentCombat
  if (!combat) return
  tickDamageStatus(combat, 'enemy', 'bleed', (amount) => { combat.enemyHp = Math.max(0, combat.enemyHp - amount) })
  tickDamageStatus(combat, 'enemy', 'poison', (amount) => { combat.enemyHp = Math.max(0, combat.enemyHp - amount) })
  tickDamageStatus(combat, 'player', 'bleed', (amount) => { next.player.stats.hp = Math.max(0, next.player.stats.hp - amount) })
  tickDamageStatus(combat, 'player', 'poison', (amount) => { next.player.stats.hp = Math.max(0, next.player.stats.hp - amount) })
}

function getCombatActionPoints(combat: NonNullable<GameState['currentCombat']>): number {
  return combat.actionPoints ?? 3
}

function removeOneCardId(cardIds: string[], cardId: string): string[] {
  const index = cardIds.indexOf(cardId)
  if (index === -1) return cardIds
  return [...cardIds.slice(0, index), ...cardIds.slice(index + 1)]
}

export function playCombatCard(state: GameState, card: CardDefinition): GameState {
  const next: GameState = structuredClone(state)
  const combat = next.currentCombat
  if (!combat) return next
  const actionCost = getCardActionCost(card)
  const actionPoints = getCombatActionPoints(combat)
  if (actionPoints < actionCost) { combat.log.push(`行动点不足，无法施展${card.name}。`); return next }
  if (next.player.stats.innerPower < card.costInnerPower) { combat.log.push('内力不足。'); return next }
  const enemy = enemyById[combat.enemyId]
  if (!enemy) return next
  const cardTactic = getCardTactic(card)
  const enemyIntent = getCurrentEnemyIntent(combat, enemy)
  const enemyTactic = fallbackEnemyTactic(enemyIntent)
  const matchup = getTacticMatchup(cardTactic, enemyTactic)
  next.player.stats.innerPower -= card.costInnerPower
  combat.actionPoints = actionPoints - actionCost
  combat.drawnCardIds = removeOneCardId(combat.drawnCardIds, card.id)
  combat.actionTaken = true
  for (const effect of card.effects) {
    if (effect.type === 'damage') {
      const attackBonus = getEquippedStatBonus(next, 'attack')
      const tacticDamage = matchup === 'advantage' ? 3 : matchup === 'disadvantage' ? -3 : 0
      const vulnerableBonus = getStatusAmount(combat.enemyStatuses, 'vulnerable') > 0 ? 4 : 0
      const damage = Math.max(0, effect.amount + attackBonus + tacticDamage + vulnerableBonus - combat.enemyBlock)
      combat.enemyHp = Math.max(0, combat.enemyHp - damage)
      if (vulnerableBonus > 0) {
        combat.log.push(`${enemy.name}露出破绽，额外承受 ${vulnerableBonus} 点伤害。`)
        reduceStatus(combat.enemyStatuses, 'vulnerable', 1)
      }
      const bonusText = attackBonus > 0 ? `（${describeEquipmentPrepBonus(next, 'attack')}）` : ''
      combat.log.push(`${card.name} 造成 ${damage} 点伤害。${bonusText}`)
      if (matchup === 'disadvantage') combat.log.push(`${card.name}打在${enemyTacticLabel(enemyTactic)}上，伤害降低。`)
      if (matchup === 'advantage') combat.log.push(`${card.name}克制${enemyTacticLabel(enemyTactic)}，伤势更重。`)
      setCombatMoment(combat, { type: 'enemy_hit', text: `${card.name}命中${enemy.name}，造成 ${damage} 点伤害。${bonusText}` })
    }
    if (effect.type === 'block') {
      const tacticBlockBonus = matchup === 'advantage' && (cardTactic === 'guard' || cardTactic === 'movement') ? 3 : 0
      const block = effect.amount + getEquippedStatBonus(next, 'defense') + tacticBlockBonus
      combat.playerBlock += block
      combat.log.push(`${card.name} 获得 ${block} 点格挡。`)
      setCombatMoment(combat, { type: 'guard', text: `${card.name}护住周身，获得 ${block} 点格挡。` })
    }
    if (effect.type === 'heal') { const beforeHp = next.player.stats.hp; next.player.stats.hp = Math.min(next.player.stats.maxHp, next.player.stats.hp + effect.amount); const healed = next.player.stats.hp - beforeHp; combat.log.push(`${card.name} 恢复 ${effect.amount} 点气血。`); setCombatMoment(combat, { type: 'heal', text: `${card.name}为你治疗 ${healed} 点气血。` }) }
    if (effect.type === 'gain_inner_power') { next.player.stats.innerPower = Math.min(next.player.stats.maxInnerPower, next.player.stats.innerPower + effect.amount); combat.log.push(`${card.name} 恢复 ${effect.amount} 点内力。`) }
    if (effect.type === 'apply_status') { combat.enemyStatuses.push({ id: effect.status, amount: effect.amount }); combat.log.push(`${card.name} 施加 ${effect.status}。`); setCombatMoment(combat, { type: effect.status === 'poison' ? 'poison' : 'status', text: `${enemy.name}身中${describeStatusName(effect.status)} ${effect.amount} 层。` }) }
    if (effect.type === 'gain_demon_heart') next.player.stats.demonHeart += effect.amount
  }
  if (cardTactic === 'break' && matchup === 'advantage') {
    addStatus(combat.enemyStatuses, 'vulnerable', 1)
    combat.log.push(`${card.name}破开${enemyTacticLabel(enemyTactic)}，敌人露出破绽。`)
  }
  if (combat.enemyHp <= 0) { combat.result = 'victory'; combat.log.push('你赢得了战斗。'); return next }
  return next
}

export function endPlayerTurn(state: GameState, enemy: EnemyDefinition): GameState {
  const next = resolveEnemyTurn(state, enemy)
  applyEndOfTurnStatuses(next)
  if (!next.currentCombat) return next
  if (next.player.stats.hp <= 0) { next.currentCombat.result = 'defeat'; next.currentCombat.log.push('你败下阵来。'); return next }
  next.currentCombat.turn += 1
  next.currentCombat.playerBlock = 0
  next.currentCombat.enemyBlock = 0
  next.currentCombat.drawnCardIds = drawCardIds(next.deck, 4)
  next.currentCombat.actionPoints = 3
  next.currentCombat.actionTaken = false
  return next
}

export function resolveEnemyTurn(state: GameState, enemy: EnemyDefinition): GameState {
  const next: GameState = structuredClone(state)
  const combat = next.currentCombat
  if (!combat) return next
  const intent = combat.enemyIntentOverride ?? enemy.intents[(combat.turn - 1) % enemy.intents.length]
  if (intent.type === 'attack') {
    const sealedAmount = getStatusAmount(combat.playerStatuses, 'sealed')
    const sealedReduction = sealedAmount > 0 ? 2 : 0
    if (sealedReduction > 0) {
      combat.log.push(`封脉压住经络，${enemy.name}攻势减弱 ${sealedReduction} 点。`)
      reduceStatus(combat.playerStatuses, 'sealed', 1)
    }
    const damage = Math.max(0, intent.amount - sealedReduction - combat.playerBlock - getEquippedStatBonus(next, 'defense'))
    next.player.stats.hp = Math.max(0, next.player.stats.hp - damage)
    combat.log.push(`${enemy.name} 攻击，造成 ${damage} 点伤害。`)
    if (damage > 0 && getStatusAmount(combat.playerStatuses, 'counter') > 0) {
      const counterDamage = 3
      combat.enemyHp = Math.max(0, combat.enemyHp - counterDamage)
      combat.log.push(`你借势反击，造成 ${counterDamage} 点伤害。`)
      reduceStatus(combat.playerStatuses, 'counter', 1)
    }
    setCombatMoment(combat, { type: 'player_hit', text: `${enemy.name}击中你，造成 ${damage} 点伤害。` })
  }
  if (intent.type === 'guard') { combat.enemyBlock += intent.amount; combat.log.push(`${enemy.name} 转为守势。`); setCombatMoment(combat, { type: 'guard', text: `${enemy.name}转为守势，获得 ${intent.amount} 点格挡。` }) }
  if (intent.type === 'apply_status') { combat.playerStatuses.push({ id: intent.status, amount: intent.amount }); combat.log.push(`${enemy.name} 施加 ${intent.status}。`); setCombatMoment(combat, { type: intent.status === 'poison' ? 'poison' : 'status', text: `你身中${describeStatusName(intent.status)} ${intent.amount} 层。` }) }
  return next
}
