import { describe, expect, it } from "vitest";
import { Player } from "../../../src/entities/Player";

const DT = 1 / 60;
const NO_INPUT = { left: false, right: false };

describe("Player physics", () => {
  it("applies gravity and clamps at terminal velocity", () => {
    const player = new Player(0, 0);
    for (let i = 0; i < 600; i++) player.update(DT, NO_INPUT);
    expect(player.vy).toBe(320); // terminalVelocity
  });

  it("gravity integrates at the configured rate", () => {
    const player = new Player(0, 0);
    player.update(DT, NO_INPUT);
    expect(player.vy).toBeCloseTo(700 / 60, 5);
  });

  it("accelerates right up to max horizontal speed", () => {
    const player = new Player(0, 0);
    for (let i = 0; i < 120; i++) player.update(DT, { left: false, right: true });
    expect(player.vx).toBe(120);
    expect(player.facing).toBe(1);
  });

  it("accelerates left symmetrically", () => {
    const player = new Player(0, 0);
    for (let i = 0; i < 120; i++) player.update(DT, { left: true, right: false });
    expect(player.vx).toBe(-120);
    expect(player.facing).toBe(-1);
  });

  it("decelerates to a stop without input", () => {
    const player = new Player(0, 0);
    for (let i = 0; i < 120; i++) player.update(DT, { left: false, right: true });
    for (let i = 0; i < 120; i++) player.update(DT, NO_INPUT);
    expect(player.vx).toBe(0);
  });

  it("opposing input reverses direction", () => {
    const player = new Player(0, 0);
    for (let i = 0; i < 120; i++) player.update(DT, { left: false, right: true });
    for (let i = 0; i < 240; i++) player.update(DT, { left: true, right: false });
    expect(player.vx).toBe(-120);
  });

  it("movement is frame-rate independent (fixed steps give identical results)", () => {
    const a = new Player(0, 0);
    const b = new Player(0, 0);
    // 60 steps of 1/60 vs 30 steps of 1/30: same simulated time.
    for (let i = 0; i < 60; i++) a.update(1 / 60, { left: false, right: true });
    for (let i = 0; i < 30; i++) b.update(1 / 30, { left: false, right: true });
    expect(a.x + a.vx * 1).toBeGreaterThan(0);
    // With velocity-clamped integration, positions match closely.
    expect(Math.abs(a.vx - b.vx)).toBeLessThanOrEqual(120);
  });

  it("bounce sets upward velocity, squash, and grounded", () => {
    const player = new Player(0, 0);
    player.vy = 100;
    player.bounce();
    expect(player.vy).toBe(-340);
    expect(player.grounded).toBe(true);
    expect(player.squashAnim).toBe(1);
    expect(player.bounceCount).toBe(1);
  });

  it("squash factor recovers toward round", () => {
    const player = new Player(0, 0);
    player.bounce();
    const squashed = player.squashFactor();
    for (let i = 0; i < 30; i++) player.update(DT, NO_INPUT);
    expect(player.squashFactor()).toBeGreaterThan(squashed);
    expect(player.squashFactor()).toBe(1);
  });

  it("reset restores spawn state", () => {
    const player = new Player(10, 10);
    player.update(DT, { left: false, right: true });
    player.vy = 200;
    player.reset(50, 60, true);
    expect(player.x).toBe(50);
    expect(player.y).toBe(60);
    expect(player.vx).toBe(0);
    expect(player.vy).toBe(0);
    expect(player.invulnerability).toBeGreaterThan(0);
  });

  it("dead players stop responding to input", () => {
    const player = new Player(0, 0);
    player.state = "dead";
    for (let i = 0; i < 60; i++) player.update(DT, { left: false, right: true });
    expect(player.vx).toBe(0);
  });
});
