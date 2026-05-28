import { events } from '../data/events'
import { getChoiceOutcomeTags } from '../engine/choicePreviewEngine'
import { canChooseChoice } from '../engine/eventEngine'
import { describeChoiceEffects } from '../engine/rewardSummaryEngine'
import { useGameStore } from '../store/gameStore'
import type { Choice } from '../types/game'
import { TopBar } from './TopBar'

export function EventPage() {
  const state = useGameStore((s) => s.state)!
  const choose = useGameStore((s) => s.chooseEventChoice)
  const go = useGameStore((s) => s.go)
  const event = events.find((e) => e.id === state.currentEventId)

  if (!event) {
    return (
      <main>
        <TopBar />
        <section className="panel">
          <h2>江湖无事</h2>
          <p>此处事件已经散去。</p>
          <button onClick={() => go('map')}>返回地图</button>
        </section>
      </main>
    )
  }

  const can = (choice: Choice) => canChooseChoice(state, choice)
  const hasAvailableChoice = event.choices.some(can)

  return (
    <main>
      <TopBar />
      <section className="panel">
        <h2>{event.title}</h2>
        <p>{event.text}</p>
        {!hasAvailableChoice ? (
          <div className="event-blocked">
            <p>你已无力继续处理此事，先退回地图休整吧。</p>
            <button onClick={() => go('map')}>返回地图</button>
          </div>
        ) : null}
        {event.choices.map((choice) => (
          <button key={choice.id} disabled={!can(choice)} onClick={() => choose(choice)}>
            {choice.text}{' '}
            <small>体力-{choice.staminaCost}，剩余 {state.stamina - choice.staminaCost}</small>
            <span className="choice-tags">
              {getChoiceOutcomeTags(choice).map((tag) => <small className="tag" key={tag}>{tag}</small>)}
            </span>
            {describeChoiceEffects(choice) ? <small className="choice-preview">预览：{describeChoiceEffects(choice)?.replace('获得：', '')}</small> : null}
          </button>
        ))}
      </section>
    </main>
  )
}
