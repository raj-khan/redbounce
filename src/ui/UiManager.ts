import type { SaveData } from "../save/SaveData";
import type { LevelResult } from "../levels/LevelResult";

export type LevelSelectEntry = {
  id: string;
  name: string;
  world: string;
  unlocked: boolean;
  result: LevelResult | null;
};

export type UiHandlers = {
  onStart(): void;
  onLevelPick(levelId: string): void;
  onResume(): void;
  onRestart(): void;
  onMainMenu(): void;
  onNextLevel(): void;
  onSettingsChanged(settings: SaveData["settings"]): void;
  onResetSave(): void;
};

/**
 * HTML overlay UI (spec sections 26 and 30).
 *
 * - Semantic HTML with native buttons for keyboard + screen reader access.
 * - Arrow-key navigation with visible focus (spec section 26).
 * - aria-live announcements for important status changes.
 * - UI components never touch gameplay internals; they emit commands.
 */
export class UiManager {
  private readonly root: HTMLElement;
  private readonly handlers: UiHandlers;
  private readonly liveRegion: HTMLElement;
  private settings: SaveData["settings"] | null = null;
  private deathTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(root: HTMLElement, handlers: UiHandlers) {
    this.root = root;
    this.handlers = handlers;
    this.liveRegion = document.createElement("div");
    this.liveRegion.setAttribute("aria-live", "polite");
    this.liveRegion.setAttribute("role", "status");
    this.liveRegion.className = "sr-only";
    root.appendChild(this.liveRegion);
  }

  announce(message: string): void {
    this.liveRegion.textContent = message;
  }

  hideAll(): void {
    this.root.querySelectorAll(".screen").forEach((element) => element.remove());
  }

  // -----------------------------------------------------------------------
  // Screens
  // -----------------------------------------------------------------------

  showMainMenu(save: SaveData): void {
    this.hideAll();
    const nextLevel = save.unlockedLevels.length > 1 ? "CONTINUE" : "START";
    const screen = this.screen(
      "main-menu",
      `
      <h1 class="title">REDBOUNCE</h1>
      <p class="subtitle">a bouncing adventure</p>
      <div class="menu" role="menu">
        <button class="menu-btn" data-action="start" role="menuitem">${nextLevel}</button>
        <button class="menu-btn" data-action="levels" role="menuitem">LEVEL SELECT</button>
        <button class="menu-btn" data-action="settings" role="menuitem">SETTINGS</button>
      </div>
    `,
    );
    this.onClick(screen, "[data-action=start]", () => this.handlers.onStart());
    this.onClick(screen, "[data-action=levels]", () => {
      // Level list is provided by the app when it shows the screen.
      this.handlers.onMainMenu();
      this.announce("Level select");
    });
    this.onClick(screen, "[data-action=settings]", () => {
      this.handlers.onSettingsChanged(this.settings ?? save.settings);
      this.showSettings(save);
    });
    // The app provides level entries through showLevelSelect; re-dispatch.
    const levelsBtn = screen.querySelector<HTMLElement>("[data-action=levels]");
    levelsBtn?.addEventListener("click", () => this.requestLevelSelect?.());
    this.focusFirst(screen);
  }

  private requestLevelSelect: (() => void) | null = null;
  onLevelSelectRequest(callback: () => void): void {
    this.requestLevelSelect = callback;
  }

  showLevelSelect(entries: LevelSelectEntry[], save: SaveData): void {
    this.hideAll();
    const items = entries
      .map((entry, index) => {
        const state = !entry.unlocked
          ? `<span class="lvl-state locked" aria-label="locked">&#128274;</span>`
          : entry.result
            ? `<span class="lvl-state done" aria-label="completed">&#10003;</span>`
            : "";
        return `<button class="menu-btn lvl" data-level="${entry.id}" role="menuitem"
          ${entry.unlocked ? "" : "disabled"}>
          <span class="lvl-num">${String(index + 1).padStart(2, "0")}</span>
          ${entry.name}
          ${state}
        </button>`;
      })
      .join("");
    const screen = this.screen(
      "level-select",
      `
      <h2 class="title small">LEVEL SELECT</h2>
      <div class="menu" role="menu">${items}</div>
      <div class="menu-row">
        <button class="menu-btn" data-action="back" role="menuitem">BACK</button>
      </div>
    `,
    );
    screen.querySelectorAll<HTMLElement>("[data-level]").forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.getAttribute("data-level");
        if (id) this.handlers.onLevelPick(id);
      });
    });
    this.onClick(screen, "[data-action=back]", () => this.showMainMenu(save));
    this.focusFirst(screen);
  }

  showSettings(save: SaveData): void {
    this.hideAll();
    this.settings = { ...save.settings };
    const s = save.settings;
    const screen = this.screen(
      "settings",
      `
      <h2 class="title small">SETTINGS</h2>
      <div class="settings" role="form">
        <label>MASTER VOLUME
          <input type="range" min="0" max="1" step="0.05" value="${s.masterVolume}"
                 data-setting="masterVolume" aria-label="Master volume">
        </label>
        <label>MUSIC VOLUME
          <input type="range" min="0" max="1" step="0.05" value="${s.musicVolume}"
                 data-setting="musicVolume" aria-label="Music volume">
        </label>
        <label>SFX VOLUME
          <input type="range" min="0" max="1" step="0.05" value="${s.sfxVolume}"
                 data-setting="sfxVolume" aria-label="Sound effects volume">
        </label>
        <label class="check"><input type="checkbox" data-setting="muted" ${s.muted ? "checked" : ""}> MUTE</label>
        <label class="check"><input type="checkbox" data-setting="reducedMotion" ${s.reducedMotion ? "checked" : ""}> REDUCED MOTION</label>
        <label class="check"><input type="checkbox" data-setting="touchControls" ${s.touchControls ? "checked" : ""}> TOUCH CONTROLS</label>
      </div>
      <div class="menu-row">
        <button class="menu-btn" data-action="back" role="menuitem">BACK</button>
        <button class="menu-btn danger" data-action="reset" role="menuitem">RESET SAVE</button>
      </div>
    `,
    );
    screen.querySelectorAll<HTMLInputElement>("[data-setting]").forEach((input) => {
      input.addEventListener("input", () => {
        const key = input.getAttribute("data-setting") as keyof SaveData["settings"];
        const value = input.type === "checkbox" ? input.checked : Number(input.value);
        this.settings = { ...this.settings!, [key]: value } as SaveData["settings"];
        this.handlers.onSettingsChanged(this.settings);
      });
    });
    this.onClick(screen, "[data-action=back]", () => this.showMainMenu(save));
    const resetBtn = screen.querySelector<HTMLElement>("[data-action=reset]");
    resetBtn?.addEventListener("click", () => {
      if (resetBtn.dataset.confirmed === "true") {
        this.handlers.onResetSave();
        resetBtn.textContent = "SAVE CLEARED";
      } else {
        resetBtn.dataset.confirmed = "true";
        resetBtn.textContent = "CONFIRM RESET?";
        this.announce("Reset save: press again to confirm");
      }
    });
    this.focusFirst(screen);
  }

  showPause(): void {
    this.hideAll();
    const screen = this.screen(
      "pause",
      `
      <h2 class="title small">PAUSED</h2>
      <div class="menu" role="menu">
        <button class="menu-btn" data-action="resume" role="menuitem">RESUME</button>
        <button class="menu-btn" data-action="restart" role="menuitem">RESTART</button>
        <button class="menu-btn" data-action="menu" role="menuitem">MAIN MENU</button>
      </div>
    `,
    );
    this.onClick(screen, "[data-action=resume]", () => this.handlers.onResume());
    this.onClick(screen, "[data-action=restart]", () => this.handlers.onRestart());
    this.onClick(screen, "[data-action=menu]", () => this.handlers.onMainMenu());
    this.announce("Game paused");
    this.focusFirst(screen);
  }

  showDeath(): void {
    const existing = this.root.querySelector(".death-flash");
    existing?.remove();
    const flash = document.createElement("div");
    flash.className = "screen death-flash";
    flash.innerHTML = `<p class="death-text">OUCH!</p>`;
    this.root.appendChild(flash);
    this.announce("Player died");
    if (this.deathTimer) clearTimeout(this.deathTimer);
    this.deathTimer = setTimeout(() => flash.remove(), 700);
  }

  showCompletion(result: LevelResult, hasNext: boolean): void {
    this.hideAll();
    const objectives = result.objectives.length
      ? `<p class="objectives">${result.objectives.join(" &middot; ")}</p>`
      : "";
    const screen = this.screen(
      "completion",
      `
      <h2 class="title small">LEVEL COMPLETE</h2>
      <div class="results" aria-label="Level results">
        <p>SCORE <strong>${result.score}</strong></p>
        <p>RINGS <strong>${result.collectiblesFound}/${result.collectiblesTotal}</strong></p>
        <p>DEATHS <strong>${result.deaths}</strong></p>
        <p>TIME <strong>${result.completionTimeSeconds.toFixed(1)}s</strong></p>
        ${objectives}
      </div>
      <p class="auto-hint">${
        hasNext ? "next level starts automatically&hellip;" : "all levels complete!"
      }</p>
      <div class="menu" role="menu">
        ${hasNext ? `<button class="menu-btn" data-action="next" role="menuitem">NEXT LEVEL</button>` : ""}
        <button class="menu-btn" data-action="replay" role="menuitem">REPLAY</button>
        <button class="menu-btn" data-action="levels" role="menuitem">LEVEL SELECT</button>
      </div>
    `,
    );
    this.onClick(screen, "[data-action=next]", () => this.handlers.onNextLevel());
    this.onClick(screen, "[data-action=replay]", () => this.handlers.onRestart());
    this.onClick(screen, "[data-action=levels]", () => this.requestLevelSelect?.());
    this.announce(
      hasNext
        ? `Level complete. Score ${result.score}. Next level starting.`
        : `Level complete. Score ${result.score}. All levels complete!`,
    );
    this.focusFirst(screen);
  }

  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------

  private screen(className: string, html: string): HTMLElement {
    const screen = document.createElement("div");
    screen.className = `screen ${className}`;
    screen.innerHTML = html;
    this.root.appendChild(screen);
    this.wireArrowNavigation(screen);
    return screen;
  }

  private onClick(screen: HTMLElement, selector: string, handler: () => void): void {
    screen.querySelector<HTMLElement>(selector)?.addEventListener("click", handler);
  }

  private focusFirst(screen: HTMLElement): void {
    (screen.querySelector<HTMLElement>(".menu-btn") ?? screen)?.focus();
  }

  /** Arrow-key navigation across menu items (spec section 26). */
  private wireArrowNavigation(screen: HTMLElement): void {
    screen.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      const buttons = [...screen.querySelectorAll<HTMLElement>(".menu-btn:not([disabled])")];
      if (buttons.length === 0) return;
      const index = buttons.indexOf(document.activeElement as HTMLElement);
      const delta = event.key === "ArrowDown" ? 1 : -1;
      const nextIndex = index < 0 ? 0 : (index + delta + buttons.length) % buttons.length;
      buttons[nextIndex]?.focus();
      event.preventDefault();
    });
  }
}
