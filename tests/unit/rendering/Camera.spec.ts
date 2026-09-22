import { describe, expect, it } from "vitest";
import { Camera } from "../../../src/rendering/Camera";

describe("Camera", () => {
  it("converts world to screen coordinates", () => {
    const cam = new Camera(320, 180);
    cam.snapTo(160, 90); // centered on (160,90) => topleft (0,0)
    expect(cam.worldToScreen(160, 90)).toEqual({ x: 160, y: 90 });
    expect(cam.worldToScreen(170, 100)).toEqual({ x: 170, y: 100 });
  });

  it("screenToWorld inverts worldToScreen", () => {
    const cam = new Camera(320, 180);
    cam.snapTo(100, 50);
    const w = cam.screenToWorld(10, 20);
    expect(w).toEqual({ x: cam.x + 10, y: cam.y + 20 });
  });

  it("clamps to level bounds", () => {
    const cam = new Camera(320, 180);
    cam.setBounds({ minX: 0, maxX: 2400, minY: 0, maxY: 720 });
    cam.snapTo(-500, -500);
    expect(cam.x).toBe(0);
    expect(cam.y).toBe(0);
    cam.snapTo(5000, 5000);
    expect(cam.x).toBe(2400 - 320);
    expect(cam.y).toBe(720 - 180);
  });

  it("handles bounds smaller than the viewport", () => {
    const cam = new Camera(320, 180);
    cam.setBounds({ minX: 0, maxX: 100, minY: 0, maxY: 50 });
    cam.snapTo(50, 25);
    expect(cam.x).toBe(0);
    expect(cam.y).toBe(0);
  });

  it("follow converges toward the target", () => {
    const cam = new Camera(320, 180);
    cam.setBounds({ minX: -1000, maxX: 1000, minY: -1000, maxY: 1000 });
    cam.snapTo(0, 0);
    for (let i = 0; i < 60; i++) {
      cam.follow(400, 100, 90, 1 / 60);
    }
    // Should be close to centering 400 (with look-ahead pushing right).
    expect(cam.x).toBeGreaterThan(200);
    expect(cam.x).toBeLessThan(460);
  });

  it("dead zone prevents micro-movement", () => {
    const cam = new Camera(320, 180);
    cam.setBounds({ minX: -1000, maxX: 1000, minY: -1000, maxY: 1000 });
    cam.snapTo(160, 90);
    const before = cam.x;
    cam.follow(170, 95, 0, 1 / 60); // small offset inside dead zone
    expect(cam.x).toBe(before);
  });

  it("look-ahead follows velocity direction", () => {
    const cam = new Camera(320, 180);
    cam.setBounds({ minX: -1000, maxX: 1000, minY: -1000, maxY: 1000 });
    const camRight = new Camera(320, 180);
    camRight.setBounds({ minX: -1000, maxX: 1000, minY: -1000, maxY: 1000 });
    cam.snapTo(160, 90);
    camRight.snapTo(160, 90);
    for (let i = 0; i < 120; i++) {
      cam.follow(200, 90, -90, 1 / 60);
      camRight.follow(200, 90, 90, 1 / 60);
    }
    expect(camRight.x).toBeGreaterThan(cam.x);
  });

  it("shake decays over time", () => {
    const cam = new Camera(320, 180);
    expect(cam.isShaking()).toBe(false);
    cam.shake(0.2, 4);
    expect(cam.isShaking()).toBe(true);
    const offset = cam.shakeOffset();
    expect(Math.abs(offset.x)).toBeLessThanOrEqual(4);
    cam.update(0.25);
    expect(cam.isShaking()).toBe(false);
    expect(cam.shakeOffset()).toEqual({ x: 0, y: 0 });
  });

  it("never mutates world data (pure transforms)", () => {
    const cam = new Camera(320, 180);
    cam.snapTo(10, 10);
    const worldPoint = { x: 5, y: 5 };
    cam.worldToScreen(worldPoint.x, worldPoint.y);
    expect(worldPoint).toEqual({ x: 5, y: 5 });
  });
});
