/**
 * Typed event bus (spec section 32).
 *
 * The bus is generic over an event map: `{ eventName: payload }`.
 * Handlers are invoked synchronously in subscription order so events are
 * processed predictably. `clear()` drops transient events between ticks.
 */
export type EventHandler<P> = (payload: P) => void;

export class EventBus<EventMap extends object> {
  private readonly handlers = new Map<keyof EventMap, Set<EventHandler<never>>>();
  private queue: { type: keyof EventMap; payload: unknown }[] = [];

  on<K extends keyof EventMap>(type: K, handler: EventHandler<EventMap[K]>): () => void {
    let set = this.handlers.get(type);
    if (!set) {
      set = new Set();
      this.handlers.set(type, set);
    }
    set.add(handler as EventHandler<never>);
    return () => this.off(type, handler);
  }

  off<K extends keyof EventMap>(type: K, handler: EventHandler<EventMap[K]>): void {
    this.handlers.get(type)?.delete(handler as EventHandler<never>);
  }

  /** Queue an event; delivered on the next drain (or immediately if drained). */
  emit<K extends keyof EventMap>(type: K, payload: EventMap[K]): void {
    this.queue.push({ type, payload });
  }

  /** Deliver all queued events in order. Called once per simulation tick. */
  drain(): void {
    const events = this.queue;
    this.queue = [];
    for (const event of events) {
      const set = this.handlers.get(event.type);
      if (!set) continue;
      for (const handler of [...set]) {
        (handler as (payload: unknown) => void)(event.payload);
      }
    }
  }

  /** Remove all queued events without delivering them (spec section 32). */
  clear(): void {
    this.queue.length = 0;
  }

  listenerCount(type: keyof EventMap): number {
    return this.handlers.get(type)?.size ?? 0;
  }
}
