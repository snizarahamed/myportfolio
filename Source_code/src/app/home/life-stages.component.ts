import { Component, ElementRef, NgZone, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';

interface Stage {
  enabled: boolean;
  src: string; label: string; text: string;
  x: number; w: number; h: number;   // position inside the original lineup image (px)
  amp: number; dur: number;          // idle bounce: height in px, seconds per step
}

@Component({
  selector: 'app-life-stages',
  template: `
    <div class="text-center mb-4">
      <h1 class="new_amsterdam_custom_font mb-0">MY JOURNEY</h1>
    </div><br><br>

    <div class="row align-items-center g-4 g-lg-5 border rounded glass p-2 pb-3 " (pointerleave)="leave($event)">

      <!-- LEFT: life stages -->
      <div class="col-lg-6">
        <div class="stage-wrap">
          <div class="stage" #stage [class.in]="inView" [class.has-active]="active >= 0"
               [style.aspect-ratio]="W + ' / ' + H">
            <div class="ground"></div>

            <button type="button" class="fig" *ngFor="let s of visible; let i = index"
                    [class.active]="active === i"
                    [style.left.%]="(s.x - X0) / W * 100"
                    [style.width.%]="s.w / W * 100"
                    [style.--i]="i" [style.--amp]="s.amp + 'px'" [style.--dur]="s.dur + 's'"
                    [attr.aria-label]="s.label"
                    (pointerdown)="lastType = $event.pointerType"
                    (pointerenter)="enter($event, i)"
                    (focus)="active = i"
                    (click)="click(i)">
              <span class="shadow"></span>
              <span class="walk"><span class="bob">
                <img [src]="s.src" [alt]="s.label" draggable="false" decoding="async">
              </span></span>
              <span class="tip">{{ s.label }}</span>
            </button>
          </div>
        </div>
        <p class="hint text-center mb-0">
          <span class="h-mouse">Hover over a stage to read its story</span>
          <span class="h-touch">Tap a stage to read its story</span>
        </p>
      </div>

      <!-- RIGHT: story -->
      <div class="col-lg-6 ">
        <div class="panel" aria-live="polite">

          <!-- default story: edit the text, keep the three <img class="sticker"> where you want the GIFs -->
          <div class="slide" [class.show]="active < 0">
            <p class="intro">
              I started as a
              <img class="sticker" src="assets/journey/walking.jpg" alt="" aria-hidden="true">
              small boy with a toy car and a lot of curiosity. School and college taught me how to learn,
              while cricket and
              <img class="sticker" src="assets/journey/football.gif" alt="" aria-hidden="true">
              football taught me how to lose and try again. Then code arrived, first as a trainee fixing bugs,
              now building Angular apps. And today I'm a
              <img class="sticker" src="assets/journey/father.gif" alt="" aria-hidden="true">
              father, so every next chapter matters more.
            </p>
          </div>

          <!-- one story per stage (shown on hover / tap) -->
          <div class="slide" *ngFor="let s of visible; let i = index" [class.show]="active === i">
            <span class="idx">{{ i + 1 < 10 ? '0' + (i + 1) : i + 1 }} / {{ visible.length < 10 ? '0' + visible.length : visible.length }}</span>
            <h3 class="stage-title new_amsterdam_custom_font">{{ s.label }}</h3>
            <p class="story">{{ s.text }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .caption { opacity: .65; letter-spacing: .08em; text-transform: uppercase; font-size: 12px; }

    /* ---------- left: stage ---------- */
    .stage-wrap { max-width: 760px; margin: 0 auto; padding: 40px 6px 0; }
    .stage { position: relative; width: 100%; }
    .ground {
      position: absolute; left: 0; right: 0; bottom: 0; height: 1px;
      background: linear-gradient(90deg, transparent, rgba(128,128,128,.55) 10%, rgba(128,128,128,.55) 90%, transparent);
    }
    .fig {
      position: absolute; bottom: 0; padding: 0; border: 0; background: none; cursor: pointer;
      transform-origin: 50% 100%;
      transition: transform .25s ease, opacity .3s ease, filter .3s ease;
      -webkit-tap-highlight-color: transparent;
    }
    .fig:hover, .fig:focus-visible, .fig.active { transform: scale(1.05); z-index: 3; outline: none; }
    .has-active .fig:not(.active) { opacity: .45; filter: saturate(.6); }

    .shadow {
      position: absolute; left: 12%; right: 12%; bottom: -5px; height: 10px; border-radius: 50%;
      background: rgba(0,0,0,.4); filter: blur(5px);
      opacity: 0; transition: opacity .7s ease; transition-delay: calc(var(--i) * .18s + .3s);
    }
    .in .shadow { opacity: 1; }

    .walk {
      display: block; opacity: 0; transform: translateX(-90px);
      transition: opacity .7s ease, transform .9s cubic-bezier(.2,.8,.2,1);
      transition-delay: calc(var(--i) * .18s);
    }
    .in .walk { opacity: 1; transform: none; }

    .bob {
      display: block; will-change: transform;
      animation: bob var(--dur, 1.2s) ease-in-out infinite;
      animation-delay: calc(var(--i) * -0.27s);
      animation-play-state: paused;
    }
    .in .bob { animation-play-state: running; }
    @keyframes bob {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50%      { transform: translateY(calc(var(--amp, 4px) * -1)) rotate(.7deg); }
    }

    .fig img { display: block; width: 100%; height: auto; user-select: none; -webkit-user-drag: none;
               filter: drop-shadow(0 8px 10px rgba(0,0,0,.22)); }

    .tip {
      position: absolute; left: 50%; top: -8px; transform: translate(-50%, 6px);
      white-space: nowrap; pointer-events: none; opacity: 0;
      padding: 3px 9px; border-radius: 999px; font-size: 12px; line-height: 1.3;
      background: rgba(20,20,20,.88); color: #fff; border: 1px solid rgba(255,255,255,.18);
      transition: opacity .2s ease, transform .2s ease;
    }
    .fig:hover .tip, .fig:focus-visible .tip, .fig.active .tip { opacity: 1; transform: translate(-50%, -4px); }

    .hint { margin-top: 18px; font-size: 12px; opacity: .55; letter-spacing: .03em; }
    .h-touch { display: none; }
    @media (hover: none) { .h-mouse { display: none; } .h-touch { display: inline; } }

    /* ---------- right: story ---------- */
    .panel { display: grid; padding: 4px 0; }
    @media (min-width: 992px) { .panel { padding-left: 1.5rem; } }

    .slide {
      grid-area: 1 / 1; opacity: 0; visibility: hidden; transform: translateY(8px);
      transition: opacity .35s ease, transform .35s ease, visibility 0s linear .35s;
    }
    .slide.show { opacity: 1; visibility: visible; transform: none; transition-delay: 0s; }

    .intro { font-size: clamp(1.05rem, 1.1vw + .7rem, 1.35rem); line-height: 1.75; margin: 0; }
    .sticker { height: 2.3em; width: auto; vertical-align: -.7em; margin: 0 .1em; }

    .idx { display: block; font-size: 12px; letter-spacing: .12em; opacity: .55; margin-bottom: 2px; }
    .stage-title { font-size: 2rem; margin: 0 0 .4rem; line-height: 1.1; }
    .story { font-size: clamp(1rem, .9vw + .7rem, 1.2rem); line-height: 1.7; margin: 0; }

    @media (prefers-reduced-motion: reduce) {
      .walk { transition: opacity .3s; transform: none; transition-delay: 0s; }
      .bob { animation: none; }
      .shadow { transition-delay: 0s; }
      .slide { transition: opacity .2s; transform: none; }
    }
  `]
})
export class LifeStagesComponent implements AfterViewInit, OnDestroy {
  @ViewChild('stage', { static: true }) stageEl!: ElementRef<HTMLElement>;

  inView = false;
  active = -1;          // -1 = default story
  lastType = 'mouse';
  private observer?: IntersectionObserver;
  private resetTimer: any;

  /* ================= EDIT HERE =================
     text  = the 3-4 line story shown on the right when this stage is hovered / tapped.
     enabled: false hides a stage (the lineup re-centres automatically).                       */
  private all: Stage[] = [
    { enabled: true, src: 'assets/life/fig0.webp', label: 'Toy cars', x: 43, w: 134, h: 323, amp: 3, dur: 0.9,
      text: 'Everything began with a small toy car and a lot of curiosity. I pushed it around for hours, wondering how things move and why they work.' },
    { enabled: true, src: 'assets/life/fig1.webp', label: 'School', x: 206, w: 175, h: 508, amp: 4, dur: 1.1,
      text: 'First bag, first friends, first exams. School is where I learned to ask questions and to keep showing up, every single day.' },
    { enabled: true, src: 'assets/life/fig2.webp', label: 'Higher secondary', x: 365, w: 347, h: 616, amp: 2, dur: 1.4,
      text: 'Cycle rides to school, big dreams and bigger confusion about what to become. This is when I started taking my future seriously.' },
    { enabled: true, src: 'assets/life/fig3.webp', label: 'College', x: 675, w: 215, h: 628, amp: 4, dur: 1.2,
      text: 'I moved to Trichy for B.Sc IT and M.Sc Computer Science at Jamal Mohamed College. First time away from home, and the city taught me as much as the classes did.' },
    { enabled: true, src: 'assets/life/fig4.webp', label: 'Cricket', x: 912, w: 207, h: 642, amp: 4, dur: 1.15,
      text: 'Cricket was my break from everything else. Team games taught me patience, teamwork, and how to go again after a bad innings.' },
    { enabled: true, src: 'assets/life/fig5.webp', label: 'Working in IT', x: 1126, w: 237, h: 654, amp: 4, dur: 1.3,
      text: 'I joined in October 2022 as a trainee fixing bugs, then moved into Angular projects. Today I build front-end dashboards and keep learning something new every day.' },
    { enabled: true, src: 'assets/life/fig6.webp', label: 'Father', x: 1380, w: 254, h: 602, amp: 3, dur: 1.4,
      text: 'And now I am a father. The best title I have ever had. Everything I build from here is for her future too.' },
  ];

  get visible(): Stage[] { return this.all.filter(s => s.enabled); }
  get X0(): number { return Math.min(...this.visible.map(s => s.x)); }
  get W(): number { return Math.max(...this.visible.map(s => s.x + s.w)) - this.X0; }
  get H(): number { return Math.max(...this.visible.map(s => s.h)); }

  constructor(private zone: NgZone) {}

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        this.zone.run(() => { this.inView = true; });
        this.observer?.disconnect();
      }
    }, { threshold: 0.3 });
    this.observer.observe(this.stageEl.nativeElement);
  }

  ngOnDestroy(): void { this.observer?.disconnect(); clearTimeout(this.resetTimer); }

  /** mouse: hover shows the story; touch: tap toggles it */
  enter(e: PointerEvent, i: number): void {
    if (e.pointerType !== 'mouse') return;
    clearTimeout(this.resetTimer);
    this.active = i;
  }

  click(i: number): void {
    clearTimeout(this.resetTimer);
    if (this.lastType === 'mouse') this.active = i;
    else this.active = this.active === i ? -1 : i;
  }

  /** leaving the whole section goes back to the default story (after a short pause) */
  leave(e: PointerEvent): void {
    if (e.pointerType !== 'mouse') return;
    clearTimeout(this.resetTimer);
    this.resetTimer = setTimeout(() => (this.active = -1), 700);
  }
}
