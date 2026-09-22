/**
 * Input snapshot consumed by the gameplay loop (spec section 22).
 * Held states are levels; pressed states are edge events valid for one tick.
 */
export type InputSnapshot = {
  left: boolean;
  right: boolean;
  pausePressed: boolean;
  restartPressed: boolean;
  confirmPressed: boolean;
  backPressed: boolean;
  mutePressed: boolean;
  debugPressed: boolean;
};

export function emptySnapshot(): InputSnapshot {
  return {
    left: false,
    right: false,
    pausePressed: false,
    restartPressed: false,
    confirmPressed: false,
    backPressed: false,
    mutePressed: false,
    debugPressed: false,
  };
}
