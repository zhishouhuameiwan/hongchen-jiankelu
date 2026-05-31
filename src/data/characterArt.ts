import type { CombatStatus, EnemyDefinition, HeroineDefinition } from '../types/game'

export const playerAvatarByBackgroundId: Record<string, string> = {
  wandering_swordsman: '/assets/figures/players/wandering_swordsman.svg',
  fallen_noble: '/assets/figures/players/fallen_noble.svg',
  medicine_apprentice: '/assets/figures/players/medicine_apprentice.svg',
  street_survivor: '/assets/figures/players/street_survivor.svg',
}

export const heroineArtById: Record<HeroineDefinition['id'], string> = {
  shen_qingshuang: '/assets/figures/heroines/shen_qingshuang.svg',
  luo_hongling: '/assets/figures/heroines/luo_hongling.svg',
  bai_zhi: '/assets/figures/heroines/bai_zhi.svg',
}

export const enemyArtById: Record<EnemyDefinition['id'], string> = {
  bandit: '/assets/figures/enemies/bandit.svg',
  sword_house_disciple: '/assets/figures/enemies/sword_house_disciple.svg',
  forest_iron_monk: '/assets/figures/enemies/forest_iron_monk.svg',
  mad_martial_artist: '/assets/figures/enemies/mad_martial_artist.svg',
  black_market_master: '/assets/figures/enemies/black_market_master.svg',
  ch1_black_market_boss: '/assets/figures/enemies/ch1_black_market_boss.svg',
  blood_river_puppet: '/assets/figures/enemies/blood_river_puppet.svg',
}

export const statusIconById: Record<CombatStatus['id'], string> = {
  poison: '/assets/statuses/poison.svg',
  bleed: '/assets/statuses/bleed.svg',
  sealed: '/assets/statuses/sealed.svg',
  vulnerable: '/assets/statuses/vulnerable.svg',
  counter: '/assets/statuses/counter.svg',
}
