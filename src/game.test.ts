import { createCanvas } from "@napi-rs/canvas";
import { ConstantClock, createEngine } from "@clockwyrks/simple-2d";
import { describe, expect, it } from "vitest";
import { cellX, cellY, game, isSolved, parseBoard } from "./game";

function makeEngine() {
  return createEngine({
    canvas: createCanvas(1280, 720) as unknown as HTMLCanvasElement,
    width: 1280,
    height: 720,
    game,
    clock: new ConstantClock(1000 / 60),
    surface: {
      cssWidth: () => 1280,
      cssHeight: () => 720,
      dpr: () => 1,
      events: () => new EventTarget(),
    },
  });
}

describe("Refract", () => {
  it("parses notation and centers grids", () => {
    const board = parseBoard(["T1", ".T"]);
    expect(board.nodes).toHaveLength(3);
    expect(cellX(0, 2)).toBe(592);
    expect(cellY(1, 2)).toBe(440);
    expect(() => parseBoard(["X"])).toThrow(/notation/);
  });

  it("initializes the complete debug surface", async () => {
    const e = makeEngine();
    await e.initialize();
    const snap = e.debug.snapshot(e.state);
    expect(snap).toMatchObject({
      version: 2,
      screen: "title",
      mode: "campaign",
    });
    expect(snap.targets.map((target) => target.id)).toEqual([
      "menu-0",
      "menu-1",
      "menu-2",
    ]);
    e.destroy();
  });

  it("draws and solves a simple posed board", async () => {
    const e = makeEngine();
    await e.initialize();
    e.apply((state) => e.debug.loadBoard(state, ["TT"]));
    e.apply((state) => e.debug.pointerDown(state, cellX(0, 2), cellY(0, 1)));
    e.apply((state) => e.debug.pointerMove(state, cellX(1, 2), cellY(0, 1)));
    const snap = e.debug.snapshot(e.state);
    expect(snap.solved).toBe(true);
    expect(snap.screen).toBe("solved");
    expect(isSolved(e.state.board, e.state.beams)).toBe(true);
    e.destroy();
  });

  it("generates every cascade tier", async () => {
    const e = makeEngine();
    await e.initialize();
    for (let tier = 1; tier <= 5; tier++) {
      e.apply((state) => e.debug.generateBoard(state, tier));
      expect(e.state.board.cols).toBeLessThanOrEqual(7);
      expect(e.state.board.rows).toBeLessThanOrEqual(6);
      expect(e.state.beams).toHaveLength(tier === 1 ? 1 : tier < 4 ? 2 : 3);
    }
    e.destroy();
  });
});
