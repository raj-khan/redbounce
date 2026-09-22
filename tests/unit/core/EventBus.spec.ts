import { describe, expect, it, vi } from "vitest";
import { EventBus } from "../../../src/core/EventBus";

interface TestEvents {
  ping: { value: number };
  pong: string;
}

describe("EventBus", () => {
  it("delivers events to subscribers in order", () => {
    const bus = new EventBus<TestEvents>();
    const calls: string[] = [];
    bus.on("ping", () => calls.push("first"));
    bus.on("ping", () => calls.push("second"));
    bus.emit("ping", { value: 1 });
    bus.drain();
    expect(calls).toEqual(["first", "second"]);
  });

  it("passes typed payloads", () => {
    const bus = new EventBus<TestEvents>();
    const handler = vi.fn();
    bus.on("ping", handler);
    bus.emit("ping", { value: 42 });
    bus.drain();
    expect(handler).toHaveBeenCalledWith({ value: 42 });
  });

  it("unsubscribes via the returned disposer", () => {
    const bus = new EventBus<TestEvents>();
    const handler = vi.fn();
    const off = bus.on("ping", handler);
    off();
    bus.emit("ping", { value: 1 });
    bus.drain();
    expect(handler).not.toHaveBeenCalled();
    expect(bus.listenerCount("ping")).toBe(0);
  });

  it("off removes a specific handler", () => {
    const bus = new EventBus<TestEvents>();
    const a = vi.fn();
    const b = vi.fn();
    bus.on("pong", a);
    bus.on("pong", b);
    bus.off("pong", a);
    bus.emit("pong", "x");
    bus.drain();
    expect(a).not.toHaveBeenCalled();
    expect(b).toHaveBeenCalledWith("x");
  });

  it("clear drops queued events", () => {
    const bus = new EventBus<TestEvents>();
    const handler = vi.fn();
    bus.on("ping", handler);
    bus.emit("ping", { value: 1 });
    bus.clear();
    bus.drain();
    expect(handler).not.toHaveBeenCalled();
  });

  it("drain is safe to call with empty queue", () => {
    const bus = new EventBus<TestEvents>();
    expect(() => bus.drain()).not.toThrow();
  });

  it("events emitted during drain are delivered on the next drain", () => {
    const bus = new EventBus<TestEvents>();
    const calls: number[] = [];
    bus.on("ping", (p) => {
      calls.push(p.value);
      if (p.value === 1) bus.emit("ping", { value: 2 });
    });
    bus.emit("ping", { value: 1 });
    bus.drain();
    expect(calls).toEqual([1]);
    bus.drain();
    expect(calls).toEqual([1, 2]);
  });
});
