/**
 * Scene abstraction (spec section 39, GameScene interface).
 * Scenes own their enter/update/render/exit lifecycle.
 */
export interface GameScene {
  enter(): void | Promise<void>;
  update(deltaSeconds: number): void;
  render(alpha: number): void;
  exit(): void | Promise<void>;
}

export type SceneFactory = () => GameScene;
