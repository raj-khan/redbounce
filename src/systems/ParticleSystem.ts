/**
 * Pooled particle system (spec sections 20 and 29).
 * Fixed-capacity ring buffer: no per-frame allocations, no growth.
 */
export type ParticleKind = "dust" | "sparkle" | "burst" | "boost" | "trail";

type Particle = {
  active: boolean;
  kind: ParticleKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
};

export const MAX_PARTICLES = 300;

export class ParticleSystem {
  private readonly pool: Particle[] = [];
  private cursor = 0;
  private aliveCount = 0;

  constructor(capacity: number = MAX_PARTICLES) {
    for (let i = 0; i < capacity; i++) {
      this.pool.push({
        active: false,
        kind: "dust",
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        life: 0,
        maxLife: 1,
        size: 1,
        color: "#fff",
      });
    }
  }

  /** Live particles (for rendering). */
  activeParticles(): readonly Particle[] {
    return this.pool.filter((p) => p.active);
  }

  count(): number {
    return this.aliveCount;
  }

  capacity(): number {
    return this.pool.length;
  }

  spawn(
    kind: ParticleKind,
    x: number,
    y: number,
    options: { vx?: number; vy?: number; life?: number; size?: number; color?: string } = {},
  ): void {
    // Ring allocation: reuse the oldest slot when full (bounded memory).
    let particle = this.pool.find((p) => !p.active);
    if (!particle) {
      particle = this.pool[this.cursor]!;
      this.cursor = (this.cursor + 1) % this.pool.length;
    }
    const wasActive = particle.active;
    particle.active = true;
    particle.kind = kind;
    particle.x = x;
    particle.y = y;
    particle.vx = options.vx ?? 0;
    particle.vy = options.vy ?? -20;
    particle.maxLife = options.life ?? 0.4;
    particle.life = particle.maxLife;
    particle.size = options.size ?? 2;
    particle.color = options.color ?? "#ffffff";
    if (!wasActive) this.aliveCount++;
  }

  /** Convenience emitters. */
  spawnBounceDust(x: number, y: number): void {
    for (let i = 0; i < 4; i++) {
      this.spawn("dust", x + (Math.random() - 0.5) * 8, y, {
        vx: (Math.random() - 0.5) * 50,
        vy: -Math.random() * 30,
        life: 0.3,
        size: 1.5,
        color: "rgba(255,255,255,0.7)",
      });
    }
  }

  spawnPickupSparkle(x: number, y: number, color: string): void {
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI / 4) * i;
      this.spawn("sparkle", x, y, {
        vx: Math.cos(angle) * 60,
        vy: Math.sin(angle) * 60,
        life: 0.35,
        size: 2,
        color,
      });
    }
  }

  spawnDeathBurst(x: number, y: number): void {
    for (let i = 0; i < 16; i++) {
      const angle = (Math.PI / 8) * i;
      const speed = 60 + Math.random() * 80;
      this.spawn("burst", x, y, {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 40,
        life: 0.6,
        size: 2.5,
        color: "#b13e53",
      });
    }
  }

  spawnBoost(x: number, y: number): void {
    for (let i = 0; i < 10; i++) {
      this.spawn("boost", x + (Math.random() - 0.5) * 10, y, {
        vx: (Math.random() - 0.5) * 20,
        vy: 80 + Math.random() * 60,
        life: 0.4,
        size: 2,
        color: "#5bc0eb",
      });
    }
  }

  spawnTrail(x: number, y: number, speed: number): void {
    if (speed < 80) return;
    this.spawn("trail", x, y, {
      vx: (Math.random() - 0.5) * 10,
      vy: 10,
      life: 0.25,
      size: 1.5,
      color: "rgba(239,125,87,0.6)",
    });
  }

  update(deltaSeconds: number): void {
    let alive = 0;
    for (const particle of this.pool) {
      if (!particle.active) continue;
      particle.life -= deltaSeconds;
      if (particle.life <= 0) {
        particle.active = false;
        continue;
      }
      particle.x += particle.vx * deltaSeconds;
      particle.y += particle.vy * deltaSeconds;
      // Light gravity on burst particles.
      if (particle.kind === "burst" || particle.kind === "boost") {
        particle.vy += 240 * deltaSeconds;
      }
      alive++;
    }
    this.aliveCount = alive;
  }

  clear(): void {
    for (const particle of this.pool) particle.active = false;
    this.aliveCount = 0;
    this.cursor = 0;
  }
}
