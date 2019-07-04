import {
  Directive,
  ElementRef,
  Host,
  Renderer2
} from '@angular/core';

@Directive({
  selector: '[m-ripple-effect]',
  host: {
    'tappable': '',
    'role': 'button',
    'style': 'position: relative; overflow: hidden'
  }
})
export class RippleEffectDirective {
  constructor(
    @Host() host: ElementRef,
    renderer: Renderer2
  ) {
    const div = renderer.createElement('div');
    renderer.addClass(div, 'button-effect');
    renderer.appendChild(host.nativeElement, div);
  }
}