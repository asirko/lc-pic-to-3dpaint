import { Component, effect, ElementRef, inject, input, output, Renderer2 } from '@angular/core';

// todo voir pour utilise une directive à la place
@Component({ template: '' })
export abstract class Step {
  readonly #renderer = inject(Renderer2);
  readonly #elementRef = inject(ElementRef);

  readonly isActive = input.required();
  readonly next = output();

  constructor() {
    this.#renderer.addClass(this.#elementRef.nativeElement, 'step-content');
    effect(() => {
      if (this.isActive()) {
        this.#renderer.removeClass(this.#elementRef.nativeElement, 'is-inactive');
        this.#renderer.addClass(this.#elementRef.nativeElement, 'is-active');
      } else {
        this.#renderer.addClass(this.#elementRef.nativeElement, 'is-inactive');
        this.#renderer.removeClass(this.#elementRef.nativeElement, 'is-active');
      }
    });
  }
}
