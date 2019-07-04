import { PageRouteManager } from './page-route-manager';
import {
  forwardRef,
  Component,
  ComponentFactoryResolver,
  ErrorHandler,
  ElementRef,
  NgZone,
  Optional,
  Renderer,
  ViewEncapsulation,
} from '@angular/core';
import {
  App,
  Config,
  DeepLinker,
  DomController,
  GestureController,
  Nav,
  NavController,
  NavOptions,
  Platform,
  RootNode,
  ViewController,
} from 'ionic-angular';
import {
  Page,
  TransitionDoneFn,
} from 'ionic-angular/navigation/nav-util';
import { TransitionController } from 'ionic-angular/transitions/transition-controller';

@Component({
  selector: 'page-nav',
  template:
    '<div #viewport nav-viewport></div>' +
    '<div class="nav-decor"></div>',
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: RootNode, useExisting: forwardRef(() => PageNav) }]
})
export class PageNav extends Nav {

  constructor(
    @Optional() viewCtrl: ViewController,
    @Optional() parent: NavController,
    app: App,
    config: Config,
    plt: Platform,
    elementRef: ElementRef,
    zone: NgZone,
    renderer: Renderer,
    cfr: ComponentFactoryResolver,
    gestureCtrl: GestureController,
    transCtrl: TransitionController,
    @Optional() linker: DeepLinker,
    domCtrl: DomController,
    errHandler: ErrorHandler,
    public prm: PageRouteManager,
  ) {
    super(viewCtrl, parent, app, config, plt, elementRef, zone, renderer, cfr, gestureCtrl, transCtrl, linker, domCtrl, errHandler);
  }

  public push(page: any, params?: any, opts?: NavOptions, done?: TransitionDoneFn): Promise<any> {
    const targetPage = typeof page === 'string' ? this.prm.getPage(page) : page;
    return super.push(targetPage, params, opts, done);
  }

  public insert(insertIndex: number, page: Page | string, params?: any, opts?: NavOptions, done?: TransitionDoneFn): Promise<any> {
    const targetPage = typeof page === 'string' ? this.prm.getPage(page) : page;
    return super.insert(insertIndex, targetPage, params, opts, done);
  }

  public insertPages(insertIndex: number, insertPages: Array<{ page: Page | string; params?: any; }>, opts?: NavOptions, done?: TransitionDoneFn): Promise<any> {
    const targetPages = insertPages.map(value => {
      value.page = typeof value.page === 'string' ? this.prm.getPage(value.page) : value.page;
      return value;
    });
    return super.insertPages(insertIndex, targetPages, opts, done);
  }

  public popTo(page: Page | string | ViewController, opts?: NavOptions, done?: TransitionDoneFn): Promise<any> {
    const targetPage = typeof page === 'string' ? this.prm.getPage(page) : page;
    return super.popTo(targetPage, opts, done);
  }

  public setRoot(pageOrViewCtrl: Page | string | ViewController, params?: any, opts?: NavOptions, done?: TransitionDoneFn): Promise<any> {
    const targetPage = typeof pageOrViewCtrl === 'string' ? this.prm.getPage(pageOrViewCtrl) : pageOrViewCtrl;
    return super.setRoot(targetPage, params, opts, done);
  }

  public setPages(pages: ({ page: Page | string; params?: any; } | ViewController)[], opts?: NavOptions, done?: TransitionDoneFn): Promise<any> {
    const targetPages = pages.map(value => {
      if (!(value instanceof ViewController)) {
        value.page = typeof value.page === 'string' ? this.prm.getPage(value.page) : value.page;
      }
      return value;
    });
    return super.setPages(targetPages, opts, done);
  }
}
