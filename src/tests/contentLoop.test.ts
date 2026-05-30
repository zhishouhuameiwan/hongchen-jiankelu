import { describe, expect, it } from 'vitest'
import { events } from '../data/events'
import { cardById } from '../data/cards'
import { enemyById } from '../data/enemies'

describe('combat and growth content loop', () => {
  it('contains a night-only high-risk black market event', () => {
    const event = events.find((candidate) => candidate.id === 'ruined_temple_black_market_ambush_01')

    expect(event).toBeDefined()
    expect(event?.phase).toBe('night')
    expect(event?.locationId).toBe('ruined_temple')
    expect(event?.choices.some((choice) => choice.effects.some((effect) => effect.type === 'start_combat'))).toBe(true)
    expect(event?.choices.some((choice) => choice.effects.some((effect) => effect.type === 'damage'))).toBe(true)
    expect(event?.choices.some((choice) => choice.effects.some((effect) => effect.type === 'gain_silver' && effect.value >= 25))).toBe(true)
  })

  it('contains a late blood river pressure event after day 25', () => {
    const event = events.find((candidate) => candidate.id === 'ruined_temple_blood_altar_01')

    expect(event).toBeDefined()
    expect(event?.requirements).toEqual(expect.arrayContaining([{ type: 'day_min', value: 25 }]))
    expect(event?.requirements).toEqual(expect.arrayContaining([{ type: 'flag', value: 'blood_river_fragment_found' }]))
    expect(event?.choices.some((choice) => choice.effects.some((effect) => effect.type === 'start_combat'))).toBe(true)
    expect(event?.choices.some((choice) => choice.effects.some((effect) => effect.type === 'gain_card' && effect.cardId === 'blood_river_strike'))).toBe(true)
  })

  it('contains a midgame blood river investigation that bridges rumor to final choice', () => {
    const event = events.find((candidate) => candidate.id === 'teahouse_blood_river_investigation_02')

    expect(event).toBeDefined()
    expect(event?.requirements).toEqual(expect.arrayContaining([{ type: 'flag', value: 'heard_blood_river_rumor' }]))
    expect(event?.requirements).toEqual(expect.arrayContaining([{ type: 'flag_missing', value: 'blood_river_fragment_found' }]))
    expect(event?.choices.some((choice) => choice.effects.some((effect) => effect.type === 'set_flag' && effect.value === 'blood_river_fragment_found'))).toBe(true)
  })

  it('has training and crisis events that grant non-starter growth cards', () => {
    const growthCardIds = events.flatMap((event) => event.choices.flatMap((choice) => choice.effects.filter((effect) => effect.type === 'gain_card').map((effect) => effect.cardId)))
    const nonStarterGrowthCards = growthCardIds.filter((id) => cardById[id]?.source !== 'starter')

    expect(nonStarterGrowthCards).toEqual(expect.arrayContaining(['cloud_step', 'iron_cloth', 'blood_river_strike']))
  })

  it('offers a risky inner power training event before late-game card costs spike', () => {
    const event = events.find((candidate) => candidate.id === 'forest_inner_power_trial_01')

    expect(event).toBeDefined()
    expect(event?.locationId).toBe('forest')
    expect(event?.choices.some((choice) => choice.effects.some((effect) => effect.type === 'increase_max_stamina'))).toBe(true)
    expect(event?.choices.some((choice) => choice.effects.some((effect) => effect.type === 'stat' && effect.stat === 'maxInnerPower'))).toBe(true)
  })

  it('offers more than baseline combat encounters through events', () => {
    const combatEnemyIds = new Set(events.flatMap((event) => event.choices.flatMap((choice) => choice.effects.filter((effect) => effect.type === 'start_combat').map((effect) => effect.enemyId))))

    expect(combatEnemyIds.size).toBeGreaterThanOrEqual(5)
    expect([...combatEnemyIds].every((id) => Boolean(enemyById[id]))).toBe(true)
  })
})
