/** Development-only debug configuration (spec section 33). */
export type DebugConfig = {
  /** Master switch; production builds never enable it. */
  enabled: boolean;
};

export function createDebugConfig(): DebugConfig {
  // Disabled by default everywhere; F3 toggles at runtime in dev builds only.
  return { enabled: false };
}

export function isDevBuild(): boolean {
  return import.meta.env.DEV ?? false;
}
