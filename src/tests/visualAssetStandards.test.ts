import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cards } from '../data/cards'
import { cardArtById } from '../data/cardArt'
import { items } from '../data/items'
import { itemArtById } from '../data/itemArt'
import { locations } from '../data/world'
import { locationArtById } from '../data/locationArt'
import { enemyArtById, heroineArtById, playerAvatarByBackgroundId, statusIconById } from '../data/characterArt'

const assetRoot = join(process.cwd(), 'public/assets')
const expectedAspectRatio = 3 / 4
const smallArtWidth = 120
const smallArtHeight = 160
const figureArtWidth = 360
const figureArtHeight = 480

type AssetExpectation = {
  path: string
  width: number
  height: number
  kind: string
}

function svgFor(publicPath: string) {
  return readFileSync(join(assetRoot, publicPath.replace('/assets/', '')), 'utf-8')
}

function viewBoxSize(svg: string) {
  const match = svg.match(/viewBox="[\d.-]+ [\d.-]+ ([\d.]+) ([\d.]+)"/)
  expect(match, 'SVG should declare a numeric viewBox').not.toBeNull()
  return { width: Number(match![1]), height: Number(match![2]) }
}

const smallAssetExpectations = [
  ...cards.map((card) => ({ path: cardArtById[card.id], width: smallArtWidth, height: smallArtHeight, kind: `card ${card.id}` })),
  ...items.map((item) => ({ path: itemArtById[item.id], width: smallArtWidth, height: smallArtHeight, kind: `item ${item.id}` })),
  ...locations.map((location) => ({ path: locationArtById[location.id], width: smallArtWidth, height: smallArtHeight, kind: `location ${location.id}` })),
  ...Object.values(statusIconById).map((path) => ({ path, width: smallArtWidth, height: smallArtHeight, kind: `status ${path}` })),
] satisfies AssetExpectation[]

const figureAssetExpectations = [
  ...Object.values(playerAvatarByBackgroundId).map((path) => ({ path, width: figureArtWidth, height: figureArtHeight, kind: `player ${path}` })),
  ...Object.values(heroineArtById).map((path) => ({ path, width: figureArtWidth, height: figureArtHeight, kind: `heroine ${path}` })),
  ...Object.values(enemyArtById).map((path) => ({ path, width: figureArtWidth, height: figureArtHeight, kind: `enemy ${path}` })),
] satisfies AssetExpectation[]

describe('visual asset size standards', () => {
  it('keeps non-character art as small 3:4 SVGs for consistent cards and inventory icons', () => {
    for (const expectation of smallAssetExpectations) {
      const size = viewBoxSize(svgFor(expectation.path))
      expect(size, expectation.kind).toEqual({ width: expectation.width, height: expectation.height })
      expect(size.width / size.height, expectation.kind).toBe(expectedAspectRatio)
    }
  })

  it('keeps character figure art in the shared 3:4 portrait format', () => {
    for (const expectation of figureAssetExpectations) {
      const svg = svgFor(expectation.path)
      const size = viewBoxSize(svg)
      expect(size, expectation.kind).toEqual({ width: expectation.width, height: expectation.height })
      expect(size.width / size.height, expectation.kind).toBe(expectedAspectRatio)
      expect(svg, expectation.kind).toMatch(/data-kind="(?:player|heroine|enemy)"/)
      expect(svg, expectation.kind).toMatch(/古风武侠|水墨|江湖/)
    }
  })

  it('marks equipment and cooking assets as object art instead of generic combat card art', () => {
    const equipmentCards = cards.filter((card) => card.type === 'equipment')
    for (const card of equipmentCards) {
      const svg = svgFor(cardArtById[card.id])
      expect(svg, `equipment ${card.id}`).toMatch(/data-kind="equipment"/)
      expect(svg, `equipment ${card.id}`).toMatch(/装备|道具/)
      expect(svg, `equipment ${card.id}`).not.toMatch(/data-kind="card"/)
    }

    const cookingItems = items.filter((item) => item.source === 'cooking' || item.category === 'food' || item.category === 'ingredient')
    for (const item of cookingItems) {
      const svg = svgFor(itemArtById[item.id])
      expect(svg, `cooking item ${item.id}`).toMatch(/data-kind="(?:food|ingredient)"/)
      expect(svg, `cooking item ${item.id}`).toMatch(/厨艺|食物|食材/)
    }
  })
})
