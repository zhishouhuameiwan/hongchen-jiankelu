import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import packageJson from '../../package.json' with { type: 'json' }
import { cards } from '../data/cards'
import { cardArtById } from '../data/cardArt'
import { items } from '../data/items'
import { itemArtById } from '../data/itemArt'
import { enemies } from '../data/enemies'
import { locations, heroines } from '../data/world'
import { enemyArtById, heroineArtById, playerAvatarByBackgroundId, statusIconById } from '../data/characterArt'
import { locationArtById } from '../data/locationArt'

const root = process.cwd()
const promptDoc = join(root, 'docs/doubao-image-prompts.md')
const importScript = join(root, 'scripts/import-doubao-art.py')
const manifestScript = join(root, 'scripts/list-art-assets.py')

const backgroundIds = ['wandering_swordsman', 'fallen_noble', 'medicine_apprentice', 'street_survivor'] as const
const statusIds = ['poison', 'bleed', 'sealed', 'vulnerable', 'counter'] as const

const activeAssets = [
  ...cards.map((card) => ({ id: card.id, path: cardArtById[card.id] })),
  ...items.map((item) => ({ id: item.id, path: itemArtById[item.id] })),
  ...locations.map((location) => ({ id: location.id, path: locationArtById[location.id] })),
  ...enemies.map((enemy) => ({ id: enemy.id, path: enemyArtById[enemy.id] })),
  ...heroines.map((heroine) => ({ id: heroine.id, path: heroineArtById[heroine.id] })),
  ...backgroundIds.map((id) => ({ id, path: playerAvatarByBackgroundId[id] })),
  ...statusIds.map((id) => ({ id, path: statusIconById[id] })),
]

describe('Doubao art replacement pipeline', () => {
  it('documents a Doubao prompt for every active visual asset id', () => {
    const doc = readFileSync(promptDoc, 'utf-8')

    for (const asset of activeAssets) {
      expect(doc, asset.id).toContain(`\`${asset.id}\``)
      expect(doc, asset.id).toContain(asset.path)
    }
  })

  it('provides npm scripts for listing, importing, and validating generated Doubao art', () => {
    expect(packageJson.scripts['art:list']).toBe('python3 scripts/list-art-assets.py')
    expect(packageJson.scripts['art:import-doubao']).toBe('python3 scripts/import-doubao-art.py')
    expect(packageJson.scripts['art:validate']).toBe('python3 scripts/import-doubao-art.py --check')
    expect(existsSync(manifestScript)).toBe(true)
    expect(existsSync(importScript)).toBe(true)
  })

  it('keeps manifest paths stable as SVG wrappers while accepting raster Doubao sources', () => {
    const script = readFileSync(importScript, 'utf-8')

    expect(script).toContain('SOURCE_ROOT = ROOT / "art-source" / "doubao"')
    expect(script).toContain('SUPPORTED_SOURCE_SUFFIXES')
    expect(script).toMatch(/\.png|\.webp|\.jpg|\.jpeg/)
    expect(script).toContain('<image')
    expect(script).toContain('data-generated-by="doubao"')

    for (const asset of activeAssets) {
      expect(asset.path, asset.id).toMatch(/^\/assets\/.+\.svg$/)
    }
  })
})
