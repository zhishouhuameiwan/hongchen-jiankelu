import type { EnemyDefinition } from '../types/game'

export const enemies: EnemyDefinition[] = [
  { id: 'bandit', name: '山道劫匪', maxHp: 28, attack: 5, defense: 1, intents: [{ type: 'attack', amount: 6 }, { type: 'guard', amount: 4 }], rewardCardPool: ['basic_slash', 'basic_guard'], rewardSilver: 8 },
  { id: 'sword_house_disciple', name: '青霜剑派弟子', maxHp: 34, attack: 7, defense: 2, intents: [{ type: 'guard', amount: 5 }, { type: 'attack', amount: 8 }], rewardCardPool: ['cloud_step'], rewardSilver: 10 },
  { id: 'forest_iron_monk', name: '铁衣苦行僧', maxHp: 52, attack: 8, defense: 4, intents: [{ type: 'guard', amount: 10 }, { type: 'attack', amount: 9 }], rewardCardPool: ['iron_cloth'], rewardSilver: 12 },
  { id: 'mad_martial_artist', name: '走火入魔的江湖客', maxHp: 45, attack: 8, defense: 2, intents: [{ type: 'attack', amount: 9 }, { type: 'apply_status', status: 'vulnerable', amount: 1 }], rewardCardPool: ['blood_river_strike'], rewardSilver: 15 },
  { id: 'black_market_master', name: '黑市高手', maxHp: 60, attack: 10, defense: 3, intents: [{ type: 'guard', amount: 8 }, { type: 'attack', amount: 11 }, { type: 'apply_status', status: 'poison', amount: 3 }], rewardCardPool: ['red_lotus_poison', 'night_escape'], rewardSilver: 25 },
  { id: 'blood_river_puppet', name: '血河傀儡', maxHp: 85, attack: 13, defense: 4, intents: [{ type: 'attack', amount: 14 }, { type: 'apply_status', status: 'bleed', amount: 3 }], rewardCardPool: ['blood_river_strike'], rewardSilver: 40 },
]

export const enemyById = Object.fromEntries(enemies.map((enemy) => [enemy.id, enemy])) as Record<string, EnemyDefinition>
