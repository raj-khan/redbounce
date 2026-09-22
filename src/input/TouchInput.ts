import type { InputAction } from "./InputAction";

/** Minimal DOM surface TouchInput needs; keeps it testable. */
export type TouchButtonElement = {
  getAttribute(name: string): string | null;
  addEventListener(type: string, listener: (event: Event) => void): void;
  removeEventListener(type: string, listener: (event: Event) => void): void;
};

/**
 * Touch adapter (spec section 22): large virtual buttons with safe-area
 * insets (handled in CSS). Buttons are plain DOM elements carrying a
 * data-action attribute; gameplay still consumes snapshots only.
 */
export class TouchInput {
  private readonly held = new Set<InputAction>();
  private readonly justPressed = new Set<InputAction>();
  private readonly boundButtons: {
    element: TouchButtonElement;
    start: (event: Event) => void;
    end: (event: Event) => void;
  }[] = [];

  constructor(buttons: TouchButtonElement[] | HTMLCollectionOf<Element>) {
    for (const element of buttons) {
      const action = element.getAttribute("data-action") as InputAction | null;
      if (!action) continue;
      const start = (event: Event) => {
        event.preventDefault();
        if (!this.held.has(action)) this.justPressed.add(action);
        this.held.add(action);
      };
      const end = (event: Event) => {
        event.preventDefault();
        this.held.delete(action);
      };
      element.addEventListener("pointerdown", start);
      element.addEventListener("pointerup", end);
      element.addEventListener("pointercancel", end);
      element.addEventListener("pointerleave", end);
      this.boundButtons.push({ element, start, end });
    }
  }

  isHeld(action: InputAction): boolean {
    return this.held.has(action);
  }

  consumeJustPressed(action: InputAction): boolean {
    return this.justPressed.delete(action);
  }

  dispose(): void {
    for (const { element, start, end } of this.boundButtons) {
      element.removeEventListener("pointerdown", start);
      element.removeEventListener("pointerup", end);
      element.removeEventListener("pointercancel", end);
      element.removeEventListener("pointerleave", end);
    }
    this.boundButtons.length = 0;
    this.held.clear();
    this.justPressed.clear();
  }
}
