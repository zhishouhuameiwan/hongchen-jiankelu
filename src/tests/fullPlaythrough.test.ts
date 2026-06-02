import { describe, expect, it } from 'vitest'
import { events } from '../data/events'
import { getLocationGuidance } from '../engine/locationGuidanceEngine'
import { getCurrentGoal } from '../engine/goalEngine'
import { applyChoice, pickEventForLocation } from '../engine/eventEngine'
import { cookRecipe } from '../engine/cookingEngine'
import { equipEquipmentCard } from '../engine/equipmentEngine'
import { advancePhase } from '../engine/dayPhaseEngine'
import { enemyById } from '../data/enemies'
import { cardById } from '../data/cards'
import type { GameState, LocationId } from '../types/game'
import { makeState } from './helpers'

const chooseOnlyOption = (state: GameState, locationId: LocationId, eventId: string, choiceId: string): GameState => {
  const event = pickEventForLocation(state, events, locationId)
  expect(event.id).toBe(eventId)
  const choice = event.choices.find((candidate) => candidate.id === choiceId)
  expect(choice).toBeDefined()
  return applyChoice({ ...state, currentEventId: event.id }, choice!)
}

const finishVictory = (state: GameState): GameState => {
  expect(state.currentCombat?.enemyId).toBeDefined()
  const enemyId = state.currentCombat!.enemyId
  const enemy = enemyById[enemyId]
  const rewardCard = enemy.rewardCardPool[0]
  const gainedNewCard = !state.deck.includes(rewardCard)
  const nextFlags = [...state.flags]
  const addFlag = (flag: string) => {
    if (!nextFlags.includes(flag)) nextFlags.push(flag)
  }
  if (enemyId === 'ch1_black_market_boss') {
    addFlag('ch1_black_market_boss_defeated')
    addFlag('blood_river_fragment_found')
  }
  if (state.currentEventId === 'ch3_forest_blood_river_remnant_01') {
    addFlag('ch3_blood_river_remnant_defeated')
    addFlag('blood_river_complete_scroll_found')
  }
  return advancePhase({
    ...state,
    screen: 'map',
    currentCombat: undefined,
    currentEventId: undefined,
    currentLocationId: undefined,
    flags: nextFlags,
    deck: gainedNewCard ? [...state.deck, rewardCard] : state.deck,
    itemBag: { ...state.itemBag, small_healing_pill: (state.itemBag.small_healing_pill ?? 0) + 1 },
    player: { ...state.player, silver: state.player.silver + enemy.rewardSilver },
    log: [...state.log, `测试结算：${enemyId} 战斗胜利，获得 ${enemy.rewardSilver} 两与 ${cardById[rewardCard]?.name ?? rewardCard}。`],
  })
}

describe('full critical-path playthrough regression', () => {
  it('walks a new game through the righteous-rising ending without fixture-only flag jumps', () => {
    let state = makeState()

    expect(getCurrentGoal(state)).toBe('第一章：去青石镇接镖局悬赏，攒银两添置兵器。')
    state = chooseOnlyOption(state, 'town', 'ch1_town_bandit_notice_01', 'accept')
    expect(state.flags).toContain('ch1_bandit_notice_taken')

    state = chooseOnlyOption(state, 'forest', 'ch1_forest_bandit_trail_01', 'endure_training')
    expect(state.flags).toContain('ch1_bandit_defeated')

    state = chooseOnlyOption(state, 'town', 'ch1_town_reward_and_supply_01', 'buy_sword_and_cook')
    expect(state.flags).toContain('ch1_prepared_for_boss')
    state = cookRecipe(state, 'steamed_bun')
    state = equipEquipmentCard(state, 'plain_iron_sword')
    expect(state.equipment.weapon).toBe('plain_iron_sword')
    expect(state.itemBag.steamed_bun).toBe(1)

    state = { ...state, phase: 'night', stamina: 6 }
    state = chooseOnlyOption(state, 'ruined_temple', 'ch1_ruined_temple_black_market_boss_01', 'duel')
    expect(state.currentCombat?.enemyId).toBe('ch1_black_market_boss')
    state = finishVictory(state)
    expect(state.flags).toEqual(expect.arrayContaining(['ch1_black_market_boss_defeated', 'blood_river_fragment_found']))

    state = { ...state, phase: 'day', stamina: 6 }
    expect(getCurrentGoal(state)).toBe('第二章：去茶馆查问残页墨痕，确认血河经异动源头。')
    expect(getLocationGuidance(state, 'teahouse')).toBe('主线：查问残页墨痕')
    state = chooseOnlyOption(state, 'teahouse', 'ch2_teahouse_fragment_source_01', 'ask_source')
    expect(state.flags).toContain('ch2_teahouse_source_found')
    expect(getLocationGuidance(state, 'forest')).toBe('主线：追查血河失控者')

    state = chooseOnlyOption(state, 'forest', 'ch2_forest_blood_river_corruption_01', 'observe_pattern')
    expect(state.flags).toContain('ch2_forest_corruption_seen')

    state = { ...state, phase: 'night', stamina: 6 }
    state = chooseOnlyOption(state, 'ruined_temple', 'ch2_ruined_temple_blood_altar_01', 'read')
    expect(state.flags).toContain('blood_altar_disrupted')

    state = { ...state, phase: 'day', stamina: 6 }
    expect(getCurrentGoal(state)).toBe('第三章：回青石镇追查血玉残片来历，备战血河余党。')
    state = chooseOnlyOption(state, 'town', 'ch3_town_blood_jade_trace_01', 'trace')
    expect(state.flags).toContain('ch3_town_blood_jade_traced')

    state = chooseOnlyOption(state, 'forest', 'ch3_forest_blood_river_remnant_01', 'duel')
    expect(state.currentCombat?.enemyId).toBe('blood_river_puppet')
    expect(state.flags).not.toContain('ch3_blood_river_remnant_defeated')
    expect(state.flags).not.toContain('blood_river_complete_scroll_found')
    expect(getCurrentGoal(state)).toBe('第三章：前往黑松林截击血河余党，夺回完整残卷。')

    state = finishVictory(state)
    expect(state.flags).toEqual(expect.arrayContaining(['ch3_blood_river_remnant_defeated', 'blood_river_complete_scroll_found']))
    if (state.phase === 'night') state = advancePhase(state)

    expect(getCurrentGoal(state)).toBe('终局：去茶馆作出血河经最终抉择。')
    state = chooseOnlyOption(state, 'teahouse', 'ch3_teahouse_final_choice_01', 'seal')
    expect(state.screen).toBe('ending')
    expect(state.endingId).toBe('righteous_rising')
    expect(state.flags).toContain('blood_river_sealed')
  })
})
