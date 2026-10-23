import { Component, AfterViewInit, ElementRef, ViewChild, HostListener, OnDestroy } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

interface Ripple { x: number; y: number; r: number; a: number; }

@Component({
  selector: 'app-shortcut',
  templateUrl: './shortcut.component.html',
})
export class ShortcutComponent implements AfterViewInit, OnDestroy {
  @ViewChild('hoodieBox') hoodieBox!: ElementRef<HTMLElement>;
  @ViewChild('rippleCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  experiences = [
    { role: 'Software Developer', place: 'Al garhoud, Dubai', date: 'Dec 2025 - Present', sub: '' },
    { role: 'Front-End Developer', place: 'Chennai, India', date: 'JUL 2024 - SEP 2025', sub: '' },
    { role: 'Front-End Developer', place: 'Chennai, India', date: 'MAY 2023 - JUN 2024',
      sub: '(Angular, Beginner in C# and Database)' },
  ];

  private ripples: Ripple[] = [];
  private raf = 0;
  private lastSpawn = 0;
  private ctx!: CanvasRenderingContext2D;

  ngAfterViewInit() {
    const c = this.canvasRef.nativeElement;
    this.ctx = c.getContext('2d')!;
    this.resize();
    this.loop();
  }

  ngOnDestroy() { cancelAnimationFrame(this.raf); }

  @HostListener('window:resize') resize() {
    const c = this.canvasRef.nativeElement;
    c.width = window.innerWidth;
    c.height = window.innerHeight;
  }

  /* Whole page: ripple rings follow the cursor */
  @HostListener('document:mousemove', ['$event'])
  onMove(e: MouseEvent) {
    const now = performance.now();
    if (now - this.lastSpawn > 70) {
      this.ripples.push({ x: e.clientX, y: e.clientY, r: 4, a: 0.5 });
      this.lastSpawn = now;
    }
  }

  private loop = () => {
    const { width, height } = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, width, height);
    const dark = document.body.classList.contains('dark-theme');
    this.ripples = this.ripples.filter(r => r.a > 0.01);
    for (const r of this.ripples) {
      r.r += 1.8;
      r.a *= 0.955;
      this.ctx.beginPath();
      this.ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
      this.ctx.strokeStyle = dark ? `rgba(255,255,255,${r.a})` : `rgba(80,40,160,${r.a})`;
      this.ctx.lineWidth = 1.5;
      this.ctx.stroke();
    }
    this.raf = requestAnimationFrame(this.loop);
  };

  /* Ball button -> change theme + water wobble on hoodie image */
  changeTheme() {
    window.dispatchEvent(new CustomEvent('toggle-theme'));
    this.waterWobble();
  }

  /* ===== WATER WOBBLE (only hoodie image) ===== */
  private waterTl?: gsap.core.Timeline;

  private waterWobble() {
    const box = this.hoodieBox.nativeElement;
    const disp = document.getElementById('hoodieDisp');
    const turb = document.getElementById('hoodieTurb');
    if (!disp || !turb) return;

    const MAX_STRENGTH = 50;   // how much it distorts (try 30 - 100)
    const RISE_TIME    = 0.5;  // seconds to reach max wobble
    const SETTLE_TIME  = 1.8;  // seconds to calm down
    const WAVE_SIZE    = 0.01; // smaller = bigger waves (try 0.005 - 0.03)

    this.waterTl?.kill();
    const s = { v: 0 };
    const update = () => {
      disp.setAttribute('scale', String(s.v));
      const t = performance.now() / 400;
      turb.setAttribute('baseFrequency',
        `${WAVE_SIZE + Math.sin(t) * 0.003} ${WAVE_SIZE * 1.5 + Math.cos(t) * 0.003}`);
    };

    box.style.filter = 'url(#hoodieWater)';
    this.waterTl = gsap.timeline({ onComplete: () => { box.style.filter = ''; } })
      .to(s, { v: MAX_STRENGTH, duration: RISE_TIME, ease: 'power2.out', onUpdate: update })
      .to(s, { v: 0, duration: SETTLE_TIME, ease: 'elastic.out(1, 0.35)', onUpdate: update });
  }
}