import type {
  Game,
  InitApi,
  RenderApi,
  UpdateApi,
} from "@clockwyrks/simple-2d";
import type { DeepReadonly } from "ts-essentials";
import {
  ACTIONS,
  BACK_LABEL,
  BINDINGS,
  BOARD_CX,
  BOARD_CY,
  CAMPAIGN_LENGTH,
  CELL_PITCH,
  CHANNELS,
  CLEAR_LABEL,
  CUES,
  GRID_MAX_COLS,
  GRID_MAX_ROWS,
  HUD_SOLVED_LABEL,
  HUD_TIER_LABEL,
  MAX_TIER,
  NODE_HIT_R,
  NODE_R,
  REFRACT_DEBUG_VERSION,
  SET_LABELS,
  SOLVED_ITEMS,
  SOLVED_TITLE_TEXT,
  STAGE_H,
  STAGE_W,
  TAGLINE_TEXT,
  TIER_ADVANCE,
  TITLE_ITEMS,
  TITLE_TEXT,
} from "./constants";

export type Screen =
  "title" | "howto" | "select" | "playing" | "solved" | "complete";
export type Mode = "campaign" | "cascade";
export type Channel = "triangle" | "square" | "diamond";
export type NodeKind = "emitter" | "lens" | "crystal";
export interface Cell {
  readonly col: number;
  readonly row: number;
}
export interface NodeState {
  readonly col: number;
  readonly row: number;
  readonly kind: NodeKind;
  readonly channel: Channel | null;
  readonly charges: number | null;
}
export interface BoardState {
  readonly cols: number;
  readonly rows: number;
  readonly nodes: readonly NodeState[];
}
export interface BeamState {
  readonly channel: Channel;
  readonly cells: readonly Cell[];
}
export interface TraceState {
  readonly channel: Channel;
}
export type PointerDevice = "mouse" | "pen" | "touch";
export interface PointerState {
  readonly x: number;
  readonly y: number;
  readonly down: boolean;
  readonly device: PointerDevice;
}
export interface RefractState {
  readonly screen: Screen;
  readonly mode: Mode;
  readonly menuIndex: number;
  readonly board: BoardState;
  readonly beams: readonly BeamState[];
  readonly tracing: TraceState | null;
  readonly boardIndex: number;
  readonly solvedBoards: readonly number[];
  readonly unlockedCount: number;
  readonly selectIndex: number;
  readonly solvedCount: number;
  readonly tier: number;
  readonly pointer: PointerState;
  readonly armedTarget: string | null;
  readonly simTime: number;
  readonly muted: boolean;
}
export interface Target {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}
export interface RefractSnapshot {
  readonly version: number;
  readonly screen: Screen;
  readonly mode: Mode;
  readonly menuIndex: number;
  readonly boardIndex: number;
  readonly solvedBoards: readonly number[];
  readonly unlockedCount: number;
  readonly selectIndex: number;
  readonly solvedCount: number;
  readonly tier: number;
  readonly board: {
    readonly cols: number;
    readonly rows: number;
    readonly nodes: readonly (NodeState & {
      readonly x: number;
      readonly y: number;
      readonly spent: number | null;
    })[];
  };
  readonly beams: Partial<
    Record<
      Channel,
      { readonly cells: readonly Cell[]; readonly complete: boolean }
    >
  >;
  readonly solved: boolean;
  readonly tracing: { readonly channel: Channel; readonly live: Cell } | null;
  readonly pointer: PointerState;
  readonly targets: readonly Target[];
  readonly muted: boolean;
  readonly simTime: number;
}
export interface RefractDebugApi {
  readonly version: number;
  reset(s: DeepReadonly<RefractState>): RefractState;
  snapshot(s: DeepReadonly<RefractState>): RefractSnapshot;
  reconcile(s: DeepReadonly<RefractState>): RefractState;
  setMode(s: DeepReadonly<RefractState>, v: Mode): RefractState;
  setScreen(s: DeepReadonly<RefractState>, v: Screen): RefractState;
  setMenuIndex(s: DeepReadonly<RefractState>, v: number): RefractState;
  setSolvedCount(s: DeepReadonly<RefractState>, v: number): RefractState;
  setTier(s: DeepReadonly<RefractState>, v: number): RefractState;
  generateBoard(s: DeepReadonly<RefractState>, v: number): RefractState;
  loadBoard(s: DeepReadonly<RefractState>, v: readonly string[]): RefractState;
  pointerDown(
    s: DeepReadonly<RefractState>,
    x: number,
    y: number,
    d?: PointerDevice,
  ): RefractState;
  pointerMove(
    s: DeepReadonly<RefractState>,
    x: number,
    y: number,
    d?: PointerDevice,
  ): RefractState;
  pointerUp(s: DeepReadonly<RefractState>, d?: PointerDevice): RefractState;
  clear(s: DeepReadonly<RefractState>): RefractState;
}

export const BACKGROUND = "#071018";
const EMPTY: BoardState = { cols: 1, rows: 1, nodes: [] };
const CAMPAIGN: readonly (readonly string[])[] = [
  [".Tt", "ttT", ".tt"],
  [".tt", "TtT", "tt."],
  ["tTtt", "ttTt", "ttt."],
  ["Tt.t", "tTtt", ".ttt"],
  [".tTt", ".ttt", "ttTt", "tttt"],
  ["tttT", "ttt.", "t.tt", "ttTt"],
  ["STtt", "sstt", "ssTt", "Sss."],
  ["Sst..", "stTtt", "ssttt", "SsstT"],
  ["tSss", "2tss", "Ttss", "tTS."],
  ["Tt.T.", "ttt..", "t2sSs", "tSsss"],
  ["..t.s", "ttT2s", "ttS2S", "t.Tss"],
  ["Tttt.", "ttsSt", ".22t.", "ssST."],
  [".Ddd", "tTdD", "t22.", "tsSs", "T.S."],
  ["..tT.", "t2dD.", "T2t.s", "d2sss", "DSssS"],
  [".T.2t", "sDttt", "sS2Td", "ss22D", ".S.d."],
  ["..ttt", ".S2tt", "DsTsT", "d22d.", "SddD."],
  ["...ttd", "S2Ttdd", "t32Ddd", "Tss2d.", "sS.dD."],
  ["T.....", "ttDsss", "dd3222", ".dt3Ss", "DddTSs"],
  [".Dttt", ".dd3t", ".d2TT", "S2s2D", ".sSss"],
  [".S.tT.", "s2ttDd", "s2T2.d", "s22d3.", "ssSddD"],
  ["S2D..T", "d2ssts", ".D3S3s", ".dT32t", ".d2tt."],
  [".tt2d.", ".t2t2d", "t1DdSd", "2.S3dD", "TT2sd.", ".ssss."],
  ["s2SST..", "2232.t.", "stTsttt", "..t.t.t", "d22ttdD", "dD2dddd"],
  ["ssdd.d.", "2S.dd2d", "ssD..d.", "t2ttTdd", ".t323Dd", "ttT2sS."],
];
const CASCADE = [
  CAMPAIGN[0],
  CAMPAIGN[9],
  CAMPAIGN[11],
  CAMPAIGN[16],
  CAMPAIGN[23],
] as const;
export const cellX = (c: number, n: number): number =>
  BOARD_CX - ((n - 1) * CELL_PITCH) / 2 + c * CELL_PITCH;
export const cellY = (r: number, n: number): number =>
  BOARD_CY - ((n - 1) * CELL_PITCH) / 2 + r * CELL_PITCH;
const same = (a: Cell, b: Cell) => a.col === b.col && a.row === b.row,
  key = (c: Cell) => `${c.col},${c.row}`,
  seg = (a: Cell, b: Cell) => [key(a), key(b)].sort().join("|");
const clone = (s: DeepReadonly<RefractState>): RefractState => ({
  ...s,
  board: { ...s.board, nodes: s.board.nodes.map((n) => ({ ...n })) },
  beams: s.beams.map((b) => ({
    channel: b.channel,
    cells: b.cells.map((c) => ({ ...c })),
  })),
  solvedBoards: [...s.solvedBoards],
  pointer: { ...s.pointer },
  tracing: s.tracing ? { ...s.tracing } : null,
});
export function parseBoard(rows: readonly string[]): BoardState {
  if (rows.length < 1 || rows.length > GRID_MAX_ROWS)
    throw Error("Refract: invalid board height");
  const cols = rows[0]?.length ?? 0;
  if (cols < 1 || cols > GRID_MAX_COLS || rows.some((r) => r.length !== cols))
    throw Error("Refract: invalid board width");
  const nodes: NodeState[] = [];
  const m: Record<string, [NodeKind, Channel | null, number | null]> = {
    T: ["emitter", "triangle", null],
    S: ["emitter", "square", null],
    D: ["emitter", "diamond", null],
    t: ["lens", "triangle", null],
    s: ["lens", "square", null],
    d: ["lens", "diamond", null],
    "1": ["crystal", null, 1],
    "2": ["crystal", null, 2],
    "3": ["crystal", null, 3],
  };
  rows.forEach((line, row) =>
    [...line].forEach((ch, col) => {
      if (ch === ".") return;
      const v = m[ch];
      if (!v) throw Error(`Refract: invalid board notation '${ch}'`);
      nodes.push({ col, row, kind: v[0], channel: v[1], charges: v[2] });
    }),
  );
  return { cols, rows: rows.length, nodes };
}
const nodeAt = (b: DeepReadonly<BoardState>, c: Cell) =>
  b.nodes.find((n) => same(n, c));
const spent = (bs: DeepReadonly<readonly BeamState[]>, c: Cell) =>
  bs.reduce((n, b) => n + b.cells.filter((x) => same(x, c)).length, 0);
function complete(
  board: DeepReadonly<BoardState>,
  beam: DeepReadonly<BeamState>,
): boolean {
  if (beam.cells.length < 2) return false;
  const a = nodeAt(board, beam.cells[0]!),
    z = nodeAt(board, beam.cells[beam.cells.length - 1]!);
  if (
    a?.kind !== "emitter" ||
    z?.kind !== "emitter" ||
    a.channel !== beam.channel ||
    z.channel !== beam.channel
  )
    return false;
  return board.nodes
    .filter((n) => n.kind === "lens" && n.channel === beam.channel)
    .every((n) => beam.cells.filter((c) => same(c, n)).length === 1);
}
export function isSolved(
  board: DeepReadonly<BoardState>,
  beams: DeepReadonly<readonly BeamState[]>,
): boolean {
  return (
    beams.length > 0 &&
    beams.every((b) => complete(board, b)) &&
    board.nodes
      .filter((n) => n.kind === "crystal")
      .every(
        (n) =>
          spent(beams, n) === n.charges &&
          beams.every((b) =>
            b.cells.every(
              (c, i) => !same(c, n) || (i > 0 && i < b.cells.length - 1),
            ),
          ),
      )
  );
}
function legal(
  board: DeepReadonly<BoardState>,
  beams: DeepReadonly<readonly BeamState[]>,
  ch: Channel,
  from: Cell,
  to: Cell,
): boolean {
  const n = nodeAt(board, to);
  if (
    !n ||
    (n.channel && n.channel !== ch) ||
    Math.max(Math.abs(from.col - to.col), Math.abs(from.row - to.row)) !== 1
  )
    return false;
  const sk = seg(from, to);
  if (
    beams.some((b) =>
      b.cells.some((c, i) => i > 0 && seg(c, b.cells[i - 1]!) === sk),
    )
  )
    return false;
  if (from.col !== to.col && from.row !== to.row) {
    const a = { col: from.col, row: to.row },
      z = { col: to.col, row: from.row };
    if (
      beams.some((b) =>
        b.cells.some((c, i) => i > 0 && seg(c, b.cells[i - 1]!) === seg(a, z)),
      )
    )
      return false;
  }
  if (n.kind === "crystal" && spent(beams, to) >= (n.charges ?? 0))
    return false;
  if (
    n.kind === "emitter" &&
    beams.some((b) => b.cells.some((c) => same(c, to)))
  )
    return false;
  if (
    n.kind === "lens" &&
    (beams.find((b) => b.channel === ch)?.cells.some((c) => same(c, to)) ??
      false)
  )
    return false;
  return true;
}
function initial(muted = false): RefractState {
  return {
    screen: "title",
    mode: "campaign",
    menuIndex: 0,
    board: EMPTY,
    beams: [],
    tracing: null,
    boardIndex: 0,
    solvedBoards: [],
    unlockedCount: 1,
    selectIndex: 0,
    solvedCount: 0,
    tier: 1,
    pointer: { x: 0, y: 0, down: false, device: "mouse" },
    armedTarget: null,
    simTime: 0,
    muted,
  };
}
const fresh = (b: DeepReadonly<BoardState>): BeamState[] =>
  CHANNELS.filter((c) => b.nodes.some((n) => n.channel === c)).map(
    (channel) => ({ channel, cells: [] }),
  );
function load(s: DeepReadonly<RefractState>, board: BoardState): RefractState {
  return {
    ...clone(s),
    screen: "playing",
    board,
    beams: fresh(board),
    tracing: null,
    menuIndex: 0,
    armedTarget: null,
  };
}
function generate(s: DeepReadonly<RefractState>, tier: number): RefractState {
  if (!Number.isInteger(tier) || tier < 1 || tier > MAX_TIER)
    throw RangeError("Refract: invalid tier");
  return load(s, parseBoard(CASCADE[tier - 1]!));
}
export function targets(s: DeepReadonly<RefractState>): Target[] {
  const menu = (n: number, y = 340) =>
    Array.from({ length: n }, (_, i) => ({
      id: `menu-${i}`,
      x: 440,
      y: y + i * 82,
      w: 400,
      h: 72,
    }));
  if (s.screen === "title") return menu(3, 350);
  if (s.screen === "howto")
    return [{ id: "back", x: 70, y: 620, w: 140, h: 72 }];
  if (s.screen === "playing")
    return [
      { id: "clear", x: 1020, y: 610, w: 120, h: 72 },
      { id: "back", x: 70, y: 610, w: 120, h: 72 },
    ];
  if (s.screen === "select") {
    const a = Array.from({ length: CAMPAIGN_LENGTH }, (_, i) => ({
      id: `board-${i + 1}`,
      x: 270 + (i % 6) * 130,
      y: 190 + Math.floor(i / 6) * 100,
      w: 112,
      h: 76,
    }));
    return [...a, { id: "back", x: 70, y: 620, w: 140, h: 72 }];
  }
  if (s.screen === "complete") return menu(2, 410);
  return menu(s.mode === "cascade" ? 2 : s.boardIndex < 23 ? 3 : 2, 390);
}
const hit = (s: DeepReadonly<RefractState>, x: number, y: number) =>
  targets(s).find(
    (t) => x >= t.x && x <= t.x + t.w && y >= t.y && y <= t.y + t.h,
  );
const clearAll = (s: DeepReadonly<RefractState>): RefractState => ({
  ...clone(s),
  beams: s.beams.map((b) => ({ channel: b.channel, cells: [] })),
  tracing: null,
});
function solve(s: RefractState): RefractState {
  if (!isSolved(s.board, s.beams)) return s;
  if (s.mode === "cascade") {
    const n = s.solvedCount + 1;
    return {
      ...s,
      screen: "solved",
      tracing: null,
      menuIndex: 0,
      solvedCount: n,
      tier: Math.min(Math.floor(n / TIER_ADVANCE) + 1, MAX_TIER),
    };
  }
  const a = [...new Set([...s.solvedBoards, s.boardIndex])].sort(
    (x, y) => x - y,
  );
  return {
    ...s,
    screen: a.length === CAMPAIGN_LENGTH ? "complete" : "solved",
    tracing: null,
    menuIndex: 0,
    solvedBoards: a,
    unlockedCount: Math.max(
      s.unlockedCount,
      Math.min(CAMPAIGN_LENGTH, s.boardIndex + 2),
    ),
    selectIndex: s.boardIndex,
  };
}
function back(s: DeepReadonly<RefractState>): RefractState {
  if (s.screen === "howto")
    return { ...clone(s), screen: "title", menuIndex: 2, armedTarget: null };
  if (s.screen === "select")
    return { ...clone(s), screen: "title", menuIndex: 0, armedTarget: null };
  if (s.screen === "playing")
    return s.mode === "campaign"
      ? { ...clearAll(s), screen: "select", selectIndex: s.boardIndex }
      : { ...clearAll(s), screen: "title", menuIndex: 1 };
  if (s.screen === "solved" || s.screen === "complete")
    return {
      ...clone(s),
      screen: s.mode === "campaign" ? "select" : "title",
      menuIndex: s.mode === "campaign" ? 0 : 1,
    };
  return clone(s);
}
function choose(s: DeepReadonly<RefractState>): RefractState {
  if (s.screen === "title") {
    if (s.menuIndex === 0)
      return { ...clone(s), mode: "campaign", screen: "select" };
    if (s.menuIndex === 1)
      return generate(
        { ...clone(s), mode: "cascade", solvedCount: 0, tier: 1 },
        1,
      );
    return { ...clone(s), screen: "howto", menuIndex: 0 };
  }
  if (s.screen === "select")
    return s.selectIndex >= s.unlockedCount
      ? clone(s)
      : load(
          { ...clone(s), boardIndex: s.selectIndex },
          parseBoard(CAMPAIGN[s.selectIndex]!),
        );
  if (s.screen === "complete")
    return s.menuIndex === 0
      ? { ...clone(s), screen: "select" }
      : { ...clone(s), screen: "title", menuIndex: 0 };
  if (s.screen === "solved") {
    if (s.mode === "cascade")
      return s.menuIndex === 0
        ? generate(s, s.tier)
        : generate({ ...clone(s), solvedCount: 0, tier: 1 }, 1);
    const next = s.boardIndex < 23;
    if (next && s.menuIndex === 0)
      return load(
        {
          ...clone(s),
          boardIndex: s.boardIndex + 1,
          selectIndex: s.boardIndex + 1,
        },
        parseBoard(CAMPAIGN[s.boardIndex + 1]!),
      );
    if (s.menuIndex === (next ? 1 : 0))
      return load(s, parseBoard(CAMPAIGN[s.boardIndex]!));
    return { ...clone(s), screen: "select" };
  }
  return clone(s);
}

function grab(s: DeepReadonly<RefractState>, n: NodeState): RefractState {
  const beams = s.beams.map((b) => ({
    channel: b.channel,
    cells: b.cells.map((c) => ({ ...c })),
  }));
  let i = beams.findIndex(
    (b) =>
      b.channel === n.channel && b.cells.length === 0 && n.kind === "emitter",
  );
  if (i >= 0) {
    beams[i] = { ...beams[i]!, cells: [{ col: n.col, row: n.row }] };
    return { ...clone(s), beams, tracing: { channel: beams[i]!.channel } };
  }
  i = beams.findIndex(
    (b) =>
      b.cells.length > 0 &&
      (same(b.cells[0]!, n) || same(b.cells[b.cells.length - 1]!, n)),
  );
  if (i >= 0) {
    const b = beams[i]!;
    beams[i] = {
      ...b,
      cells: same(b.cells[0]!, n) ? [...b.cells].reverse() : b.cells,
    };
    return { ...clone(s), beams, tracing: { channel: b.channel } };
  }
  const carrier = beams.filter((b) => b.cells.some((c) => same(c, n)));
  if (carrier.length === 1) {
    const b = carrier[0]!;
    i = beams.indexOf(b);
    const matches = b.cells
      .map((c, j) => (same(c, n) ? j : -1))
      .filter((j) => j >= 0);
    const at = matches[matches.length - 1]!;
    beams[i] = { ...b, cells: b.cells.slice(0, at + 1) };
    return { ...clone(s), beams, tracing: { channel: b.channel } };
  }
  return clone(s);
}
function take(s: DeepReadonly<RefractState>, id: string): RefractState {
  if (id === "back") return back(s);
  if (id === "clear") return clearAll(s);
  if (id.startsWith("board-")) {
    const i = Number(id.slice(6)) - 1;
    return i >= s.unlockedCount
      ? clone(s)
      : load(
          { ...clone(s), boardIndex: i, selectIndex: i },
          parseBoard(CAMPAIGN[i]!),
        );
  }
  return choose({ ...clone(s), menuIndex: Number(id.slice(5)) });
}
function pointer(
  s: DeepReadonly<RefractState>,
  type: "down" | "move" | "up",
  x: number,
  y: number,
  device: PointerDevice,
): RefractState {
  let q: RefractState = {
    ...clone(s),
    pointer: { x, y, down: type !== "up", device },
  };
  const t = hit(q, x, y);
  if (type === "down") {
    if (t) {
      q = { ...q, armedTarget: t.id };
      if (t.id.startsWith("menu-"))
        q = { ...q, menuIndex: Number(t.id.slice(5)) };
      if (t.id.startsWith("board-"))
        q = { ...q, selectIndex: Number(t.id.slice(6)) - 1 };
      return q;
    }
    if (q.screen === "playing") {
      const n = q.board.nodes.find(
        (n) =>
          Math.hypot(
            x - cellX(n.col, q.board.cols),
            y - cellY(n.row, q.board.rows),
          ) <= NODE_HIT_R,
      );
      if (n) return grab(q, { ...n });
    }
    return q;
  }
  if (type === "up") {
    const armed = q.armedTarget;
    q = {
      ...q,
      tracing: null,
      armedTarget: null,
      beams: q.beams.map((b) =>
        b.cells.length === 1 ? { ...b, cells: [] } : b,
      ),
    };
    return armed && t?.id === armed ? take(q, armed) : q;
  }
  if (!q.pointer.down && t) {
    if (t.id.startsWith("menu-"))
      q = { ...q, menuIndex: Number(t.id.slice(5)) };
    if (t.id.startsWith("board-"))
      q = { ...q, selectIndex: Number(t.id.slice(6)) - 1 };
  }
  if (q.screen === "playing" && q.tracing) {
    const n = q.board.nodes.find(
      (n) =>
        Math.hypot(
          x - cellX(n.col, q.board.cols),
          y - cellY(n.row, q.board.rows),
        ) <= NODE_HIT_R,
    );
    const i = q.beams.findIndex((b) => b.channel === q.tracing?.channel),
      b = q.beams[i]!,
      end = b.cells[b.cells.length - 1];
    if (n && end && !same(n, end)) {
      let cells = [...b.cells];
      if (cells.length > 1 && same(cells[cells.length - 2]!, n))
        cells = cells.slice(0, -1);
      else if (legal(q.board, q.beams, b.channel, end, n))
        cells = [...cells, { col: n.col, row: n.row }];
      else return q;
      return solve({
        ...q,
        beams: q.beams.map((v, j) => (j === i ? { ...v, cells } : v)),
      });
    }
  }
  return q;
}
function snapshot(s: DeepReadonly<RefractState>): RefractSnapshot {
  const beams: RefractSnapshot["beams"] = {};
  s.beams.forEach((b) => {
    beams[b.channel] = {
      cells: b.cells.map((c) => ({ ...c })),
      complete: complete(s.board, b),
    };
  });
  return {
    version: 2,
    screen: s.screen,
    mode: s.mode,
    menuIndex: s.menuIndex,
    boardIndex: s.boardIndex,
    solvedBoards: [...s.solvedBoards],
    unlockedCount: s.unlockedCount,
    selectIndex: s.selectIndex,
    solvedCount: s.solvedCount,
    tier: s.tier,
    board: {
      cols: s.board.cols,
      rows: s.board.rows,
      nodes: s.board.nodes.map((n) => ({
        ...n,
        x: cellX(n.col, s.board.cols),
        y: cellY(n.row, s.board.rows),
        spent: n.kind === "crystal" ? spent(s.beams, n) : null,
      })),
    },
    beams,
    solved: isSolved(s.board, s.beams),
    tracing: s.tracing
      ? {
          channel: s.tracing.channel,
          live: (() => {
            const cells = s.beams.find(
              (b) => b.channel === s.tracing?.channel,
            )!.cells;
            return { ...cells[cells.length - 1]! };
          })(),
        }
      : null,
    pointer: { ...s.pointer },
    targets: targets(s),
    muted: s.muted,
    simTime: s.simTime,
  };
}
function debugApi(): RefractDebugApi {
  return {
    version: REFRACT_DEBUG_VERSION,
    reset: (s) => initial(s.muted),
    snapshot,
    reconcile: clone,
    setMode: (s, mode) => ({ ...clone(s), mode }),
    setScreen: (s, screen) => ({ ...clone(s), screen, armedTarget: null }),
    setMenuIndex: (s, menuIndex) => ({ ...clone(s), menuIndex }),
    setSolvedCount: (s, v) => {
      if (!Number.isInteger(v) || v < 0)
        throw RangeError("Refract: invalid solved count");
      return { ...clone(s), solvedCount: v };
    },
    setTier: (s, v) => {
      if (!Number.isInteger(v) || v < 1 || v > MAX_TIER)
        throw RangeError("Refract: invalid tier");
      return { ...clone(s), tier: v };
    },
    generateBoard: generate,
    loadBoard: (s, b) => load(s, parseBoard(b)),
    pointerDown: (s, x, y, d = "mouse") => pointer(s, "down", x, y, d),
    pointerMove: (s, x, y, d = "mouse") => pointer(s, "move", x, y, d),
    pointerUp: (s, d = "mouse") =>
      pointer(s, "up", s.pointer.x, s.pointer.y, d),
    clear: clearAll,
  };
}

const COLORS: Record<Channel, string> = {
  triangle: "#42e8e0",
  square: "#ff5ea8",
  diamond: "#ffc857",
};
function text(
  c: CanvasRenderingContext2D,
  v: string,
  x: number,
  y: number,
  size = 24,
  align: CanvasTextAlign = "center",
  color = "#dbeeff",
) {
  c.fillStyle = color;
  c.font = `600 ${size}px ui-sans-serif,system-ui,sans-serif`;
  c.textAlign = align;
  c.textBaseline = "middle";
  c.fillText(v, x, y);
}
function shape(
  c: CanvasRenderingContext2D,
  ch: Channel,
  x: number,
  y: number,
  r: number,
) {
  c.beginPath();
  if (ch === "triangle") {
    c.moveTo(x, y - r);
    c.lineTo(x + r * 0.9, y + r * 0.75);
    c.lineTo(x - r * 0.9, y + r * 0.75);
    c.closePath();
  } else if (ch === "square")
    c.rect(x - r * 0.72, y - r * 0.72, r * 1.44, r * 1.44);
  else {
    c.moveTo(x, y - r);
    c.lineTo(x + r, y);
    c.lineTo(x, y + r);
    c.lineTo(x - r, y);
    c.closePath();
  }
}
function button(c: CanvasRenderingContext2D, t: Target, v: string, on = false) {
  c.beginPath();
  c.roundRect(t.x, t.y, t.w, t.h, 16);
  c.fillStyle = on ? "#173a50" : "#0b202d";
  c.fill();
  c.strokeStyle = on ? "#8cecff" : "#31566a";
  c.lineWidth = 2;
  c.stroke();
  text(c, v, t.x + t.w / 2, t.y + t.h / 2, 20);
}
function boardDraw(c: CanvasRenderingContext2D, s: DeepReadonly<RefractState>) {
  s.beams.forEach((b) => {
    if (b.cells.length < 2) return;
    c.beginPath();
    b.cells.forEach((p, i) =>
      i
        ? c.lineTo(cellX(p.col, s.board.cols), cellY(p.row, s.board.rows))
        : c.moveTo(cellX(p.col, s.board.cols), cellY(p.row, s.board.rows)),
    );
    c.strokeStyle = COLORS[b.channel];
    c.shadowColor = COLORS[b.channel];
    c.shadowBlur = 16;
    c.lineWidth = 10;
    c.lineCap = "round";
    c.lineJoin = "round";
    c.stroke();
    c.shadowBlur = 0;
  });
  s.board.nodes.forEach((n) => {
    const x = cellX(n.col, s.board.cols),
      y = cellY(n.row, s.board.rows);
    if (n.kind === "crystal") {
      c.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 2;
        if (i) c.lineTo(x + Math.cos(a) * NODE_R, y + Math.sin(a) * NODE_R);
        else c.moveTo(x + Math.cos(a) * NODE_R, y + Math.sin(a) * NODE_R);
      }
      c.closePath();
      c.fillStyle = "#132f43";
      c.fill();
      c.strokeStyle = "#a7d6f1";
      c.lineWidth = 3;
      c.stroke();
      const used = spent(s.beams, n);
      for (let i = 0; i < (n.charges ?? 0); i++) {
        c.beginPath();
        c.arc(x + (i - (n.charges! - 1) / 2) * 14, y, 5, 0, Math.PI * 2);
        c.fillStyle = i < used ? "#fff3a6" : "#476173";
        c.fill();
      }
      return;
    }
    shape(c, n.channel!, x, y, NODE_R);
    c.strokeStyle = COLORS[n.channel!];
    c.fillStyle = COLORS[n.channel!];
    c.lineWidth = 4;
    if (n.kind === "lens") {
      c.shadowColor = COLORS[n.channel!];
      c.shadowBlur = 12;
      c.fill();
      c.shadowBlur = 0;
    } else c.stroke();
  });
}
function draw(s: DeepReadonly<RefractState>, c: CanvasRenderingContext2D) {
  c.fillStyle = BACKGROUND;
  c.fillRect(0, 0, STAGE_W, STAGE_H);
  const g = c.createRadialGradient(640, 360, 30, 640, 360, 700);
  g.addColorStop(0, "#102a3b");
  g.addColorStop(1, BACKGROUND);
  c.fillStyle = g;
  c.fillRect(0, 0, STAGE_W, STAGE_H);
  if (["playing", "solved", "complete"].includes(s.screen)) boardDraw(c, s);
  if (s.screen === "title") {
    text(c, TITLE_TEXT, 640, 180, 82, "center", "#c8fbff");
    text(c, TAGLINE_TEXT, 640, 257, 22, "center", "#6e9fb5");
    TITLE_ITEMS.forEach((v, i) =>
      button(c, targets(s)[i]!, v, i === s.menuIndex),
    );
    return;
  }
  if (s.screen === "howto") {
    text(c, "HOW TO PLAY", 640, 70, 42, "center", "#c8fbff");
    [
      "Press an emitter and drag from node to adjacent node.",
      "Connect both matching emitters and thread every filled lens.",
      "Crystals accept any color; spend every charge exactly once.",
      "No shared segments or crossing diagonals. Illegal moves are ignored.",
      "Release to keep a path. Drag backward to unwind. R clears all beams.",
    ].forEach((v, i) => text(c, v, 640, 180 + i * 72, 24));
    button(c, targets(s)[0]!, BACK_LABEL);
    return;
  }
  if (s.screen === "select") {
    text(c, "CAMPAIGN", 640, 80, 44, "center", "#c8fbff");
    SET_LABELS.forEach((v, r) =>
      text(c, v, 190, 228 + r * 100, 18, "right", "#7193a5"),
    );
    targets(s)
      .slice(0, 24)
      .forEach((t, i) =>
        button(
          c,
          t,
          s.solvedBoards.includes(i)
            ? "✓"
            : i < s.unlockedCount
              ? String(i + 1)
              : "—",
          i === s.selectIndex,
        ),
      );
    const allTargets = targets(s);
    button(c, allTargets[allTargets.length - 1]!, BACK_LABEL);
    return;
  }
  if (s.screen === "playing") {
    text(
      c,
      s.mode === "campaign"
        ? `BOARD ${s.boardIndex + 1}`
        : `${HUD_SOLVED_LABEL} ${s.solvedCount}   ${HUD_TIER_LABEL} ${s.tier}`,
      640,
      56,
      28,
      "center",
      "#c8fbff",
    );
    s.beams.forEach((b, i) => {
      shape(c, b.channel, 500 + i * 140, 102, 13);
      c.fillStyle = COLORS[b.channel];
      c.strokeStyle = COLORS[b.channel];
      if (complete(s.board, b)) c.fill();
      else c.stroke();
    });
    const t = targets(s);
    button(c, t[0]!, CLEAR_LABEL);
    button(c, t[1]!, BACK_LABEL);
    return;
  }
  c.fillStyle = "rgba(3,10,16,.76)";
  c.fillRect(350, 300, 580, 390);
  text(
    c,
    s.screen === "complete"
      ? "CAMPAIGN COMPLETE"
      : s.mode === "cascade"
        ? SOLVED_TITLE_TEXT
        : `BOARD ${s.boardIndex + 1} SOLVED`,
    640,
    340,
    36,
    "center",
    "#c8fbff",
  );
  const labels =
    s.screen === "complete"
      ? ["BACK TO SELECT", "BACK TO TITLE"]
      : s.mode === "cascade"
        ? [...SOLVED_ITEMS]
        : [
            ...(s.boardIndex < 23 ? ["NEXT BOARD"] : []),
            "REPLAY",
            "BACK TO SELECT",
          ];
  targets(s).forEach((t, i) => button(c, t, labels[i]!, i === s.menuIndex));
}

export const game: Game<RefractState, RefractDebugApi> = {
  initialize(api: InitApi<RefractState>) {
    ACTIONS.forEach((a) => api.input.register(a, { keys: [...BINDINGS[a]] }));
    api.audio.define(CUES.connect, {
      freq: 520,
      freqTo: 760,
      durationMs: 70,
      gain: 0.13,
    });
    api.audio.define(CUES.retract, {
      wave: "triangle",
      freq: 360,
      freqTo: 220,
      durationMs: 70,
      gain: 0.12,
    });
    api.audio.define(CUES.channelComplete, {
      freq: 660,
      freqTo: 980,
      durationMs: 140,
      gain: 0.16,
    });
    api.audio.define(CUES.solved, {
      wave: "triangle",
      freq: 440,
      freqTo: 1040,
      durationMs: 320,
      gain: 0.18,
    });
    api.audio.define(CUES.clear, {
      wave: "sawtooth",
      freq: 260,
      freqTo: 120,
      durationMs: 110,
      gain: 0.09,
    });
    api.diagnostics.register("screen", (s) => s.screen);
    api.diagnostics.register("mode", (s) => s.mode);
    api.diagnostics.register("board", (s) => `${s.board.cols}x${s.board.rows}`);
    CHANNELS.forEach((ch) =>
      api.diagnostics.register(ch, (s) => {
        const b = s.beams.find((x) => x.channel === ch);
        return b
          ? `${Math.max(0, b.cells.length - 1)} ${complete(s.board, b) ? "complete" : "open"}`
          : "—";
      }),
    );
    api.diagnostics.register(
      "crystals",
      (s) =>
        s.board.nodes
          .filter((n) => n.kind === "crystal")
          .map((n) => `${spent(s.beams, n)}/${n.charges}`)
          .join(" ") || "—",
    );
    api.diagnostics.register("solved", (s) => isSolved(s.board, s.beams));
    api.diagnostics.register(
      "pointer",
      (s) =>
        `${Math.round(s.pointer.x)},${Math.round(s.pointer.y)} ${s.pointer.device}`,
    );
    return [initial(), debugApi()];
  },
  update(state: DeepReadonly<RefractState>, api: UpdateApi, dt: number) {
    let s: RefractState = { ...clone(state), simTime: state.simTime + dt };
    const before = state.beams.reduce((n, b) => n + b.cells.length, 0);
    if (api.input.pressed("mute")) api.audio.setMuted(!api.audio.muted());
    for (const p of api.input.pointerSamples().filter((p) => p.primary))
      s = pointer(s, p.type, p.x, p.y, p.device);
    const p = api.input.pointer();
    s = { ...s, pointer: { x: p.x, y: p.y, down: p.down, device: p.device } };
    if (api.input.pressed("clear") && s.screen === "playing") {
      if (before > 0) api.audio.play(CUES.clear);
      s = clearAll(s);
    }
    if (api.input.pressed("back")) s = back(s);
    const count =
      s.screen === "title"
        ? 3
        : s.screen === "solved"
          ? s.mode === "cascade"
            ? 2
            : s.boardIndex < 23
              ? 3
              : 2
          : s.screen === "complete"
            ? 2
            : 0;
    if (api.input.pressed("up"))
      s =
        s.screen === "select"
          ? { ...s, selectIndex: (s.selectIndex + 18) % 24 }
          : count
            ? { ...s, menuIndex: (s.menuIndex + count - 1) % count }
            : s;
    if (api.input.pressed("down"))
      s =
        s.screen === "select"
          ? { ...s, selectIndex: (s.selectIndex + 6) % 24 }
          : count
            ? { ...s, menuIndex: (s.menuIndex + 1) % count }
            : s;
    if (s.screen === "select" && api.input.pressed("left"))
      s = {
        ...s,
        selectIndex:
          Math.floor(s.selectIndex / 6) * 6 + ((s.selectIndex + 5) % 6),
      };
    if (s.screen === "select" && api.input.pressed("right"))
      s = {
        ...s,
        selectIndex:
          Math.floor(s.selectIndex / 6) * 6 + ((s.selectIndex + 1) % 6),
      };
    if (api.input.pressed("confirm")) s = choose(s);
    const after = s.beams.reduce((n, b) => n + b.cells.length, 0);
    if (after > before) api.audio.play(CUES.connect);
    if (after < before && state.tracing) api.audio.play(CUES.retract);
    if (
      s.beams.some((beam) => {
        const previous = state.beams.find(
          (old) => old.channel === beam.channel,
        );
        return (
          complete(s.board, beam) &&
          (!previous || !complete(state.board, previous))
        );
      })
    )
      api.audio.play(CUES.channelComplete);
    if (state.screen === "playing" && s.screen !== "playing")
      api.audio.play(CUES.solved);
    return { ...s, muted: api.audio.muted() };
  },
  render(state: DeepReadonly<RefractState>, api: RenderApi) {
    draw(state, api.ctx);
  },
};
