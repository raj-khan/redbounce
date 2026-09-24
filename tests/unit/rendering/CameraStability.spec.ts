import { describe, expect, it } from "vitest";
import { Camera } from "../../../src/rendering/Camera";

const DT = 1 / 60;

describe("Camera.followStable (bounces must not move the world)", () => {
  it("keeps the camera perfectly still during a full bounce arc", () => {
    const cam = new Camera(320, 180);
    cam.setBounds({ minX: -2000, maxX: 2000, minY: -2000, maxY: 2000 });
    cam.snapTo(400, 500); // ground line at y=500

    const yBefore = cam.y;
    // Ball bounces ~83px above the ground line every ~1s.
    for (let t = 0; t < 3; t++) {
      for (let step = 0; step < 60; step++) {
        const arc = Math.sin((step / 60) * Math.PI) * 83;
        const ballY = 500 - arc;
        cam.followStable(400 + t * 30, ballY, 500, 120, DT);
      }
    }
    expect(cam.y).toBe(yBefore); // world never bobs
  });

  it("retargets smoothly when landing on a higher platform", () => {
    const cam = new Camera(320, 180);
    cam.setBounds({ minX: -2000, maxX: 2000, minY: -2000, maxY: 2000 });
    cam.snapTo(400, 500);

    // Player climbs: new ground line at 440.
    for (let i = 0; i < 240; i++) {
      cam.followStable(460, 433, 440, 0, DT);
    }
    // Camera centers the new ground line: 440 - 90 = 350.
    expect(cam.y).toBeCloseTo(350, 0);
  });

  it("chases the player when falling far below the ground line (pits)", () => {
    const cam = new Camera(320, 180);
    cam.setBounds({ minX: -2000, maxX: 2000, minY: -2000, maxY: 2000 });
    cam.snapTo(400, 500);

    // Player falls 400px below the last ground contact.
    for (let i = 0; i < 600; i++) {
      cam.followStable(400, 900, 500, 0, DT);
    }
    expect(cam.y).toBeGreaterThan(500 - 90 - 40);
  });

  it("small ground-level differences below the threshold do not move the camera", () => {
    const cam = new Camera(320, 180);
    cam.setBounds({ minX: -2000, maxX: 2000, minY: -2000, maxY: 2000 });
    cam.snapTo(400, 500);
    const yBefore = cam.y;
    for (let i = 0; i < 120; i++) {
      cam.followStable(400, 495, 505, 0, DT); // 5px difference < threshold 20
    }
    expect(cam.y).toBe(yBefore);
  });

  it("horizontal follow still tracks the player", () => {
    const cam = new Camera(320, 180);
    cam.setBounds({ minX: -2000, maxX: 2000, minY: -2000, maxY: 2000 });
    cam.snapTo(400, 500);
    for (let i = 0; i < 300; i++) {
      cam.followStable(1200, 493, 500, 120, DT);
    }
    expect(cam.x).toBeGreaterThan(400);
  });
});
