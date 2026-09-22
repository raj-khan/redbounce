import { describe, expect, it } from "vitest";
import { circleRectContact } from "../../../src/physics/CollisionResolver";

describe("circleRectContact", () => {
  const rect = { x: 0, y: 0, width: 20, height: 20 };

  it("returns null when apart", () => {
    expect(circleRectContact(30, 10, 5, rect)).toBeNull();
  });

  it("landing from above pushes up", () => {
    const contact = circleRectContact(10, -3, 5, rect);
    expect(contact).not.toBeNull();
    expect(contact!.ny).toBeLessThan(-0.9);
    expect(contact!.depth).toBeCloseTo(2, 5);
  });

  it("side contact pushes horizontally", () => {
    const contact = circleRectContact(23, 10, 5, rect);
    expect(contact).not.toBeNull();
    expect(contact!.nx).toBeGreaterThan(0.9);
    expect(contact!.nx * 23 + 0).toBeGreaterThan(0);
  });

  it("corner contact gives diagonal normal", () => {
    const contact = circleRectContact(23, 23, 5, rect);
    expect(contact).not.toBeNull();
    expect(contact!.nx).toBeGreaterThan(0);
    expect(contact!.ny).toBeGreaterThan(0);
  });

  it("center inside rect pushes along least penetration", () => {
    const contact = circleRectContact(2, 10, 5, rect);
    expect(contact).not.toBeNull();
    expect(contact!.nx).toBe(-1);
    expect(contact!.depth).toBe(7); // radius + distance to left edge
  });

  it("touching exactly is a contact", () => {
    const contact = circleRectContact(10, -5, 5, rect);
    expect(contact).not.toBeNull();
    expect(contact!.depth).toBeCloseTo(0, 6);
  });
});
