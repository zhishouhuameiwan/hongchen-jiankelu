import { describe, expect, it } from 'vitest'
import { gainItem, useItem } from '../engine/itemEngine'
import { makeState } from './helpers'

describe('itemEngine', () => {
  it('adds stackable consumables to the item bag', () => {
    const next = gainItem(makeState(), 'small_healing_pill', 2)

    expect(next.itemBag.small_healing_pill).toBe(2)
    expect(next.deck).not.toContain('small_healing_pill')
    expect(next.equipmentBag).not.toContain('small_healing_pill')
  })

  it('uses a healing item and consumes one stack', () => {
    const wounded = {
      ...gainItem(makeState(), 'small_healing_pill', 2),
      player: { ...makeState().player, stats: { ...makeState().player.stats, hp: 45 } },
    }

    const next = useItem(wounded, 'small_healing_pill')

    expect(next.player.stats.hp).toBe(57)
    expect(next.itemBag.small_healing_pill).toBe(1)
    expect(next.log.at(-1)).toBe('使用物品：小还丹。')
  })

  it('uses stamina and inner power items without exceeding maximums', () => {
    const state = {
      ...gainItem(gainItem(makeState(), 'dry_ration'), 'qi_recovery_powder'),
      stamina: 5,
      player: { ...makeState().player, stats: { ...makeState().player.stats, innerPower: 2 } },
    }

    const afterFood = useItem(state, 'dry_ration')
    const afterPowder = useItem(afterFood, 'qi_recovery_powder')

    expect(afterFood.stamina).toBe(6)
    expect(afterPowder.player.stats.innerPower).toBe(3)
    expect(afterPowder.itemBag.dry_ration).toBeUndefined()
    expect(afterPowder.itemBag.qi_recovery_powder).toBeUndefined()
  })
})
