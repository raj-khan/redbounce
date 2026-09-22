import { DEFAULT_KEY_BINDINGS, type InputAction } from "./InputAction";

/**
 * Keyboard adapter (spec section 22). Tracks held actions; key events are
 * translated through the binding map, never leaked raw to gameplay.
 */
export class KeyboardInput {
  private readonly target: EventTarget;
  private readonly bindings: Record<string, InputAction>;
  private readonly held = new Set<InputAction>();
  private readonly justPressed = new Set<InputAction>();
  private readonly onKeyDown = (event: Event) => {
    const action = this.bindings[(event as KeyboardEvent).code];
    if (!action) return;
    if (!this.held.has(action)) this.justPressed.add(action);
    this.held.add(action);
    (event as KeyboardEvent).preventDefault();
  };
  private readonly onKeyUp = (event: Event) => {
    const action = this.bindings[(event as KeyboardEvent).code];
    if (!action) return;
    this.held.delete(action);
  };
  private readonly onBlur = () => this.held.clear();

  constructor(
    target: EventTarget = globalThis,
    bindings: Record<string, InputAction> = DEFAULT_KEY_BINDINGS,
  ) {
    this.target = target;
    this.bindings = bindings;
    this.target.addEventListener("keydown", this.onKeyDown);
    this.target.addEventListener("keyup", this.onKeyUp);
    this.target.addEventListener("blur", this.onBlur);
  }

  isHeld(action: InputAction): boolean {
    return this.held.has(action);
  }

  consumeJustPressed(action: InputAction): boolean {
    return this.justPressed.delete(action);
  }

  dispose(): void {
    this.target.removeEventListener("keydown", this.onKeyDown);
    this.target.removeEventListener("keyup", this.onKeyUp);
    this.target.removeEventListener("blur", this.onBlur);
    this.held.clear();
    this.justPressed.clear();
  }
}
