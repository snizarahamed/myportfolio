import { Component, ElementRef, ViewChild, HostListener,OnInit } from '@angular/core';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  
})
export class HomeComponent implements OnInit{
  theme: string = 'dark';
  @ViewChild('intro') introSection!: ElementRef;
  @ViewChild('contact') contactSection!: ElementRef;

   constructor(private el: ElementRef) {}

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.theme = savedTheme;
      this.applyTheme(this.theme);
    }

        this.scrollTrigger(); // run on load

  }

    @HostListener('window:scroll', [])
  onWindowScroll() {
    this.scrollTrigger();
  }

  private scrollTrigger() {
    const elements = this.el.nativeElement.querySelectorAll('.fade-in-up,.fade-in-up-icon,.slide-in-left,.slide-in-right');
    elements.forEach((el: HTMLElement) => {
      const rect = el.getBoundingClientRect();
      const inView = rect.top < window.innerHeight - 100;

      if (inView && !el.classList.contains('show')) {
        const delay = el.getAttribute('data-delay') || '0s';
        el.style.transitionDelay = delay;
        el.classList.add('show');
      }
    });
  }

   


  toggleTheme(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    const theme = isChecked ? 'light' : 'dark';
    this.theme = theme;
    this.applyTheme(theme);
    localStorage.setItem('theme', theme);
  }
  
  // toggleTheme(theme: string): void {
  //   this.theme = theme;
  //   this.applyTheme(theme);
  //   localStorage.setItem('theme', theme); 
  // }
  

  applyTheme(theme: string): void {
    document.body.className = ''; 
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    }
  }

  openResume(): void {
    const resumeUrl = 'assets/Resume.pdf';
    window.open(resumeUrl, '_blank');
  }
  

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    const cursor = document.getElementById('custom-cursor');
    if (cursor) {
      cursor.style.left = `${event.clientX}px`;
      cursor.style.top = `${event.clientY}px`;
    }
  }

  @HostListener('window:toggle-theme')
onBallToggle() {
  this.theme = this.theme === 'dark' ? 'light' : 'dark';
  this.applyTheme(this.theme);
  localStorage.setItem('theme', this.theme);
}



  scrollToIntro() {
    this.introSection.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  

  scrollTocontact() {
    this.contactSection.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}
  
}
