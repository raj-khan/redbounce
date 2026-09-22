import { describe, expect, it } from "vitest";
import { GameApplication } from "../../../src/app/GameApplication";

function fake2dContext(): CanvasRenderingContext2D {
  return {
    fillStyle: "",
    font: "",
    textAlign: "left",
    fillRect: () => {},
    fillText: () => {},
  } as unknown as CanvasRenderingContext2D;
}

describe("GameApplication (scaffold)", () => {
  it("constructs and starts with canvas stubs", () => {
    const canvas = {
      width: 320,
      height: 180,
      getContext: () => fake2dContext(),
    } as unknown as HTMLCanvasElement;
    const uiRoot = { dataset: {} } as unknown as HTMLElement;
    const app = new GameApplication(canvas, uiRoot);
    app.start();
    expect(app.isRunning()).toBe(true);
    expect((uiRoot as { dataset: Record<string, string> }).dataset.booted).toBe("true");
    app.stop();
    expect(app.isRunning()).toBe(false);
  });
});
