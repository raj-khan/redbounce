import { KeyboardInput } from "./KeyboardInput";
import { TouchInput } from "./TouchInput";
import type { InputAction } from "./InputAction";
import { emptySnapshot, type InputSnapshot } from "./InputSnapshot";

/**
 * Input facade (spec section 22): merges keyboard and touch adapters into
 * the single snapshot the gameplay loop consumes. Raw DOM events never
 * reach the simulation.
 */
export class InputManager {
  private readonly keyboard: KeyboardInput;
  private readonly touch: TouchInput | null;
  private touchEnabled = false;

  constructor(keyboard: KeyboardInput, touch: TouchInput | null = null) {
    this.keyboard = keyboard;
    this.touch = touch;
  }

  /** Create for browser use; shows touch buttons on coarse pointers. */
  static createForBrowser(root: ParentNode = document): InputManager {
    const keyboard = new KeyboardInput(globalThis);
    const touchRoot = root.querySelector?.("#touch-controls") ?? null;
    let touch: TouchInput | null = null;
    const coarse = typeof matchMedia === "function" && matchMedia("(pointer: coarse)").matches;
    if (touchRoot) {
      if (coarse) touchRoot.removeAttribute("hidden");
      else touchRoot.setAttribute("hidden", "");
      touch = new TouchInput(touchRoot.children);
    }
    const manager = new InputManager(keyboard, touch);
    manager.touchEnabled = coarse;
    return manager;
  }

  setTouchEnabled(enabled: boolean): void {
    this.touchEnabled = enabled;
    const controls = document.getElementById("touch-controls");
    if (controls) controls.hidden = !enabled;
  }

  isTouchEnabled(): boolean {
    return this.touchEnabled;
  }

  /** Build the snapshot for this tick; pressed edges are consumed here. */
  getSnapshot(): InputSnapshot {
    const snap = emptySnapshot();
    snap.left = this.held("move-left");
    snap.right = this.held("move-right");
    snap.pausePressed = this.pressed("pause");
    snap.restartPressed = this.pressed("restart");
    snap.confirmPressed = this.pressed("confirm");
    snap.backPressed = this.pressed("back");
    snap.mutePressed = this.pressed("mute");
    snap.debugPressed = this.pressed("debug");
    return snap;
  }

  private held(action: InputAction): boolean {
    return this.keyboard.isHeld(action) || (this.touch?.isHeld(action) ?? false);
  }

  private pressed(action: InputAction): boolean {
    return (
      this.keyboard.consumeJustPressed(action) || (this.touch?.consumeJustPressed(action) ?? false)
    );
  }

  dispose(): void {
    this.keyboard.dispose();
    this.touch?.dispose();
  }
}
