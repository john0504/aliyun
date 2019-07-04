import {
  Directive,
  ElementRef,
  Input,
  OnInit,
  OnDestroy,
  Renderer2,
} from '@angular/core';
import {
  Subject,
  Subscription,
  ReplaySubject,
} from 'rxjs';
import {
  catchError,
  debounceTime,
  switchMap,
} from 'rxjs/operators';
import { of } from 'rxjs/observable/of';

import { ImageCacheService } from './image-cache.service';

@Directive({
  selector: '[jy-lazy-load]'
})
export class ImageLazyLoadDirective implements OnInit, OnDestroy {

  private _source: string;
  private _placeholder: string = '';

  get source(): string {
    return this._source;
  }

  @Input('source')
  set source(v: string) {
    this._source = v || '';
    this.subject.next('src');
  }

  get placeholder(): string {
    return this._placeholder;
  }

  @Input('placeholder')
  set placeholder(v: string) {
    if (this.imgCacheService.isHttpUrl(v)) {
      console.warn('Should NOT use the http/https url as the placeholder image url.');
    }
    this._placeholder = v || '';
    this.subject.next('defaultSrc');
  }

  private subject: Subject<string>;
  private cacheSubscription: Subscription;

  constructor(
    public el: ElementRef,
    public imgCacheService: ImageCacheService,
    public renderer: Renderer2,
  ) {
    this.subject = new ReplaySubject<string>(1);
  }

  public ngOnInit(): void {
    this.setImageSrc(this._placeholder);
    // cache img and set the src to the img
    this.cacheSubscription =
      this.subject
        .pipe(
          debounceTime(100),
          switchMap(() =>
            this.imgCacheService.getImagePath(this._source)
              .pipe(catchError(() => of(this._placeholder)))
          )
        )
        .subscribe(value => this.setImageSrc(value));
  }

  private setImageSrc(src) {
    if (!src) return;
    const nativeElement: HTMLElement = this.el.nativeElement;
    this.renderer.setAttribute(nativeElement, 'src', src);
  }

  public ngOnDestroy(): void {
    this.cacheSubscription.unsubscribe();
    this.subject.complete();
  }
}