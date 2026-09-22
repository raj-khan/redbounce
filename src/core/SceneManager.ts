import type { GameScene, SceneFactory } from "./Scene";

/**
 * Scene manager (spec sections 4 and 39).
 * Owns the active scene; switching runs exit on the old scene and
 * enter on the new one with proper cleanup.
 */
export class SceneManager {
  private readonly factories = new Map<string, SceneFactory>();
  private active: GameScene | null = null;
  private activeName: string | null = null;
  private switching = false;

  register(name: string, factory: SceneFactory): void {
    this.factories.set(name, factory);
  }

  has(name: string): boolean {
    return this.factories.has(name);
  }

  current(): GameScene | null {
    return this.active;
  }

  currentName(): string | null {
    return this.activeName;
  }

  isSwitching(): boolean {
    return this.switching;
  }

  async switchTo(name: string): Promise<void> {
    const factory = this.factories.get(name);
    if (!factory) throw new Error(`SceneManager: unknown scene "${name}"`);
    if (this.switching) throw new Error("SceneManager: scene switch already in progress");
    this.switching = true;
    try {
      if (this.active) {
        await this.active.exit();
      }
      const next = factory();
      await next.enter();
      this.active = next;
      this.activeName = name;
    } finally {
      this.switching = false;
    }
  }

  update(deltaSeconds: number): void {
    this.active?.update(deltaSeconds);
  }

  render(alpha: number): void {
    this.active?.render(alpha);
  }
}
