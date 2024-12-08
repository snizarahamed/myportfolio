import { Component,AfterViewInit } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);


@Component({
  selector: 'app-shortcut',
  templateUrl: './shortcut.component.html',
  
})
export class ShortcutComponent {

  ngAfterViewInit() {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.accordions',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        pin: true,
        // markers: true  // Remove or set to false in production
      }
    });

    tl.to('.accordion .text', {
      height: 0,
      paddingBottom: 0,
      opacity: 0,
      stagger: 0.5,
      ease: 'power2.out' // Add easing for smoothness
    });

    tl.to('.accordion', {
      marginBottom: -5,
      stagger: 0.5,
      ease: 'power2.out' // Add easing for smoothness
    }, '<');
  }

}
