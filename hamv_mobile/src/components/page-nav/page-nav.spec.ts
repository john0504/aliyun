import { MockComponent } from 'ng-mocks';
import { PopitListPage } from './../../pages/home/popit-list/popit-list';
import {
  getTestBed,
  TestBed,
  ComponentFixture,
} from '@angular/core/testing';
import { IonicModule } from 'ionic-angular';

import { PageNav } from './page-nav';
import { PageRouteManager } from './page-route-manager';

describe('Component: empty device item', () => {
  let component: PageNav;
  let fixture: ComponentFixture<PageNav>;

  let pageRouteManager;
  let pageType;

  beforeEach(() => {
    pageType = MockComponent(PopitListPage);
    TestBed.configureTestingModule({
      declarations: [
        PageNav,
        pageType,
      ],
      imports: [
        IonicModule.forRoot(PageNav),
      ],
      providers: [
        PageRouteManager,
      ]
    });

    fixture = TestBed.createComponent(PageNav);
    component = fixture.componentInstance;

    const injector = getTestBed();
    pageRouteManager = injector.get(PageRouteManager);
  });

  it('test push', () => {
    const spy = spyOn(pageRouteManager, 'getPage').and.callThrough();

    component.push('AbcPage');
    expect(spy).toHaveBeenCalledWith('AbcPage');
  });

  it('test push - page', () => {
    const spy = spyOn(pageRouteManager, 'getPage').and.callThrough();

    component.push(pageType);
    expect(spy).not.toHaveBeenCalled();
  });

  it('test insert', () => {
    const spy = spyOn(pageRouteManager, 'getPage').and.callThrough();

    component.insert(0, 'AbcPage');
    expect(spy).toHaveBeenCalledWith('AbcPage');
  });

  it('test insert - page', () => {
    const spy = spyOn(pageRouteManager, 'getPage').and.callThrough();

    component.insert(0, pageType);
    expect(spy).not.toHaveBeenCalled();
  });

  it('test insertPages', () => {
    const spy = spyOn(pageRouteManager, 'getPage').and.callThrough();

    component.insertPages(0, [{ page: 'AbcPage' }]);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('AbcPage');
  });

  it('test insertPages - page', () => {
    const spy = spyOn(pageRouteManager, 'getPage').and.callThrough();

    component.insertPages(0, [{ page: pageType }]);
    expect(spy).not.toHaveBeenCalled();
  });

  it('test popTo', () => {
    const spy = spyOn(pageRouteManager, 'getPage').and.callThrough();

    component.popTo('AbcPage');
    expect(spy).toHaveBeenCalledWith('AbcPage');
  });

  it('test popTo - page', () => {
    const spy = spyOn(pageRouteManager, 'getPage').and.callThrough();

    component.popTo(pageType);
    expect(spy).not.toHaveBeenCalled();
  });

  it('test setRoot', () => {
    const spy = spyOn(pageRouteManager, 'getPage').and.callThrough();

    component.setRoot('AbcPage');
    expect(spy).toHaveBeenCalledWith('AbcPage');
  });

  it('test setRoot - page', () => {
    const spy = spyOn(pageRouteManager, 'getPage').and.callThrough();

    component.setRoot(pageType);
    expect(spy).not.toHaveBeenCalled();
  });

  it('test setPages', () => {
    const spy = spyOn(pageRouteManager, 'getPage').and.callThrough();

    component.setPages([{ page: 'AbcPage' }]);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('AbcPage');
  });

  it('test setPages - page', () => {
    const spy = spyOn(pageRouteManager, 'getPage').and.callThrough();

    component.setPages([{ page: pageType }]);
    expect(spy).not.toHaveBeenCalled();
  });

});