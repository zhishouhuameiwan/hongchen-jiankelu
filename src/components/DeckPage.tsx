import { cards, cardById } from '../data/cards'
import { cardArtById } from '../data/cardArt'
import { itemById } from '../data/items'
import { itemArtById } from '../data/itemArt'
import { canCookRecipe, cookingRecipes, getCookingLevel } from '../engine/cookingEngine'
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
  const consumeBagItem = useGameStore((s) => s.useItem)
  const cookBagRecipe = useGameStore((s) => s.cookRecipe)
  const groupedDeck = state.deck.reduce<Record<string, string[]>>((groups, id) => {
    const label = getDeckGroupLabel(cardById[id].source)
    groups[label] = [...(groups[label] ?? []), id]
    return groups
  }, {})
  const equipmentCardIds = Array.from(new Set([
    ...state.equipmentBag,
    ...Object.values(state.equipment).filter((id): id is string => Boolean(id)),
  ]))

  const itemEntries = Object.entries(state.itemBag).filter(([, count]) => count > 0)
  const cookingLevel = getCookingLevel(state)
  const knownRecipes = cookingRecipes.filter((recipe) => state.cooking.knownRecipes.includes(recipe.id) && recipe.requiredLevel <= cookingLevel)

  return (
    <main>
      <TopBar />
      <button onClick={() => go('map')}>返回地图</button>
      <section className="deck-group prep-panel" aria-label="备战加成">
        <h2>备战加成</h2>
        <ul>
          {Object.values(state.equipment).filter((id): id is string => Boolean(id)).map((id) => <li key={id}>{cardById[id]?.name ?? id}：{getEquipmentBonusText(id)}，战斗中计入对应招式。</li>)}
          {(state.itemBag.steamed_bun ?? 0) > 0 ? <li>蒸饼：下场战斗开战恢复 4 点气血与 1 点内力。</li> : null}
        </ul>
        {!Object.values(state.equipment).some(Boolean) && !(state.itemBag.steamed_bun ?? 0) ? <p className="menu-hint">暂无备战加成。装备武器或备好食物后会在这里显示。</p> : null}
      </section>
      <section className="deck-group item-panel">
        <h2>物品</h2>
        <p className="menu-hint">消耗品可在行囊中使用；任务物品会保留为后续剧情线索。</p>
        {itemEntries.length ? (
          <div className="grid equipment-bag" aria-label="物品行囊">
            {itemEntries.map(([id, count]) => {
              const item = itemById[id]
              if (!item) return null
              const usable = ['consumable', 'food'].includes(item.category) && item.effects.length > 0
              const categoryLabel = item.category === 'food' ? '食物' : item.category === 'ingredient' ? '食材' : item.category === 'consumable' ? '消耗品' : '任务物品'
              return (
                <article className="card deck-card deck-card--compact item-card" key={id}>
                  <img className="item-art compact-asset-image" src={itemArtById[id]} alt={`${item.name}插画`} />
                  <h3>{item.name} ×{count}</h3>
                  <p>{item.description}</p>
                  <small>{categoryLabel} · {item.source}</small>
                  {usable ? <button onClick={() => consumeBagItem(id)}>{item.category === 'food' ? '食用' : '使用'}{item.name}</button> : <button disabled>不可使用</button>}
                </article>
              )
            })}
          </div>
        ) : <p className="menu-hint">暂无物品。可从医馆、镇集或江湖事件获得。</p>}
      </section>
      <section className="deck-group cooking-panel">
        <h2>厨艺</h2>
        <p className="menu-hint">厨艺等级 {cookingLevel} · 经验 {state.cooking.exp}</p>
        {knownRecipes.length ? (
          <div className="grid equipment-bag" aria-label="厨艺菜谱">
            {knownRecipes.map((recipe) => {
              const output = itemById[recipe.outputItemId]
              const ingredientText = recipe.ingredients.map((ingredient) => `${itemById[ingredient.itemId]?.name ?? ingredient.itemId} ×${ingredient.amount}`).join('、')
              const ready = canCookRecipe(state, recipe.id)
              return (
                <article className="card deck-card deck-card--compact item-card" key={recipe.id}>
                  <img className="cooking-art compact-asset-image" src={itemArtById[recipe.outputItemId]} alt={`${recipe.name}成品`} />
                  <h3>{recipe.name}</h3>
                  <p>{recipe.description}</p>
                  <small>所需：{ingredientText}</small>
                  <small>成品：{output?.name ?? recipe.outputItemId} · 厨艺 +{recipe.expGain}</small>
                  <button disabled={!ready} onClick={() => cookBagRecipe(recipe.id)}>{ready ? `烹饪${recipe.name}` : '材料不足'}</button>
                </article>
              )
            })}
          </div>
        ) : <p className="menu-hint">暂无可烹饪菜谱。可在茶馆、客栈或医馆学到新菜。</p>}
      </section>
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
                  <img className="equipment-art compact-asset-image" src={cardArtById[id]} alt={`${card.name}插画`} />
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
