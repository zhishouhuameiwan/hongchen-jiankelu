import { describe, expect, it } from 'vitest'
import type { Choice } from '../types/game'
import { getChoiceOutcomeTags } from '../engine/choicePreviewEngine'

describe('choicePreviewEngine', () => {
  it('summarizes major outcome tags from choice effects', () => {
    const choice: Choice = {
      id: 'help',
      text: '替她挡下追兵',
      staminaCost: 2,
      effects: [
        { type: 'heroine_affection', heroine: 'luo_hongling', value: 12 },
        { type: 'gain_card', cardId: 'red_lotus_poison' },
        { type: 'start_combat', enemyId: 'black_market_master' },
        { type: 'gain_silver', value: -5 },
      ],
    }

    expect(getChoiceOutcomeTags(choice)).toEqual(['红颜', '获卡', '战斗', '花费'])
  })

  it('marks silver rewards, healing, endings, and stat changes', () => {
    const choice: Choice = {
      id: 'finish',
      text: '封印血河经',
      staminaCost: 1,
      effects: [
        { type: 'gain_silver', value: 8 },
        { type: 'heal', value: 10 },
        { type: 'stat', stat: 'reputation', value: 5 },
        { type: 'end_game', endingId: 'righteous_rising' },
      ],
    }

    expect(getChoiceOutcomeTags(choice)).toEqual(['银两', '疗伤', '属性', '结局'])
  })
})
