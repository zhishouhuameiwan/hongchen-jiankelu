import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { items } from '../data/items'
import { itemArtById } from '../data/itemArt'

const assetRoot = join(process.cwd(), 'public/assets/items')

describe('item art assets', () => {
  it('maps every item definition to a public SVG item art path', () => {
    expect(Object.keys(itemArtById).sort()).toEqual(items.map((item) => item.id).sort())

    for (const item of items) {
      const path = itemArtById[item.id]
      expect(path).toBe(`/assets/items/${item.id}.svg`)

      const svg = readFileSync(join(assetRoot, `${item.id}.svg`), 'utf-8')
      const expectedArtDirection = item.source === 'cooking' || item.category === 'food' || item.category === 'ingredient'
        ? 'ancient-wuxia-cooking'
        : 'ancient-wuxia-item'
      expect(svg).toContain(`data-art-direction="${expectedArtDirection}"`)
      expect(svg).toContain(`data-item-id="${item.id}"`)
      expect(svg).toContain(item.name)
    }
  })

  it('gives food and ingredients semantically matching illustrations', () => {
    const requiredKeywords: Record<string, RegExp> = {
      dry_ration: /干粮|行路口粮|布包|饼/,
      steamed_bun: /蒸饼|热气|面点|蒸笼/,
      herb_chicken_soup: /药膳鸡汤|鸡汤|药草|砂锅/,
      wheat_flour: /麦粉|面粉|粉袋|麦穗/,
      spring_water: /山泉水|水囊|泉水|青瓷瓶/,
      wild_herb: /野山草|草药|药草|藤篮/,
      young_chicken: /童子鸡|鸡|竹篮|食材/,
    }

    for (const [itemId, pattern] of Object.entries(requiredKeywords)) {
      const svg = readFileSync(join(assetRoot, `${itemId}.svg`), 'utf-8')
      expect(svg).toMatch(pattern)
    }
  })
})
