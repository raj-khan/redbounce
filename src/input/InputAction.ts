/** Action-based input (spec section 22): decoupled from physical keys. */
export type InputAction =
  "move-left" | "move-right" | "pause" | "restart" | "confirm" | "back" | "mute" | "debug";

/** Default keyboard mapping (spec section 22). */
export const DEFAULT_KEY_BINDINGS: Record<string, InputAction> = {
  ArrowLeft: "move-left",
  KeyA: "move-left",
  ArrowRight: "move-right",
  KeyD: "move-right",
  Escape: "pause",
  KeyP: "pause",
  KeyR: "restart",
  Enter: "confirm",
  NumpadEnter: "confirm",
  Space: "confirm",
  Backspace: "back",
  KeyM: "mute",
  F3: "debug",
};
