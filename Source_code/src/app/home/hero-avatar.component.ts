import {
  Component, ElementRef, NgZone, OnDestroy, AfterViewInit, ViewChild
} from '@angular/core';

/** Pre-rendered frames: assets/avatar/f_<h>_<v>.webp  (7 horizontal x 5 vertical) */
const H_LEVELS = [-0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75];
const V_LEVELS = [-0.6, -0.3, 0, 0.3, 0.6];
const CENTER_H = 3, CENTER_V = 2;

/** Index of the frame to show for a continuous value. Hysteresis stops flicker at cell borders. */
export function quant(value: number, levels: number[], cur: number, hyst = 0.2): number {
  const step = levels[1] - levels[0];
  const f = (value - levels[0]) / step;                       // continuous index
  if (Math.abs(f - cur) <= 0.5 + hyst) return cur;            // still inside current cell (+margin)
  return Math.max(0, Math.min(levels.length - 1, Math.round(f)));
}

@Component({
  selector: 'app-hero-avatar',
  template: `
    <div class="avatar-stage" #stage>
      <div class="avatar-tilt" #tilt>
        <canvas #canvas width="640" height="743" role="img"
                aria-label="Nizar Ahamed wearing a TryNowCode hoodie"></canvas>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .avatar-stage {
      perspective: 900px;
      width: 100%;
      -webkit-mask-image: linear-gradient(to bottom, #000 82%, transparent 100%);
              mask-image: linear-gradient(to bottom, #000 82%, transparent 100%);
    }
    .avatar-tilt {
      width: 100%;
      aspect-ratio: 640 / 743;
      will-change: transform;
      filter: drop-shadow(0 18px 28px rgba(0, 0, 0, .35));
    }
    canvas { display: block; width: 100%; height: 100%; }
  `]
})
export class HeroAvatarComponent implements AfterViewInit, OnDestroy {
  @ViewChild('stage',  { static: true }) stage!: ElementRef<HTMLElement>;
  @ViewChild('tilt',   { static: true }) tilt!: ElementRef<HTMLElement>;
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;

  private readonly FADE_MS = 70;
  private readonly CAP_H = 0.75;   // max head turn (fraction of the real pose)
  private readonly CAP_V = 0.6;    // up/down capped lower: full "down" pose has sleepy eyes

  private ctx!: CanvasRenderingContext2D;
  private frames: (HTMLImageElement | null)[][] = H_LEVELS.map(() => V_LEVELS.map(() => null));

  private tx = 0; private ty = 0;          // target (cursor) -1..1
  private cx = 0; private cy = 0;          // smoothed
  private ci = CENTER_H; private cj = CENTER_V;       // frame being shown
  private fromImg: HTMLImageElement | null = null;
  private fadeStart = 0;
  private dirty = true;

  private raf = 0;
  private visible = true;
  private usingPointer = false;
  private reduceMotion = false;
  private observer?: IntersectionObserver;

  constructor(private zone: NgZone) {}

  ngAfterViewInit(): void {
    this.ctx = this.canvas.nativeElement.getContext('2d')!;
    this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = window.matchMedia('(pointer: fine)').matches;
    this.loadFrames(fine);

    this.zone.runOutsideAngular(() => {
      window.addEventListener('pointermove', this.onMove, { passive: true });
      document.addEventListener('mouseleave', this.onLeave);
      this.observer = new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; });
      this.observer.observe(this.stage.nativeElement);
      this.raf = requestAnimationFrame(this.loop);
    });
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.raf);
    window.removeEventListener('pointermove', this.onMove);
    document.removeEventListener('mouseleave', this.onLeave);
    this.observer?.disconnect();
  }

  /** Centre first, then the horizontal row, then the rest (rest only on mouse devices). */
  private loadFrames(allFrames: boolean): void {
    const order: [number, number][] = [];
    for (let i = 0; i < H_LEVELS.length; i++) order.push([i, CENTER_V]);
    if (allFrames) {
      for (let i = 0; i < H_LEVELS.length; i++)
        for (let j = 0; j < V_LEVELS.length; j++) if (j !== CENTER_V) order.push([i, j]);
    }
    const dist = (a: [number, number]) => Math.abs(a[0] - CENTER_H) + Math.abs(a[1] - CENTER_V);
    order.sort((a, b) => dist(a) - dist(b));
    order.forEach(([i, j]) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => { this.frames[i][j] = img; this.dirty = true; };
      img.src = `assets/avatar/f_${i}_${j}.webp`;
    });
  }

  private onMove = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return;                   // no hover cursor on touch
    this.usingPointer = true;
    const r = this.stage.nativeElement.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height * 0.3);         // head is in the upper part
    this.tx = this.clamp(dx / (window.innerWidth * 0.35));
    this.ty = this.clamp(dy / (window.innerHeight * 0.5));   // vertical less sensitive
  };

  private onLeave = () => { this.tx = 0; this.ty = 0; };

  private loop = (t: number) => {
    this.raf = requestAnimationFrame(this.loop);
    if (!this.visible) return;

    if (this.reduceMotion) { this.tx = 0; this.ty = 0; }
    else if (!this.usingPointer) { this.tx = Math.sin(t / 2200) * 0.6; this.ty = 0; }   // idle sway

    this.cx += (this.tx - this.cx) * 0.12;
    this.cy += (this.ty - this.cy) * 0.12;

    // pick the nearest pre-rendered frame
    let ni = quant(this.cx * this.CAP_H, H_LEVELS, this.ci);
    let nj = quant(this.cy * this.CAP_V, V_LEVELS, this.cj);
    if (!this.frames[ni][nj]) {                               // not loaded yet -> fall back
      nj = CENTER_V;
      if (!this.frames[ni][nj]) { ni = this.ci; nj = this.cj; }
    }
    if (ni !== this.ci || nj !== this.cj) {
      this.fromImg = this.frames[this.ci][this.cj];
      this.fadeStart = t;
      this.ci = ni; this.cj = nj;
      this.dirty = true;
    }

    // gentle extra tilt so motion between frames feels smooth
    this.tilt.nativeElement.style.transform =
      `translate3d(${this.cx * 5}px, ${this.cy * 3}px, 0) rotateY(${this.cx * 2}deg) rotateX(${-this.cy * 1.5}deg)`;

    if (this.dirty || this.fromImg) this.draw(t);
  };

  private draw(t: number): void {
    const to = this.frames[this.ci][this.cj];
    if (!to) return;
    const c = this.canvas.nativeElement;
    this.ctx.clearRect(0, 0, c.width, c.height);
    const a = this.fromImg ? Math.min(1, (t - this.fadeStart) / this.FADE_MS) : 1;
    if (this.fromImg && a < 1) {
      this.ctx.globalAlpha = 1;
      this.ctx.drawImage(this.fromImg, 0, 0, c.width, c.height);   // old frame stays solid underneath
      this.ctx.globalAlpha = a;
    } else {
      this.fromImg = null;
      this.ctx.globalAlpha = 1;
    }
    this.ctx.drawImage(to, 0, 0, c.width, c.height);
    this.ctx.globalAlpha = 1;
    this.dirty = false;
  }

  private clamp(v: number): number { return Math.max(-1, Math.min(1, v)); }
}
