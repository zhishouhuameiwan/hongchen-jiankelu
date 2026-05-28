import type { EndingDefinition } from '../types/game'

export const endings: EndingDefinition[] = [
  { id: 'shen_qingshuang_good', title: '剑派双璧', priority: 100, requirements: [{ type: 'heroine_affection_min', heroine: 'shen_qingshuang', value: 30 }, { type: 'flag', value: 'blood_river_sealed' }], text: '你与沈青霜并肩封印《血河经》。多年后，江湖人提起青霜剑派，总会说起那一对剑派双璧。' },
  { id: 'luo_hongling_good', title: '红尘夜奔', priority: 100, requirements: [{ type: 'heroine_affection_min', heroine: 'luo_hongling', value: 30 }, { type: 'flag', value: 'escaped_with_luo' }], text: '那一夜，你与洛红绫从正魔两道的围杀中突围。此后江湖传闻，红莲圣女身边多了一位无名剑客。' },
  { id: 'bai_zhi_good', title: '药谷归隐', priority: 100, requirements: [{ type: 'heroine_affection_min', heroine: 'bai_zhi', value: 30 }, { type: 'flag', value: 'blood_river_cured' }], text: '你与白芷带着残卷回到药王谷。江湖仍有风雨，但药庐灯火长明。' },
  { id: 'demon_fall', title: '走火入魔', priority: 90, requirements: [{ type: 'demon_heart_min', value: 10 }], text: '你终于练成了《血河经》，也终于忘记了自己为何拔剑。' },
  { id: 'righteous_rising', title: '正道新秀', priority: 50, requirements: [{ type: 'reputation_min', value: 5 }, { type: 'flag', value: 'blood_river_sealed' }], text: '你协助正道封印魔功，自此名动江湖。' },
  { id: 'nameless_wanderer', title: '无名侠客', priority: 0, requirements: [], text: '江湖风波终究与你擦肩而过。多年后，也许没人记得你曾来过。' },
]
