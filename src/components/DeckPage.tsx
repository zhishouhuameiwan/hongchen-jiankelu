import { cards, cardById } from '../data/cards'
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
  const groupedDeck = state.deck.reduce<Record<string, string[]>>((groups, id) => {
    const label = getDeckGroupLabel(cardById[id].source)
    groups[label] = [...(groups[label] ?? []), id]
    return groups
  }, {})

  return (
    <main>
      <TopBar />
      <button onClick={() => go('map')}>返回地图</button>
      {Object.entries(groupedDeck).map(([label, ids]) => (
        <section className="deck-group" key={label}>
          <h2>{label}</h2>
          <div className="grid">
            {ids.map((id, index) => {
              const card = cardById[id]
              const isHeroine = label === '红颜专属'
              return (
                <article className={`card ${isHeroine ? 'heroine-card' : ''}`} key={`${id}-${index}`}>
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
