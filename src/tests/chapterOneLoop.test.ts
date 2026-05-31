import { describe, expect, it } from 'vitest'
import { cards } from '../data/cards'
import { enemies } from '../data/enemies'
import { events } from '../data/events'
import { getCurrentGoal } from '../engine/goalEngine'
import { pickEventForLocation, applyChoice } from '../engine/eventEngine'
import { makeState } from './helpers'

describe('chapter one onboarding loop', () => {
  it('guides the player through concrete chapter-one steps instead of the broad blood-river arc', () => {
    const fresh = makeState()
    expect(getCurrentGoal(fresh)).toBe('第一章：去青石镇接镖局悬赏，攒银两添置兵器。')

    expect(getCurrentGoal({ ...fresh, flags: ['ch1_bandit_notice_taken'] })).toBe('第一章：前往黑松林追查劫匪，收集食材与横练法门。')
    expect(getCurrentGoal({ ...fresh, flags: ['ch1_bandit_defeated'] })).toBe('第一章：回青石镇交差，购买并装备粗铁剑。')
    expect(getCurrentGoal({ ...fresh, flags: ['ch1_prepared_for_boss'] })).toBe('第一章：夜探破庙，击败黑市高手，打开血河经主线。')
  })

  it('chains town, forest, return-town, and ruined-temple events into the minimum first chapter loop', () => {
    const fresh = makeState()
    expect(pickEventForLocation(fresh, events, 'town').id).toBe('ch1_town_bandit_notice_01')

    const accepted = { ...fresh, flags: ['ch1_bandit_notice_taken'] }
    expect(pickEventForLocation(accepted, events, 'forest').id).toBe('ch1_forest_bandit_trail_01')

    const defeated = { ...fresh, flags: ['ch1_bandit_defeated'], player: { ...fresh.player, silver: 32 } }
    expect(pickEventForLocation(defeated, events, 'town').id).toBe('ch1_town_reward_and_supply_01')

    const prepared = {
      ...fresh,
      phase: 'night' as const,
      flags: ['ch1_bandit_notice_taken', 'ch1_bandit_defeated', 'ch1_prepared_for_boss'],
      equipment: { weapon: 'plain_iron_sword' },
      itemBag: { ...fresh.itemBag, steamed_bun: 1 },
    }
    expect(pickEventForLocation(prepared, events, 'ruined_temple').id).toBe('ch1_ruined_temple_black_market_boss_01')
  })

  it('lets equipment and cooking directly prepare the first chapter boss fight', () => {
    const supply = events.find((event) => event.id === 'ch1_town_reward_and_supply_01')
    expect(supply).toBeDefined()
    expect(supply?.choices.some((choice) => choice.effects.some((effect) => effect.type === 'gain_card' && effect.cardId === 'plain_iron_sword'))).toBe(true)
    expect(supply?.choices.some((choice) => choice.effects.some((effect) => effect.type === 'gain_item' && effect.itemId === 'wheat_flour'))).toBe(true)
    expect(supply?.choices.some((choice) => choice.effects.some((effect) => effect.type === 'gain_item' && effect.itemId === 'spring_water'))).toBe(true)
    expect(supply?.choices.some((choice) => choice.effects.some((effect) => effect.type === 'set_flag' && effect.value === 'ch1_prepared_for_boss'))).toBe(true)

    const boss = enemies.find((enemy) => enemy.id === 'ch1_black_market_boss')
    expect(boss).toBeDefined()
    expect(boss?.maxHp).toBeGreaterThan(40)
    expect(boss?.rewardCardPool).toContain('blood_river_strike')
  })

  it('keeps the first chapter boss locked until notice, forest fight, equipment, and cooked food are ready', () => {
    const bossEvent = events.find((event) => event.id === 'ch1_ruined_temple_black_market_boss_01')
    expect(bossEvent).toBeDefined()
    expect(bossEvent?.requirements).toEqual(expect.arrayContaining([
      { type: 'flag', value: 'ch1_bandit_notice_taken' },
      { type: 'flag', value: 'ch1_bandit_defeated' },
      { type: 'flag', value: 'ch1_prepared_for_boss' },
      { type: 'has_equipped', cardId: 'plain_iron_sword' },
      { type: 'has_item', itemId: 'steamed_bun', amount: 1 },
      { type: 'phase', value: 'night' },
    ]))
    expect(bossEvent?.choices.some((choice) => choice.effects.some((effect) => effect.type === 'start_combat' && effect.enemyId === 'ch1_black_market_boss'))).toBe(true)
  })

  it('has first chapter marker content with defined card and enemy references', () => {
    const chapterOneEvents = events.filter((event) => event.id.startsWith('ch1_'))
    const cardIds = new Set(cards.map((card) => card.id))
    const enemyIds = new Set(enemies.map((enemy) => enemy.id))

    expect(chapterOneEvents.map((event) => event.id)).toEqual([
      'ch1_town_bandit_notice_01',
      'ch1_forest_bandit_trail_01',
      'ch1_town_reward_and_supply_01',
      'ch1_ruined_temple_black_market_boss_01',
    ])
    for (const event of chapterOneEvents) {
      for (const effect of event.choices.flatMap((choice) => choice.effects)) {
        if (effect.type === 'gain_card') expect(cardIds.has(effect.cardId)).toBe(true)
        if (effect.type === 'start_combat') expect(enemyIds.has(effect.enemyId)).toBe(true)
      }
    }
  })

  it('guides the post-chapter-one blood-river investigation through second-chapter beats', () => {
    const fresh = makeState()
    const chapterOneDone = { ...fresh, flags: ['ch1_black_market_boss_defeated', 'blood_river_fragment_found'] }
    expect(getCurrentGoal(chapterOneDone)).toBe('第二章：去茶馆查问残页墨痕，确认血河经异动源头。')

    expect(getCurrentGoal({ ...fresh, flags: ['ch1_black_market_boss_defeated', 'blood_river_fragment_found', 'ch2_teahouse_source_found'] })).toBe('第二章：前往黑松林追查血河失控的江湖客。')
    expect(getCurrentGoal({ ...fresh, flags: ['ch1_black_market_boss_defeated', 'blood_river_fragment_found', 'ch2_teahouse_source_found', 'ch2_forest_corruption_seen'] })).toBe('第二章：入破庙夜探血坛，决定镇压或窃习血河异法。')
  })

  it('chains chapter-two investigation from teahouse to forest to ruined-temple altar', () => {
    const fresh = makeState()
    const chapterOneDone = { ...fresh, flags: ['ch1_black_market_boss_defeated', 'blood_river_fragment_found'] }
    expect(pickEventForLocation(chapterOneDone, events, 'teahouse').id).toBe('ch2_teahouse_fragment_source_01')

    const sourceFound = { ...chapterOneDone, flags: [...chapterOneDone.flags, 'ch2_teahouse_source_found'] }
    expect(pickEventForLocation(sourceFound, events, 'forest').id).toBe('ch2_forest_blood_river_corruption_01')

    const corruptionSeen = { ...chapterOneDone, phase: 'night' as const, flags: [...chapterOneDone.flags, 'ch2_teahouse_source_found', 'ch2_forest_corruption_seen'] }
    expect(pickEventForLocation(corruptionSeen, events, 'ruined_temple').id).toBe('ch2_ruined_temple_blood_altar_01')
  })

  it('has second chapter marker content with defined card and enemy references', () => {
    const chapterTwoEvents = events.filter((event) => event.id.startsWith('ch2_'))
    const cardIds = new Set(cards.map((card) => card.id))
    const enemyIds = new Set(enemies.map((enemy) => enemy.id))

    expect(chapterTwoEvents.map((event) => event.id)).toEqual([
      'ch2_teahouse_fragment_source_01',
      'ch2_forest_blood_river_corruption_01',
      'ch2_ruined_temple_blood_altar_01',
    ])
    for (const event of chapterTwoEvents) {
      for (const effect of event.choices.flatMap((choice) => choice.effects)) {
        if (effect.type === 'gain_card') expect(cardIds.has(effect.cardId)).toBe(true)
        if (effect.type === 'start_combat') expect(enemyIds.has(effect.enemyId)).toBe(true)
      }
    }
  })

  it('guides the post-chapter-two endgame through final preparation and final choice beats', () => {
    const fresh = makeState()
    const chapterTwoDone = {
      ...fresh,
      flags: ['ch1_black_market_boss_defeated', 'blood_river_fragment_found', 'ch2_teahouse_source_found', 'ch2_forest_corruption_seen', 'blood_altar_disrupted'],
    }
    expect(getCurrentGoal(chapterTwoDone)).toBe('第三章：回青石镇追查血玉残片来历，备战血河余党。')

    expect(getCurrentGoal({ ...chapterTwoDone, flags: [...chapterTwoDone.flags, 'ch3_town_blood_jade_traced'] })).toBe('第三章：前往黑松林截击血河余党，夺回完整残卷。')
    expect(getCurrentGoal({ ...chapterTwoDone, flags: [...chapterTwoDone.flags, 'ch3_town_blood_jade_traced', 'ch3_blood_river_remnant_defeated'] })).toBe('终局：去茶馆作出血河经最终抉择。')
  })

  it('chains chapter-three endgame from town investigation to forest remnant to teahouse final choice', () => {
    const fresh = makeState()
    const chapterTwoDone = {
      ...fresh,
      flags: ['ch1_black_market_boss_defeated', 'blood_river_fragment_found', 'ch2_teahouse_source_found', 'ch2_forest_corruption_seen', 'blood_altar_disrupted'],
    }
    expect(pickEventForLocation(chapterTwoDone, events, 'town').id).toBe('ch3_town_blood_jade_trace_01')

    const traceFound = { ...chapterTwoDone, flags: [...chapterTwoDone.flags, 'ch3_town_blood_jade_traced'] }
    expect(pickEventForLocation(traceFound, events, 'forest').id).toBe('ch3_forest_blood_river_remnant_01')

    const remnantDefeated = {
      ...traceFound,
      flags: [...traceFound.flags, 'ch3_blood_river_remnant_defeated'],
    }
    expect(pickEventForLocation(remnantDefeated, events, 'teahouse').id).toBe('ch3_teahouse_final_choice_01')
  })

  it('has third chapter marker content with defined card and enemy references', () => {
    const chapterThreeEvents = events.filter((event) => event.id.startsWith('ch3_'))
    const cardIds = new Set(cards.map((card) => card.id))
    const enemyIds = new Set(enemies.map((enemy) => enemy.id))

    expect(chapterThreeEvents.map((event) => event.id)).toEqual([
      'ch3_town_blood_jade_trace_01',
      'ch3_forest_blood_river_remnant_01',
      'ch3_teahouse_final_choice_01',
    ])
    for (const event of chapterThreeEvents) {
      for (const effect of event.choices.flatMap((choice) => choice.effects)) {
        if (effect.type === 'gain_card') expect(cardIds.has(effect.cardId)).toBe(true)
        if (effect.type === 'start_combat') expect(enemyIds.has(effect.enemyId)).toBe(true)
      }
    }
  })

  it('resolves each final teahouse choice to a distinct ending', () => {
    const finalEvent = events.find((event) => event.id === 'ch3_teahouse_final_choice_01')!
    const endingChoices = Object.fromEntries(finalEvent.choices.map((choice) => [choice.id, choice]))
    const finalState = {
      ...makeState(),
      currentEventId: finalEvent.id,
      flags: ['blood_altar_disrupted', 'ch3_town_blood_jade_traced', 'ch3_blood_river_remnant_defeated'],
      stamina: 6,
    }

    expect(applyChoice(finalState, endingChoices.seal).endingId).toBe('righteous_rising')
    expect(applyChoice(finalState, endingChoices.cure).endingId).toBe('bai_zhi_good')
    expect(applyChoice(finalState, endingChoices.practice).endingId).toBe('demon_fall')
  })
})
