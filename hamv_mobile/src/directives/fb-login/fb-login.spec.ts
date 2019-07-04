import {
  Component,
  DebugElement,
} from '@angular/core';
import { By } from '@angular/platform-browser';
import {
  TestBed,
  getTestBed,
  ComponentFixture,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import {
  TranslateModule,
  TranslateLoader,
} from '@ngx-translate/core';
import {
  HttpClient,
  HttpClientModule,
} from '@angular/common/http';
import { AppTasks } from 'app-engine';
import { AppVersion } from '@ionic-native/app-version';
import { MockComponent } from 'ng-mocks';

import { Platform, ModalController } from 'ionic-angular';
import { PlatformMock, ModalControllerMock, ModalMock } from 'ionic-mocks';

import { FbLoginDirective } from './fb-login';
import { PopupService } from '../../providers/popup-service';
import {
  createTranslateLoader,
  PopupServiceMock,
} from '../../mocks/providers.mocks';
import { AppTasksMock } from '../../mocks/app-engine.mocks';
import { GdprAlertComponent } from '../../components/gdpr-alert/gdpr-alert';

@Component({
  template: '<button fb-login></button>'
})
class TestClickableComponent {

}

describe('Directive: facebook login', () => {

  let fixture: ComponentFixture<TestClickableComponent>;
  let buttonEl: DebugElement;

  let appTasks: AppTasks;
  let modalCtrl;
  let modal;

  beforeEach(() => {
    modal = ModalMock.instance();
    modalCtrl = ModalControllerMock.instance(modal);
    TestBed.configureTestingModule({
      declarations: [
        FbLoginDirective,
        TestClickableComponent,
        MockComponent(GdprAlertComponent),
      ],
      imports: [
        HttpClientModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: (createTranslateLoader),
            deps: [HttpClient]
          },
        }),
      ],
      providers: [
        { provide: Platform, useFactory: () => PlatformMock.instance() },
        { provide: AppTasks, useClass: AppTasksMock },
        { provide: PopupService, useClass: PopupServiceMock },
        AppVersion,
        { provide: ModalController, useFactory: () => modalCtrl }
      ],
    });

    const injector = getTestBed();
    appTasks = injector.get(AppTasks);

    fixture = TestBed.createComponent(TestClickableComponent);
    buttonEl = fixture.debugElement.query(By.directive(FbLoginDirective));
  });

  it('clicking the login button and agree GDPR', fakeAsync(() => {
    const spyFbLogin = spyOn(appTasks, 'loginWithFacebookTask').and.callThrough();
    let _dismissCallback: Function;
    modal.dismiss.and.callFake(() => {
      //simulate user agree
      _dismissCallback(true);
      return Promise.resolve();
    });

    modal.onDidDismiss.and.callFake((callback: Function) => {
      _dismissCallback = callback;
    });

    buttonEl.triggerEventHandler('click', null);
    fixture.detectChanges();

    expect(modal.present).toHaveBeenCalled();

    modal.dismiss();
    tick(300);

    expect(spyFbLogin).toHaveBeenCalled();
  }));

  it('clicking the login button but disagree GDPR', fakeAsync(() => {
    const spyFbLogin = spyOn(appTasks, 'loginWithFacebookTask').and.callThrough();
    let _dismissCallback: Function;
    modal.dismiss.and.callFake(() => {
      //simulate user disagree
      _dismissCallback(false);
      return Promise.resolve();
    });

    modal.onDidDismiss.and.callFake((callback: Function) => {
      _dismissCallback = callback;
    });

    buttonEl.triggerEventHandler('click', null);
    fixture.detectChanges();

    expect(modal.present).toHaveBeenCalled();

    modal.dismiss();
    tick(300);

    expect(spyFbLogin).not.toHaveBeenCalled();
  }));

  it('clicking the login button - login fail', fakeAsync(() => {
    const spyFbLogin = spyOn(appTasks, 'loginWithFacebookTask').and.returnValue(Promise.reject('logining error'));

    let _dismissCallback: Function;
    modal.dismiss.and.callFake(() => {
      //simulate user agree
      _dismissCallback(true);
      return Promise.resolve();
    });

    modal.onDidDismiss.and.callFake((callback: Function) => {
      _dismissCallback = callback;
    });

    buttonEl.triggerEventHandler('click', null);
    fixture.detectChanges();

    expect(modal.present).toHaveBeenCalled();
    modal.dismiss();
    tick(300);

    expect(spyFbLogin).toHaveBeenCalled();
  }));

  it('clicking the login button - login cancel on Android', fakeAsync(() => {
    const spyFbLogin = spyOn(appTasks, 'loginWithFacebookTask').and.returnValue(Promise.reject({ errorCode: '4201' }));

    let _dismissCallback: Function;
    modal.dismiss.and.callFake(() => {
      //simulate user agree
      _dismissCallback(true);
      return Promise.resolve();
    });

    modal.onDidDismiss.and.callFake((callback: Function) => {
      _dismissCallback = callback;
    });

    buttonEl.triggerEventHandler('click', null);
    fixture.detectChanges();

    expect(modal.present).toHaveBeenCalled();
    modal.dismiss();
    tick(300);

    expect(spyFbLogin).toHaveBeenCalled();
  }));

  it('clicking the login button - login cancel on iOS', fakeAsync(() => {
    const spyFbLogin = spyOn(appTasks, 'loginWithFacebookTask').and.returnValue(Promise.reject('cancelled'));
    
    let _dismissCallback: Function;
    modal.dismiss.and.callFake(() => {
      //simulate user agree
      _dismissCallback(true);
      return Promise.resolve();
    });

    modal.onDidDismiss.and.callFake((callback: Function) => {
      _dismissCallback = callback;
    });

    buttonEl.triggerEventHandler('click', null);
    fixture.detectChanges();

    expect(modal.present).toHaveBeenCalled();
    modal.dismiss();
    tick(300);

    expect(spyFbLogin).toHaveBeenCalled();
  }));
});