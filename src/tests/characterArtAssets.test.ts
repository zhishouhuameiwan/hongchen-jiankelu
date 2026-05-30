import { describe, expect, it } from 'vitest'
import { enemies } from '../data/enemies'
import { heroines } from '../data/world'
import { enemyArtById, heroineArtById, playerAvatarByBackgroundId, statusIconById } from '../data/characterArt'

const backgroundIds = ['wandering_swordsman', 'fallen_noble', 'medicine_apprentice', 'street_survivor']
const statusIds = ['poison', 'bleed', 'sealed', 'vulnerable', 'counter']

describe('character art assets', () => {
  it('maps every heroine and enemy to ancient-style figure portrait assets', () => {
    expect(Object.keys(heroineArtById).sort()).toEqual(heroines.map((heroine) => heroine.id).sort())
    expect(Object.keys(enemyArtById).sort()).toEqual(enemies.map((enemy) => enemy.id).sort())
    for (const heroine of heroines) expect(heroineArtById[heroine.id]).toBe(`/assets/figures/heroines/${heroine.id}.svg`)
    for (const enemy of enemies) expect(enemyArtById[enemy.id]).toBe(`/assets/figures/enemies/${enemy.id}.svg`)
  })

  it('maps every player background to ancient-style figure avatar assets', () => {
    expect(Object.keys(playerAvatarByBackgroundId).sort()).toEqual([...backgroundIds].sort())
    for (const id of backgroundIds) expect(playerAvatarByBackgroundId[id]).toBe(`/assets/figures/players/${id}.svg`)
  })

  it('maps combat status ids to icon assets', () => {
    expect(Object.keys(statusIconById).sort()).toEqual([...statusIds].sort())
    for (const id of statusIds) expect(statusIconById[id]).toBe(`/assets/statuses/${id}.svg`)
  })
})
