import { cards, cardById } from '../data/cards'
import { cardArtById } from '../data/cardArt'
import { equipmentSlotLabels, getEquipmentBonusText } from '../engine/equipmentEngine'
import { useGameStore } from '../store/gameStore'
import { TopBar } from './TopBar'

function getDeckGroupLabel(source: string): string {
  if (source === 'starter') return '基础武学'
  if (['shen_qingshuang', 'luo_hongling', 'bai_zhi'].includes(source)) return '红颜专属'
  if (source === 'blood_river') return '血河经'
  return '江湖奇遇'
}

export function DeckPage() {
  const state = useGameStore((s) => s.state)!
  const go = useGameStore((s) => s.go)
  const equipCard = useGameStore((s) => s.equipCard)
  const unequipSlot = useGameStore((s) => s.unequipSlot)
  const groupedDeck = state.deck.reduce<Record<string, string[]>>((groups, id) => {
    const label = getDeckGroupLabel(cardById[id].source)
    groups[label] = [...(groups[label] ?? []), id]
    return groups
  }, {})
  const equipmentCardIds = Array.from(new Set([
    ...state.equipmentBag,
    ...Object.values(state.equipment).filter((id): id is string => Boolean(id)),
  ]))

  return (
    <main>
      <TopBar />
      <button onClick={() => go('map')}>返回地图</button>
      <section className="deck-group equipment-panel">
        <h2>装备</h2>
        <p className="menu-hint">装备卡不会进入战斗抽牌；同槽位新装备会替换旧装备，属性加成即时生效。</p>
        <div className="equipment-slots" aria-label="装备槽位">
          {(['weapon', 'armor', 'boots', 'accessory'] as const).map((slot) => {
            const cardId = state.equipment[slot]
            const card = cardId ? cardById[cardId] : undefined
            return (
              <article className="equipment-slot" key={slot}>
                <b>{equipmentSlotLabels[slot]}</b>
                <span>装备中：{card?.name ?? '无'}</span>
                {card ? <small>{getEquipmentBonusText(card.id)}</small> : <small>尚未装备</small>}
                {card ? <button onClick={() => unequipSlot(slot)}>卸下{card.name}</button> : null}
              </article>
            )
          })}
        </div>
        <h3>行囊</h3>
        {equipmentCardIds.length ? (
          <div className="grid equipment-bag" aria-label="装备行囊">
            {equipmentCardIds.map((id) => {
              const card = cardById[id]
              const equipped = card.equipmentSlot ? state.equipment[card.equipmentSlot] === id : false
              return (
                <article className="card deck-card deck-card--compact equipment-card" key={id}>
                  <img className="card-art card-image" src={cardArtById[id]} alt={`${card.name}插画`} />
                  <h3>{card.name}</h3>
                  <p>{card.description}</p>
                  <small>{card.equipmentSlot ? equipmentSlotLabels[card.equipmentSlot] : '装备'} · {getEquipmentBonusText(id)}</small>
                  <button disabled={equipped} onClick={() => equipCard(id)}>{equipped ? '已装备' : `装备${card.name}`}</button>
                </article>
              )
            })}
          </div>
        ) : <p className="menu-hint">暂无装备。可从江湖事件、战利品或后续商店获得。</p>}
      </section>
      {Object.entries(groupedDeck).map(([label, ids]) => (
        <section className="deck-group" key={label}>
          <h2>{label}</h2>
          <div className="grid">
            {ids.map((id, index) => {
              const card = cardById[id]
              const isHeroine = label === '红颜专属'
              return (
                <article className={`card deck-card deck-card--compact ${isHeroine ? 'heroine-card deck-card--mini' : ''}`} key={`${id}-${index}`}>
                  <img className="card-art card-image" src={cardArtById[id]} alt={`${card.name}插画`} />
                  <h3>{card.name}</h3>
                  <p>{card.description}</p>
                  <small>{label}</small>
                </article>
              )
            })}
          </div>
        </section>
      ))}
      <p>可发现卡牌：{cards.length} 张。</p>
    </main>
  )
}
