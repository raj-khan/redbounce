import { describe, expect, it } from "vitest";
import { KeyboardInput } from "../../../src/input/KeyboardInput";
import { TouchInput, type TouchButtonElement } from "../../../src/input/TouchInput";
import { InputManager } from "../../../src/input/InputManager";

/** EventTarget double that can fire keyboard events. */
function keyEvent(type: "keydown" | "keyup", code: string): Event {
  const event = new Event(type);
  Object.defineProperty(event, "code", { value: code });
  return event;
}

class FakeWindow extends EventTarget {
  press(code: string): void {
    this.dispatchEvent(keyEvent("keydown", code));
  }
  release(code: string): void {
    this.dispatchEvent(keyEvent("keyup", code));
  }
  blurEvent(): void {
    this.dispatchEvent(new Event("blur"));
  }
}

/** Element double for touch buttons. */
class FakeButton extends EventTarget implements TouchButtonElement {
  readonly attrs = new Map<string, string>();
  getAttribute(name: string): string | null {
    return this.attrs.get(name) ?? null;
  }
  override addEventListener(type: string, listener: (event: Event) => void): void {
    super.addEventListener(type, listener as EventListener);
  }
}

function keydown(code: string): Event {
  return keyEvent("keydown", code);
}

// TouchInput accepts the minimal element surface.
type TouchCtor = new (buttons: TouchButtonElement[]) => TouchInput;
const TouchInputForTest = TouchInput as unknown as TouchCtor;

describe("KeyboardInput", () => {
  it("maps held keys to actions (arrows and WASD)", () => {
    const win = new FakeWindow();
    const keyboard = new KeyboardInput(win);
    win.press("ArrowLeft");
    expect(keyboard.isHeld("move-left")).toBe(true);
    win.release("ArrowLeft");
    win.press("KeyA");
    expect(keyboard.isHeld("move-left")).toBe(true);
    win.release("KeyA");
    win.press("KeyD");
    expect(keyboard.isHeld("move-right")).toBe(true);
    keyboard.dispose();
  });

  it("unmapped keys are ignored", () => {
    const win = new FakeWindow();
    const keyboard = new KeyboardInput(win);
    win.press("KeyZ");
    expect(keyboard.isHeld("move-left")).toBe(false);
    keyboard.dispose();
  });

  it("pressed edges fire exactly once", () => {
    const win = new FakeWindow();
    const keyboard = new KeyboardInput(win);
    win.press("KeyP");
    expect(keyboard.consumeJustPressed("pause")).toBe(true);
    expect(keyboard.consumeJustPressed("pause")).toBe(false); // consumed
    win.release("KeyP");
    win.press("KeyP");
    expect(keyboard.consumeJustPressed("pause")).toBe(true); // re-press
    keyboard.dispose();
  });

  it("holding does not re-fire the pressed edge", () => {
    const win = new FakeWindow();
    const keyboard = new KeyboardInput(win);
    win.press("Enter");
    expect(keyboard.consumeJustPressed("confirm")).toBe(true);
    win.press("Enter"); // OS repeat while held
    expect(keyboard.consumeJustPressed("confirm")).toBe(false);
    keyboard.dispose();
  });

  it("blur clears held keys", () => {
    const win = new FakeWindow();
    const keyboard = new KeyboardInput(win);
    win.press("ArrowRight");
    win.blurEvent();
    expect(keyboard.isHeld("move-right")).toBe(false);
    keyboard.dispose();
  });

  it("custom bindings are honored", () => {
    const win = new FakeWindow();
    const keyboard = new KeyboardInput(win, { KeyJ: "move-left" });
    win.press("KeyJ");
    expect(keyboard.isHeld("move-left")).toBe(true);
    keyboard.dispose();
  });

  it("keydown/keyup helpers produce real events", () => {
    const win = new FakeWindow();
    const keyboard = new KeyboardInput(win);
    const event = keydown("Space");
    expect((event as KeyboardEvent).code).toBe("Space");
    keyboard.dispose();
  });
});

describe("TouchInput", () => {
  function makeButton(action: string): FakeButton {
    const button = new FakeButton();
    button.attrs.set("data-action", action);
    return button;
  }

  it("pointer events hold and release actions", () => {
    const left = makeButton("move-left");
    const touch = new TouchInputForTest([left]);
    left.dispatchEvent(new Event("pointerdown"));
    expect(touch.isHeld("move-left")).toBe(true);
    left.dispatchEvent(new Event("pointerup"));
    expect(touch.isHeld("move-left")).toBe(false);
    touch.dispose();
  });

  it("pressed edges fire once per tap", () => {
    const pause = makeButton("pause");
    const touch = new TouchInputForTest([pause]);
    pause.dispatchEvent(new Event("pointerdown"));
    expect(touch.consumeJustPressed("pause")).toBe(true);
    expect(touch.consumeJustPressed("pause")).toBe(false);
    touch.dispose();
  });

  it("pointercancel releases the hold", () => {
    const right = makeButton("move-right");
    const touch = new TouchInputForTest([right]);
    right.dispatchEvent(new Event("pointerdown"));
    right.dispatchEvent(new Event("pointercancel"));
    expect(touch.isHeld("move-right")).toBe(false);
    touch.dispose();
  });

  it("buttons without data-action are ignored", () => {
    const plain = new FakeButton();
    const touch = new TouchInputForTest([plain]);
    expect(touch.isHeld("move-left")).toBe(false);
    touch.dispose();
  });
});

describe("InputManager", () => {
  it("merges keyboard and touch into snapshots", () => {
    const win = new FakeWindow();
    const left = new FakeButton();
    left.attrs.set("data-action", "move-left");
    const manager = new InputManager(new KeyboardInput(win), new TouchInputForTest([left]));

    win.press("ArrowRight");
    left.dispatchEvent(new Event("pointerdown"));
    const snap = manager.getSnapshot();
    expect(snap.left).toBe(true);
    expect(snap.right).toBe(true);

    left.dispatchEvent(new Event("pointerup"));
    win.release("ArrowRight");
    const snap2 = manager.getSnapshot();
    expect(snap2.left).toBe(false);
    expect(snap2.right).toBe(false);
    manager.dispose();
  });

  it("snapshots expose edge events once", () => {
    const win = new FakeWindow();
    const manager = new InputManager(new KeyboardInput(win));
    win.press("KeyR");
    const snap1 = manager.getSnapshot();
    expect(snap1.restartPressed).toBe(true);
    const snap2 = manager.getSnapshot();
    expect(snap2.restartPressed).toBe(false);
    manager.dispose();
  });

  it("keyboard-only manager works without touch", () => {
    const win = new FakeWindow();
    const manager = new InputManager(new KeyboardInput(win), null);
    win.press("KeyM");
    expect(manager.getSnapshot().mutePressed).toBe(true);
    manager.dispose();
  });
});
