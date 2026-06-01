# 架势博弈 V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade combat from one-card auto-resolution into a lightweight stance-tactics system with action points, multi-card turns, enemy tactics, matchup feedback, and meaningful status effects.

**Architecture:** Preserve the existing data-driven card/enemy/store/UI shape. Add tactics and action-point fields to the domain types, implement the new rules inside `combatEngine`, keep `gameStore` as a thin orchestration layer, then expose the new information in `App.tsx`.

**Tech Stack:** TypeScript, React, Zustand, Vite, Vitest, Testing Library.

---

## File Map

- Modify `src/types/game.ts`
  - Add `CombatTactic`, `EnemyTactic`, action point fields, and tactic metadata fields.
- Modify `src/engine/combatEngine.ts`
  - Own all pure combat transitions: start combat, card play, end turn, tactic matchup, and statuses.
- Modify `src/store/gameStore.ts`
  - Stop auto-ending after card play; keep explicit `endTurn`.
- Modify `src/data/cards.ts`
  - Add `costAction` and `tactic` to existing combat cards.
- Modify `src/data/enemies.ts`
  - Add `tactic` to enemy intents.
- Modify `src/App.tsx`
  - Show action points, enemy tactic copy, card tactic metadata, matchup result, and end-turn control.
- Modify `src/tests/combatEngine.test.ts`
  - Drive engine behavior first.
- Modify `src/tests/gameStore.test.ts`
  - Verify store no longer auto-ends after a card.
- Modify `src/tests/routeUi.test.tsx`
  - Verify player-facing battle UI changes.

## Task 1: Action Points and Multi-Card Turns

**Files:**
- Modify: `src/tests/combatEngine.test.ts`
- Modify: `src/types/game.ts`
- Modify: `src/engine/combatEngine.ts`
- Modify: `src/store/gameStore.ts`
- Modify: `src/data/cards.ts`
- Test: `src/tests/combatEngine.test.ts`, `src/tests/gameStore.test.ts`

- [ ] **Step 1: Write failing engine tests for combat start and single card play**

Add these tests to `src/tests/combatEngine.test.ts`. Use existing imports in the file and add any missing imports from `../data/cards`, `../data/enemies`, and `../engine/combatEngine`.

```ts
it('starts combat with 3 action points and four drawn cards', () => {
  const state = createInitialGameState('测试侠客', 'wandering_swordsman')

  const result = startCombat(state, enemyById.bandit)

  expect(result.currentCombat?.actionPoints).toBe(3)
  expect(result.currentCombat?.drawnCardIds).toHaveLength(4)
})

it('playing a one-action card spends action points without ending the enemy turn', () => {
  const state = startCombat(createInitialGameState('测试侠客', 'wandering_swordsman'), enemyById.bandit)
  const beforeTurn = state.currentCombat!.turn

  const result = playCombatCard(state, cardById.basic_slash)

  expect(result.currentCombat?.actionPoints).toBe(2)
  expect(result.currentCombat?.turn).toBe(beforeTurn)
  expect(result.currentCombat?.actionTaken).toBe(true)
  expect(result.currentCombat?.drawnCardIds).not.toContain('basic_slash')
})
```

- [ ] **Step 2: Run tests to verify RED**

Run:

```bash
npm test -- src/tests/combatEngine.test.ts --reporter=dot
```

Expected: FAIL because `actionPoints` is not defined and combat still draws 3 cards.

- [ ] **Step 3: Add action point types**

In `src/types/game.ts`, update the combat/card types so they include:

```ts
export type CombatTactic = 'attack' | 'guard' | 'movement' | 'break' | 'inner' | 'trick' | 'demonic' | 'romance'
export type EnemyTactic = 'assault' | 'guard' | 'charge' | 'cast' | 'feint'

export type CardDefinition = {
  // keep existing fields
  costAction?: number
  tactic?: CombatTactic
}

export type EnemyIntent = {
  // keep existing fields
  tactic?: EnemyTactic
}

export type CombatState = {
  // keep existing fields
  actionPoints: number
}
```

Keep all existing fields exactly as they are; only add the new optional metadata and required combat-state field.

- [ ] **Step 4: Add card action costs to starter cards**

In `src/data/cards.ts`, update at least the starter/basic combat cards:

```ts
{
  id: 'basic_slash',
  name: '劈风斩',
  // existing fields...
  costAction: 1,
  tactic: 'attack',
}
{
  id: 'basic_guard',
  name: '横剑格挡',
  // existing fields...
  costAction: 1,
  tactic: 'guard',
}
{
  id: 'inner_breath',
  name: '调息',
  // existing fields...
  costAction: 1,
  tactic: 'inner',
}
```

If field names differ slightly, preserve the current object structure and append only `costAction` and `tactic`.

- [ ] **Step 5: Implement minimal action point behavior**

In `src/engine/combatEngine.ts`:

1. Add helper:

```ts
export function getCardActionCost(card: CardDefinition): number {
  return card.costAction ?? 1
}
```

2. In `startCombat`, change drawn cards from 3 to 4 and initialize:

```ts
actionPoints: 3,
```

3. In `playCombatCard`, before spending inner power or applying effects, reject insufficient action points:

```ts
const actionCost = getCardActionCost(card)
if (combat.actionPoints < actionCost) {
  return {
    ...state,
    currentCombat: {
      ...combat,
      log: [...combat.log, `行动点不足，无法施展${card.name}。`],
    },
  }
}
```

4. When card play succeeds, subtract action points:

```ts
actionPoints: combat.actionPoints - actionCost,
```

5. In `endPlayerTurn`, reset the next player turn to 3 action points and draw 4 cards.

- [ ] **Step 6: Remove store auto-end behavior**

In `src/store/gameStore.ts`, replace the current `playCard` body after `afterCard` is computed:

```ts
const afterCard = playCombatCard(state, cardById[cardId])
set({ state: persist(afterCard) })
```

Remove `shouldAutoEndTurn` and the automatic `endPlayerTurn` call.

- [ ] **Step 7: Run focused tests to verify GREEN**

Run:

```bash
npm test -- src/tests/combatEngine.test.ts src/tests/gameStore.test.ts --reporter=dot
```

Expected: PASS for the new engine tests. Some existing store tests may fail because they expect auto-ending; update those only if they encode the old one-card turn rule.

- [ ] **Step 8: Update old store expectation if needed**

If `src/tests/gameStore.test.ts` has a test expecting `store.playCard('basic_slash')` to advance to turn 2, change it to:

```ts
store.playCard('basic_slash')
expect(useGameStore.getState().state!.currentCombat?.turn).toBe(1)
expect(useGameStore.getState().state!.currentCombat?.actionPoints).toBe(2)

store.endTurn()
expect(useGameStore.getState().state!.currentCombat?.turn).toBe(2)
```

- [ ] **Step 9: Commit Task 1**

Run:

```bash
git add src/types/game.ts src/engine/combatEngine.ts src/store/gameStore.ts src/data/cards.ts src/tests/combatEngine.test.ts src/tests/gameStore.test.ts
git commit -m "feat: add combat action points"
```

## Task 2: Enemy Tactics and Matchup Rules

**Files:**
- Modify: `src/tests/combatEngine.test.ts`
- Modify: `src/types/game.ts`
- Modify: `src/engine/combatEngine.ts`
- Modify: `src/data/cards.ts`
- Modify: `src/data/enemies.ts`
- Test: `src/tests/combatEngine.test.ts`

- [ ] **Step 1: Write failing tests for matchup helper and card effects**

Add to `src/tests/combatEngine.test.ts`:

```ts
it('reports tactical advantage for movement against assault', () => {
  expect(getTacticMatchup('movement', 'assault')).toBe('advantage')
})

it('reduces attack damage against a guarding enemy tactic', () => {
  const state = startCombat(createInitialGameState('测试侠客', 'wandering_swordsman'), enemyById.bandit)
  const guarding = {
    ...state,
    currentCombat: {
      ...state.currentCombat!,
      enemyHp: 28,
      enemyBlock: 0,
      enemyIntentOverride: { type: 'guard' as const, block: 0, text: '守势', tactic: 'guard' as const },
    },
  }

  const result = playCombatCard(guarding, cardById.basic_slash)

  expect(result.currentCombat?.enemyHp).toBe(25)
  expect(result.currentCombat?.log.at(-1)).toContain('劈风斩打在守势上，伤害降低')
})

it('break tactics expose charging enemies to vulnerable', () => {
  const state = startCombat(createInitialGameState('测试侠客', 'wandering_swordsman'), enemyById.black_market_master)
  const charging = {
    ...state,
    currentCombat: {
      ...state.currentCombat!,
      enemyStatuses: [],
      drawnCardIds: ['qingshuang_sword'],
      enemyIntentOverride: { type: 'guard' as const, block: 0, text: '蓄力', tactic: 'charge' as const },
    },
  }

  const result = playCombatCard(charging, cardById.qingshuang_sword)

  expect(result.currentCombat?.enemyStatuses).toContainEqual({ id: 'vulnerable', amount: 1 })
  expect(result.currentCombat?.log.join('\n')).toContain('青霜一剑破开蓄势，敌人露出破绽。')
})
```

If there is no existing `enemyIntentOverride` field, this test should fail first and then drive adding it, or use the current turn/index to select a real enemy intent with `tactic: 'guard'`/`charge`.

- [ ] **Step 2: Run tests to verify RED**

Run:

```bash
npm test -- src/tests/combatEngine.test.ts --reporter=dot
```

Expected: FAIL because `getTacticMatchup` and tactic-aware card resolution are missing.

- [ ] **Step 3: Add enemy tactics to data**

In `src/data/enemies.ts`, add tactic metadata to each intent. Use these mappings:

```ts
// attack-heavy intents
tactic: 'assault'

// block/guard intents
tactic: 'guard'

// poison, sealed, bleed, or other status-casting intents
tactic: 'cast'
```

For any text that describes preparing, focusing, or powering up, use:

```ts
tactic: 'charge'
```

- [ ] **Step 4: Add tactics to advanced cards**

In `src/data/cards.ts`, add:

```ts
// 流云步 / 夜奔
tactic: 'movement', costAction: 1

// 铁布衫
tactic: 'guard', costAction: 2

// 青霜一剑 / 霜河封脉
tactic: 'break', costAction: 2

// 红莲蚀骨
tactic: 'trick', costAction: 1

// 血河逆流
tactic: 'demonic', costAction: 2

// 并肩御敌 or similar heroine support
tactic: 'romance', costAction: 1
```

- [ ] **Step 5: Implement tactic helpers**

In `src/engine/combatEngine.ts`, add exports:

```ts
export type TacticMatchup = 'advantage' | 'neutral' | 'disadvantage'

export function getCardTactic(card: CardDefinition): CombatTactic {
  if (card.tactic) return card.tactic
  if (card.type === 'attack') return 'attack'
  if (card.type === 'guard') return 'guard'
  if (card.type === 'inner') return 'inner'
  return 'trick'
}

export function getTacticMatchup(cardTactic: CombatTactic, enemyTactic: EnemyTactic): TacticMatchup {
  const advantages: Partial<Record<CombatTactic, EnemyTactic[]>> = {
    attack: ['charge'],
    guard: ['assault'],
    movement: ['assault', 'feint'],
    break: ['guard', 'charge', 'cast'],
    inner: ['cast'],
    trick: ['cast', 'feint'],
    demonic: ['charge'],
    romance: ['cast'],
  }
  const disadvantages: Partial<Record<CombatTactic, EnemyTactic[]>> = {
    attack: ['guard', 'feint'],
    guard: ['charge'],
    break: ['feint'],
    inner: ['assault'],
    demonic: ['feint'],
  }
  if (advantages[cardTactic]?.includes(enemyTactic)) return 'advantage'
  if (disadvantages[cardTactic]?.includes(enemyTactic)) return 'disadvantage'
  return 'neutral'
}
```

- [ ] **Step 6: Apply matchup during card play**

In `playCombatCard`, resolve current enemy tactic from the same intent used for UI/end-turn. Then:

```ts
const tactic = getCardTactic(card)
const enemyTactic = currentIntent.tactic ?? fallbackEnemyTactic(currentIntent)
const matchup = getTacticMatchup(tactic, enemyTactic)
```

When card does damage:

```ts
const tacticBonus = matchup === 'advantage' ? 3 : matchup === 'disadvantage' ? -3 : 0
const finalDamage = Math.max(0, baseDamage + tacticBonus)
```

When card gives block:

```ts
const tacticBlockBonus = matchup === 'advantage' && (tactic === 'guard' || tactic === 'movement') ? 3 : 0
const finalBlock = baseBlock + tacticBlockBonus
```

When `tactic === 'break' && matchup === 'advantage'`, add 1 `vulnerable` to enemy statuses and append:

```ts
`${card.name}破开${enemyTacticLabel(enemyTactic)}，敌人露出破绽。`
```

- [ ] **Step 7: Run focused tests**

Run:

```bash
npm test -- src/tests/combatEngine.test.ts --reporter=dot
```

Expected: PASS.

- [ ] **Step 8: Commit Task 2**

Run:

```bash
git add src/engine/combatEngine.ts src/data/cards.ts src/data/enemies.ts src/tests/combatEngine.test.ts src/types/game.ts
git commit -m "feat: add combat stance matchups"
```

## Task 3: Status Effects Become Real

**Files:**
- Modify: `src/tests/combatEngine.test.ts`
- Modify: `src/engine/combatEngine.ts`
- Test: `src/tests/combatEngine.test.ts`

- [ ] **Step 1: Write failing status tests**

Add to `src/tests/combatEngine.test.ts`:

```ts
it('vulnerable increases next damage and then loses one layer', () => {
  const state = startCombat(createInitialGameState('测试侠客', 'wandering_swordsman'), enemyById.bandit)
  const exposed = {
    ...state,
    currentCombat: {
      ...state.currentCombat!,
      enemyHp: 28,
      enemyStatuses: [{ id: 'vulnerable' as const, amount: 1 }],
    },
  }

  const result = playCombatCard(exposed, cardById.basic_slash)

  expect(result.currentCombat?.enemyHp).toBeLessThanOrEqual(19)
  expect(result.currentCombat?.enemyStatuses.some((status) => status.id === 'vulnerable')).toBe(false)
})

it('poison damages enemies at end of turn and loses one layer', () => {
  const state = startCombat(createInitialGameState('测试侠客', 'wandering_swordsman'), enemyById.bandit)
  const poisoned = {
    ...state,
    currentCombat: {
      ...state.currentCombat!,
      enemyHp: 28,
      enemyStatuses: [{ id: 'poison' as const, amount: 3 }],
    },
  }

  const result = endPlayerTurn(poisoned, enemyById.bandit)

  expect(result.currentCombat?.enemyHp).toBe(25)
  expect(result.currentCombat?.enemyStatuses).toContainEqual({ id: 'poison', amount: 2 })
})

it('counter damages an attacking enemy before enemy damage resolves', () => {
  const state = startCombat(createInitialGameState('测试侠客', 'wandering_swordsman'), enemyById.bandit)
  const countering = {
    ...state,
    currentCombat: {
      ...state.currentCombat!,
      enemyHp: 28,
      playerStatuses: [{ id: 'counter' as const, amount: 2 }],
    },
  }

  const result = endPlayerTurn(countering, enemyById.bandit)

  expect(result.currentCombat?.enemyHp).toBe(26)
  expect(result.currentCombat?.playerStatuses.some((status) => status.id === 'counter')).toBe(false)
})
```

- [ ] **Step 2: Run tests to verify RED**

Run:

```bash
npm test -- src/tests/combatEngine.test.ts --reporter=dot
```

Expected: FAIL because status effects do not yet fully affect numeric combat.

- [ ] **Step 3: Add status helpers**

In `src/engine/combatEngine.ts`, add focused helpers:

```ts
function addStatus(statuses: CombatStatus[], id: CombatStatus['id'], amount: number): CombatStatus[] {
  const existing = statuses.find((status) => status.id === id)
  if (!existing) return [...statuses, { id, amount }]
  return statuses.map((status) => status.id === id ? { ...status, amount: status.amount + amount } : status)
}

function reduceStatus(statuses: CombatStatus[], id: CombatStatus['id'], amount = 1): CombatStatus[] {
  return statuses
    .map((status) => status.id === id ? { ...status, amount: status.amount - amount } : status)
    .filter((status) => status.amount > 0)
}
```

- [ ] **Step 4: Apply vulnerable during damage**

Before enemy HP is reduced by player damage:

```ts
const vulnerable = combat.enemyStatuses.find((status) => status.id === 'vulnerable')
const damageAfterVulnerable = vulnerable ? Math.ceil(finalDamage * 1.5) : finalDamage
const enemyStatusesAfterVulnerable = vulnerable ? reduceStatus(combat.enemyStatuses, 'vulnerable') : combat.enemyStatuses
```

Use `damageAfterVulnerable` for enemy HP subtraction.

- [ ] **Step 5: Apply poison at end of turn**

Inside `endPlayerTurn`, after enemy action but before drawing the next hand:

```ts
const enemyPoison = enemyStatuses.find((status) => status.id === 'poison')
if (enemyPoison) {
  enemyHp = Math.max(0, enemyHp - enemyPoison.amount)
  enemyStatuses = reduceStatus(enemyStatuses, 'poison')
  log.push(`${enemy.name}毒发，受到 ${enemyPoison.amount} 点伤害。`)
}
```

Also handle player poison similarly against `player.stats.hp`.

- [ ] **Step 6: Apply counter against enemy attacks**

When enemy intent is an attack and before player damage is calculated:

```ts
const counter = playerStatuses.find((status) => status.id === 'counter')
if (counter) {
  enemyHp = Math.max(0, enemyHp - counter.amount)
  playerStatuses = playerStatuses.filter((status) => status.id !== 'counter')
  log.push(`你反击造成 ${counter.amount} 点伤害。`)
}
```

- [ ] **Step 7: Run focused tests**

Run:

```bash
npm test -- src/tests/combatEngine.test.ts --reporter=dot
```

Expected: PASS.

- [ ] **Step 8: Commit Task 3**

Run:

```bash
git add src/engine/combatEngine.ts src/tests/combatEngine.test.ts
git commit -m "feat: resolve combat statuses"
```

## Task 4: Combat UI Shows the New Decisions

**Files:**
- Modify: `src/tests/routeUi.test.tsx`
- Modify: `src/App.tsx`
- Test: `src/tests/routeUi.test.tsx`

- [ ] **Step 1: Replace old auto-end UI test with action-point UI test**

In `src/tests/routeUi.test.tsx`, replace the test currently asserting no “结束回合” button and the text `出招后会自动结算敌方行动，进入下一回合。` with:

```ts
it('shows action points and lets the player explicitly end the combat turn', () => {
  const state = createInitialGameState('测试侠客', 'wandering_swordsman')
  useGameStore.setState({
    state: {
      ...state,
      screen: 'combat',
      currentCombat: {
        enemyId: 'bandit',
        enemyHp: 28,
        playerBlock: 0,
        enemyBlock: 0,
        turn: 1,
        actionPoints: 3,
        drawnCardIds: ['basic_slash', 'frost_seal'],
        playerStatuses: [],
        enemyStatuses: [],
        log: ['山道劫匪 拦住了你的去路。'],
        actionTaken: false,
      },
    },
    setupScreen: 'menu',
  })

  render(<App />)
  expect(screen.getByText('行动点 3/3')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /结束回合/ })).toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: /劈风斩/ }))

  expect(useGameStore.getState().state!.currentCombat?.turn).toBe(1)
  expect(screen.getByText('行动点 2/3')).toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: /结束回合/ }))

  expect(useGameStore.getState().state!.currentCombat?.turn).toBe(2)
})
```

- [ ] **Step 2: Add UI test for tactic labels**

Add:

```ts
it('shows enemy tactic and card matchup labels during combat', () => {
  const state = createInitialGameState('测试侠客', 'wandering_swordsman')
  useGameStore.setState({
    state: {
      ...state,
      screen: 'combat',
      currentCombat: {
        enemyId: 'bandit',
        enemyHp: 28,
        playerBlock: 0,
        enemyBlock: 0,
        turn: 1,
        actionPoints: 3,
        drawnCardIds: ['basic_guard', 'basic_slash'],
        playerStatuses: [],
        enemyStatuses: [],
        log: ['山道劫匪 拦住了你的去路。'],
        actionTaken: false,
      },
    },
    setupScreen: 'menu',
  })

  render(<App />)

  expect(screen.getByText(/敌人意图：猛攻/)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /横剑格挡/ })).toHaveTextContent('守势')
  expect(screen.getByRole('button', { name: /横剑格挡/ })).toHaveTextContent('克制')
  expect(screen.getByRole('button', { name: /劈风斩/ })).toHaveTextContent('攻势')
})
```

- [ ] **Step 3: Run tests to verify RED**

Run:

```bash
npm test -- src/tests/routeUi.test.tsx --reporter=dot
```

Expected: FAIL because UI still shows old auto-end copy and lacks action/matchup labels.

- [ ] **Step 4: Implement UI labels**

In `src/App.tsx`, import helpers:

```ts
import { getCardActionCost, getCardTactic, getTacticMatchup } from './engine/combatEngine'
```

Add UI label maps near `CombatPage`:

```ts
const tacticLabels = {
  attack: '攻势', guard: '守势', movement: '身法', break: '破招', inner: '内功', trick: '奇招', demonic: '魔功', romance: '红颜',
} as const

const enemyTacticLabels = {
  assault: '猛攻', guard: '守势', charge: '蓄力', cast: '施术', feint: '虚招',
} as const

const matchupLabels = {
  advantage: '克制', neutral: '普通', disadvantage: '被克制',
} as const
```

In the combat header, render:

```tsx
<p>行动点 {combat.actionPoints}/3</p>
```

For current intent, show:

```tsx
<p>敌人意图：{enemyTacticLabels[currentEnemyTactic]} · {intent.text}</p>
```

For each card button, append:

```tsx
<span>行动 {getCardActionCost(card)}</span>
<span>{tacticLabels[getCardTactic(card)]}</span>
<span>{matchupLabels[getTacticMatchup(getCardTactic(card), currentEnemyTactic)]}</span>
```

Disable cards when either inner power or action points are insufficient:

```tsx
const lacksAction = combat.actionPoints < getCardActionCost(card)
```

Render an explicit button:

```tsx
<button onClick={endTurn}>结束回合</button>
```

- [ ] **Step 5: Run UI focused tests**

Run:

```bash
npm test -- src/tests/routeUi.test.tsx --reporter=dot
```

Expected: PASS.

- [ ] **Step 6: Commit Task 4**

Run:

```bash
git add src/App.tsx src/tests/routeUi.test.tsx
git commit -m "feat: show stance combat decisions"
```

## Task 5: Regression, Balance Pass, and Build

**Files:**
- Modify as needed: `src/tests/fullPlaythrough.test.ts`, `src/tests/routeUi.test.tsx`, `src/engine/combatEngine.ts`, `src/data/cards.ts`, `src/data/enemies.ts`

- [ ] **Step 1: Run combat-focused suite**

Run:

```bash
npm test -- src/tests/combatEngine.test.ts src/tests/gameStore.test.ts src/tests/routeUi.test.tsx --reporter=dot
```

Expected: PASS.

- [ ] **Step 2: Run full playthrough regression**

Run:

```bash
npm test -- src/tests/fullPlaythrough.test.ts --reporter=dot
```

Expected: PASS. If this fails because the helper assumed one-card auto-end, update the helper to call `endPlayerTurn` or the store `endTurn` explicitly after cards that should hand control to the enemy.

- [ ] **Step 3: Run full suite and production build**

Run:

```bash
npm test && npm run build
```

Expected:

```text
Test Files ... passed
Tests ... passed
✓ built
```

- [ ] **Step 4: Manual QA notes**

Append to `docs/manual-playthrough-qa.md` a combat-specific checklist:

```md
## 架势博弈 V1 战斗检查

- [ ] 战斗开始时显示行动点 3/3，并抽 4 张手牌。
- [ ] 打出 1 行动点牌后，行动点减少但不会自动进入敌方回合。
- [ ] 点击“结束回合”后敌人才行动，并进入下一回合。
- [ ] 敌人猛攻时，守势/身法牌显示“克制”。
- [ ] 敌人守势或蓄力时，破招牌显示“克制”。
- [ ] 破绽、中毒、反击至少各触发一次，并确认日志解释了效果。
```

- [ ] **Step 5: Final commit**

If Step 4 changed docs or Step 1-3 required final balancing edits, commit:

```bash
git add docs/manual-playthrough-qa.md src
git commit -m "test: verify stance combat v1"
```

If there are no final changes after previous commits, skip this commit.

- [ ] **Step 6: Push to origin/main**

Run:

```bash
git push origin HEAD:main
git status --short
git rev-parse HEAD
git rev-parse origin/main
```

Expected: push succeeds, status is clean, and HEAD equals `origin/main`.

## Self-Review

- Spec coverage: action points, multi-card turns, enemy tactics, card tactics, matchup table, status effects, UI labels, TDD order, regression/build verification are all mapped to tasks.
- Placeholder scan: no TBD/TODO/fill-in placeholders remain. Conditional notes are limited to existing code compatibility and contain exact fallback actions.
- Type consistency: `CombatTactic`, `EnemyTactic`, `actionPoints`, `costAction`, `tactic`, `getCardActionCost`, `getCardTactic`, and `getTacticMatchup` are consistently named throughout.
