import { DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  untracked,
} from '@angular/core';

export type TypographyVariant =
  | 'display'
  | 'lead'
  | 'title'
  | 'subtitle'
  | 'body'
  | 'caption'
  | 'tag'
  | 'brand'
  | 'footer-body';

export type TypographyElement = 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';

function defaultElementForVariant(variant: TypographyVariant): TypographyElement {
  switch (variant) {
    case 'display':
      return 'h1';
    case 'lead':
    case 'body':
    case 'footer-body':
      return 'p';
    case 'title':
      return 'h2';
    case 'subtitle':
      return 'h3';
    case 'caption':
    case 'tag':
    case 'brand':
      return 'span';
    default:
      return 'p';
  }
}

@Component({
  selector: 'app-typography',
  imports: [],
  templateUrl: './typography.html',
  styleUrl: './typography.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TypographyComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);
  readonly variant = input.required<TypographyVariant>();

  readonly tag = computed(() => defaultElementForVariant(this.variant()));

  readonly variantClass = computed(() => `typography typography--${this.variant()}`);

  private wrapper: HTMLElement | null = null;
  private domReady = false;

  constructor() {
    afterNextRender(() => {
      this.syncHost();
      this.domReady = true;
    });

    effect(() => {
      this.variant();
      if (this.domReady) {
        untracked(() => this.syncHost());
      }
    });
  }

  private syncHost(): void {
    const host = this.host.nativeElement;
    const tagName = this.tag();
    const className = this.variantClass();

    if (!this.wrapper) {
      this.wrapper = this.document.createElement(tagName);
      while (host.firstChild) {
        this.wrapper.appendChild(host.firstChild);
      }
      host.appendChild(this.wrapper);
      this.wrapper.className = className;
      return;
    }

    if (this.wrapper.nodeName.toLowerCase() !== tagName) {
      const next = this.document.createElement(tagName);
      while (this.wrapper.firstChild) {
        next.appendChild(this.wrapper.firstChild);
      }
      host.replaceChild(next, this.wrapper);
      this.wrapper = next;
    }

    this.wrapper.className = className;
  }
}
