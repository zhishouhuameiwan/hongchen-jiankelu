import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { locations } from '../data/world'
import { locationArtById } from '../data/locationArt'

const assetRoot = join(process.cwd(), 'public/assets')

describe('location art assets', () => {
  it('maps every selectable location card to an ancient wuxia scene image', () => {
    expect(Object.keys(locationArtById).sort()).toEqual(locations.map((location) => location.id).sort())

    for (const location of locations) {
      const path = locationArtById[location.id]
      expect(path).toBe(`/assets/locations/${location.id}.svg`)

      const svg = readFileSync(join(assetRoot, `locations/${location.id}.svg`), 'utf-8')
      expect(svg).toContain('data-art-direction="ancient-wuxia"')
      expect(svg).toContain('data-kind="location"')
      expect(svg).toContain(location.name)
      expect(svg).toMatch(/古风武侠|江湖|水墨/)
    }
  })

  it('gives the clinic card a specific ancient wuxia medical hall illustration', () => {
    const svg = readFileSync(join(assetRoot, 'locations/clinic.svg'), 'utf-8')

    expect(svg).toContain('百草医馆')
    expect(svg).toContain('古风武侠医馆')
    expect(svg).toMatch(/药柜|药香|银针|医馆/)
  })
})
