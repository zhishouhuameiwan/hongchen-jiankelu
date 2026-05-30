import { describe, expect, it } from 'vitest'
import { createInitialGameState } from '../store/gameStore'
import { equipEquipmentCard, getEquippedStatBonus, unequipEquipmentCard } from '../engine/equipmentEngine'
import { cardById } from '../data/cards'

describe('equipment cards', () => {
  it('equips one weapon card and applies its attack bonus without adding it to the combat deck', () => {
    const state = createInitialGameState('测试侠客', 'wandering_swordsman')

    const next = equipEquipmentCard(state, 'plain_iron_sword')

    expect(next.equipment.weapon).toBe('plain_iron_sword')
    expect(getEquippedStatBonus(next, 'attack')).toBe(2)
    expect(next.deck).not.toContain('plain_iron_sword')
    expect(cardById.plain_iron_sword.type).toBe('equipment')
  })

  it('replaces equipment in the same slot instead of stacking both bonuses', () => {
    const state = createInitialGameState('测试侠客', 'wandering_swordsman')
    const withSword = equipEquipmentCard(state, 'plain_iron_sword')

    const next = equipEquipmentCard(withSword, 'cold_iron_blade')

    expect(next.equipment.weapon).toBe('cold_iron_blade')
    expect(getEquippedStatBonus(next, 'attack')).toBe(3)
    expect(next.equipmentBag).toEqual(expect.arrayContaining(['plain_iron_sword', 'cold_iron_blade']))
  })

  it('can unequip a card and remove its stat bonus', () => {
    const equipped = equipEquipmentCard(createInitialGameState('测试侠客', 'wandering_swordsman'), 'plain_iron_sword')

    const next = unequipEquipmentCard(equipped, 'weapon')

    expect(next.equipment.weapon).toBeUndefined()
    expect(getEquippedStatBonus(next, 'attack')).toBe(0)
    expect(next.equipmentBag).toContain('plain_iron_sword')
  })

  it('tracks bonuses from multiple equipment slots at once', () => {
    const state = createInitialGameState('测试侠客', 'wandering_swordsman')
    const next = ['cold_iron_blade', 'woven_bamboo_armor', 'shadowstep_boots', 'jade_peace_talisman'].reduce(
      (current, cardId) => equipEquipmentCard(current, cardId),
      state,
    )

    expect(next.equipment.weapon).toBe('cold_iron_blade')
    expect(next.equipment.armor).toBe('woven_bamboo_armor')
    expect(next.equipment.boots).toBe('shadowstep_boots')
    expect(next.equipment.accessory).toBe('jade_peace_talisman')
    expect(getEquippedStatBonus(next, 'attack')).toBe(3)
    expect(getEquippedStatBonus(next, 'defense')).toBe(2)
    expect(getEquippedStatBonus(next, 'agility')).toBe(1)
    expect(getEquippedStatBonus(next, 'maxHp')).toBe(6)
  })
})
