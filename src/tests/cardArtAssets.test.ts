import { describe, expect, it } from 'vitest'
import { cards } from '../data/cards'
import { cardArtById } from '../data/cardArt'

describe('card art asset manifest', () => {
  it('maps every card definition to a public SVG card art path', () => {
    expect(Object.keys(cardArtById).sort()).toEqual(cards.map((card) => card.id).sort())

    for (const card of cards) {
      expect(cardArtById[card.id]).toBe(`/assets/cards/${card.id}.svg`)
    }
  })
})
