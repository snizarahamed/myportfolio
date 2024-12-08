import { Component, ElementRef, ViewChild, HostListener } from '@angular/core';



@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  
})
export class HomeComponent {
  theme: string = 'light';
  @ViewChild('intro') introSection!: ElementRef;
  @ViewChild('contact') contactSection!: ElementRef;

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.theme = savedTheme;
      this.applyTheme(this.theme);
    }
  }

   


  toggleTheme(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    const theme = isChecked ? 'dark' : 'light';
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




  scrollToIntro() {
    this.introSection.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  

  scrollTocontact() {
    this.contactSection.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  
  
}
