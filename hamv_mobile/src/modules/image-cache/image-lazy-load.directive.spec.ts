import { _throw } from 'rxjs/observable/throw';
import {
  Component,
  DebugElement,
} from '@angular/core';
import { By } from '@angular/platform-browser';
import {
  TestBed,
  ComponentFixture,
  getTestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';

import { ImageCacheService } from './image-cache.service';
import { ImageLazyLoadDirective } from './image-lazy-load.directive';
import { ImageCacheServiceMock } from '../../mocks/image-cache.mocks';

@Component({
  template: '<img jy-lazy-load>'
})
class TestImageComponent {
  _source: string;
  _placeholder: string;

  setSource(v) {
    this._source = v;
  }

  setPlaceholder(v) {
    this._placeholder = v;
  }
}

describe('Image cache module: image lazy load directive', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        ImageLazyLoadDirective,
        TestImageComponent,
      ],
      providers: [
        { provide: ImageCacheService, useClass: ImageCacheServiceMock },
      ]
    });
  });

  it('should show nothing when source and placehodler are empty', fakeAsync(() => {
    const fixture: ComponentFixture<TestImageComponent> = TestBed.createComponent(TestImageComponent);

    expect(fixture).toBeDefined();

    fixture.detectChanges();
    tick(200);
    fixture.detectChanges();

    const afterD = fixture.debugElement.query(By.directive(ImageLazyLoadDirective));
    expect(afterD.nativeElement.getAttribute('src')).toBeNull();
  }));

  it('should modify src when image caching is working', fakeAsync(() => {
    const template = '<img jy-lazy-load source="a-network-image-url" placeholder="file:///a-local-image-url">';
    const fixture: ComponentFixture<TestImageComponent> = createTestComponent(template);

    expect(fixture).toBeDefined();

    const injector = getTestBed();
    const ics = injector.get(ImageCacheService);
    spyOn(ics, 'isHttpUrl').and.returnValue(false);

    fixture.detectChanges();
    tick(200);
    fixture.detectChanges();

    const afterD = fixture.debugElement.query(By.directive(ImageLazyLoadDirective));
    expect(afterD.nativeElement.getAttribute('src')).toEqual('cache-image/a-image-file-path');
  }));

  it('should use placeholder when source hasn\'t been setup', fakeAsync(() => {
    const template = '<img jy-lazy-load placeholder="file:///a-local-image-path">';
    const fixture: ComponentFixture<TestImageComponent> = createTestComponent(template);

    expect(fixture).toBeDefined();

    const injector = getTestBed();
    const ics = injector.get(ImageCacheService);
    spyOn(ics, 'isHttpUrl').and.returnValue(false);
    spyOn(ics, 'getImagePath').and.returnValue(_throw(new Error('image source is empty')));

    fixture.detectChanges();
    tick(200);
    fixture.detectChanges();

    const afterD = fixture.debugElement.query(By.directive(ImageLazyLoadDirective));
    expect(afterD.nativeElement.getAttribute('src')).toEqual('file:///a-local-image-path');
  }));

  it('should use placeholder when image caching error', fakeAsync(() => {
    const template = '<img jy-lazy-load source="a-network-image-url" placeholder="file:///a-local-image-path">';
    const fixture: ComponentFixture<TestImageComponent> = createTestComponent(template);

    expect(fixture).toBeDefined();

    const injector = getTestBed();
    const ics = injector.get(ImageCacheService);

    spyOn(ics, 'isHttpUrl').and.returnValue(false);
    spyOn(ics, 'getImagePath').and.returnValue(_throw(new Error('image caching error')));

    fixture.detectChanges();
    tick(200);
    fixture.detectChanges();

    const afterD = fixture.debugElement.query(By.directive(ImageLazyLoadDirective));
    expect(afterD.nativeElement.getAttribute('src')).toEqual('file:///a-local-image-path');
  }));

  it('setup invalid source then legal source', fakeAsync(() => {
    const template = '<img jy-lazy-load [source]="_source" placeholder="file:///a-local-image-path">';
    const fixture: ComponentFixture<TestImageComponent> = createTestComponent(template);
    expect(fixture).toBeDefined();

    const injector = getTestBed();
    const ics = injector.get(ImageCacheService);
    spyOn(ics, 'isHttpUrl').and.returnValue(false);
    const spy = spyOn(ics, 'getImagePath');
    spy.and.returnValue(_throw(new Error('image caching error')));

    const afterD = fixture.debugElement.query(By.directive(ImageLazyLoadDirective));

    fixture.detectChanges();
    expect(afterD.nativeElement.getAttribute('src')).toEqual('file:///a-local-image-path');

    spy.and.callThrough();
    fixture.componentInstance.setSource('a-network-image-url');
    tick(200);

    expect(afterD.nativeElement.getAttribute('src')).toEqual('cache-image/a-image-file-path');
  }));

  it('setup invalid values', fakeAsync(() => {
    const template = '<img jy-lazy-load [source]="_source" [placeholder]="_placeholder">';
    const fixture: ComponentFixture<TestImageComponent> = createTestComponent(template);
    expect(fixture).toBeDefined();

    const injector = getTestBed();
    const ics = injector.get(ImageCacheService);

    const spy = spyOn(ics, 'isHttpUrl');
    spy.and.returnValue(false);

    const directive = fixture.debugElement.query(By.directive(ImageLazyLoadDirective)).injector.get(ImageLazyLoadDirective);

    fixture.componentInstance.setPlaceholder('');
    fixture.detectChanges();
    tick(200);
    expect(directive.placeholder).toEqual('');

    fixture.componentInstance.setPlaceholder(undefined);
    fixture.detectChanges();
    tick(200);
    expect(directive.placeholder).toEqual('');

    fixture.componentInstance.setPlaceholder(null);
    fixture.detectChanges();
    tick(200);
    expect(directive.placeholder).toEqual('');

    const consoleSpy = spyOn(console, 'warn').and.callThrough();
    spy.and.returnValue(true);
    fixture.componentInstance.setPlaceholder('http://www.exosite.com/a.jpg');
    fixture.detectChanges();
    tick(200);
    expect(directive.placeholder).toEqual('http://www.exosite.com/a.jpg');
    expect(consoleSpy).toHaveBeenCalledWith('Should NOT use the http/https url as the placeholder image url.');
  }));
});

function createTestComponent(template: string): ComponentFixture<TestImageComponent> {
  return TestBed
    .overrideComponent(TestImageComponent, { set: { template } })
    .createComponent(TestImageComponent);
}