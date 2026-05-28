import type { HeroineDefinition, LocationInfo } from '../types/game'

export const maxDays = 30

export const locations: LocationInfo[] = [
  { id: 'town', name: '青石镇', dayDescription: '客栈、镖局与市井消息汇集之处。', nightDescription: '夜市灯影摇晃，暗巷里有人交换不能见光的消息。', staminaCost: 1 },
  { id: 'teahouse', name: '听雨茶楼', dayDescription: '醒木一拍，半座江湖都在茶盏之间。', nightDescription: '茶楼打烊后，后堂仍有人低声交易秘闻。', staminaCost: 1 },
  { id: 'forest', name: '黑松林', dayDescription: '山风带血腥味，常有草药、劫匪与奇遇。', nightDescription: '入夜后的山林雾气深重，似有追兵踏叶而来。', staminaCost: 2 },
  { id: 'clinic', name: '百草医馆', dayDescription: '药香清苦，病人与江湖客挤满门前。', nightDescription: '深夜仍有人敲门求医，也有人想偷走救命药材。', staminaCost: 1 },
  { id: 'sword_house', name: '青霜剑派别院', dayDescription: '青石演武场上剑光如霜，门规森严。', nightDescription: '夜色中的剑派别院安静得近乎危险。', staminaCost: 2 },
  { id: 'ruined_temple', name: '破庙黑市', dayDescription: '白天这里只是荒废破庙，偶有乞丐避雨。', nightDescription: '夜深后，黑市灯火亮起，魔教、商贩和亡命徒都在此现身。', staminaCost: 2 },
]

export const heroines: HeroineDefinition[] = [
  { id: 'shen_qingshuang', name: '沈青霜', title: '剑派大师姐', faction: '青霜剑派', theme: '规矩与真心', description: '清冷克制的正道剑派大师姐，相信规矩能护住江湖，却逐渐看见规矩护不住的人。', mechanicName: '剑心' },
  { id: 'luo_hongling', name: '洛红绫', title: '红莲圣女', faction: '红莲宗', theme: '正邪与真实', description: '张扬危险的魔教圣女，讨厌正道伪善，只相信真实的欲望、恩怨和选择。', mechanicName: '魔心' },
  { id: 'bai_zhi', name: '白芷', title: '药王谷医女', faction: '药王谷', theme: '仁心与代价', description: '温柔而坚定的医女，愿救人，但并不盲目。她知道每一次救治都有代价。', mechanicName: '药债' },
]

export const locationById = Object.fromEntries(locations.map((location) => [location.id, location])) as Record<LocationInfo['id'], LocationInfo>
