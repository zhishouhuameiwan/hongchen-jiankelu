import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const assetRoot = join(process.cwd(), 'public/assets')
const svgFiles = [
  'cards/basic_slash.svg',
  'cards/basic_guard.svg',
  'cards/basic_breath.svg',
  'cards/cloud_step.svg',
  'cards/iron_cloth.svg',
  'cards/qingshuang_sword.svg',
  'cards/stand_together.svg',
  'cards/frost_seal.svg',
  'cards/red_lotus_poison.svg',
  'cards/night_escape.svg',
  'cards/red_lotus_bloom.svg',
  'cards/silver_needle.svg',
  'cards/clear_mind_powder.svg',
  'cards/life_returning_needle.svg',
  'cards/blood_river_strike.svg',
  'figures/players/wandering_swordsman.svg',
  'figures/players/fallen_noble.svg',
  'figures/players/medicine_apprentice.svg',
  'figures/players/street_survivor.svg',
  'figures/enemies/bandit.svg',
  'figures/enemies/sword_house_disciple.svg',
  'figures/enemies/forest_iron_monk.svg',
  'figures/enemies/mad_martial_artist.svg',
  'figures/enemies/black_market_master.svg',
  'figures/enemies/blood_river_puppet.svg',
  'figures/heroines/shen_qingshuang.svg',
  'figures/heroines/luo_hongling.svg',
  'figures/heroines/bai_zhi.svg',
  'statuses/poison.svg',
  'statuses/bleed.svg',
  'statuses/sealed.svg',
  'statuses/vulnerable.svg',
  'statuses/counter.svg',
]

describe('ancient wuxia art direction', () => {
  it('regenerates every active SVG asset with ancient wuxia metadata', () => {
    for (const file of svgFiles) {
      const svg = readFileSync(join(assetRoot, file), 'utf8')
      expect(svg).toContain('data-art-direction="ancient-wuxia"')
      expect(svg).toMatch(/古风|武侠|江湖|剑|侠|红颜|山水|水墨/)
    }
  })

  it('uses beautiful named heroine portrait metadata for all heroine images', () => {
    const heroines = [
      ['figures/heroines/shen_qingshuang.svg', '沈青霜'],
      ['figures/heroines/luo_hongling.svg', '洛红绫'],
      ['figures/heroines/bai_zhi.svg', '白芷'],
    ] as const

    for (const [file, name] of heroines) {
      const svg = readFileSync(join(assetRoot, file), 'utf8')
      expect(svg).toContain(`data-character="${name}"`)
      expect(svg).toContain('漂亮红颜')
      expect(svg).toContain('<title>')
    }
  })
})
