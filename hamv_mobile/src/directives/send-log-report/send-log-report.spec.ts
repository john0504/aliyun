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
  flush,
} from '@angular/core/testing';
import {
  TranslateModule,
  TranslateLoader,
} from '@ngx-translate/core';
import {
  MockNgRedux,
  NgReduxTestingModule,
} from '@angular-redux/store/testing';
import {
  HttpClient,
  HttpClientModule,
} from '@angular/common/http';
import { StateStore } from 'app-engine';
import { Platform } from 'ionic-angular';
import { PlatformMock } from 'ionic-mocks';
import { AppVersion } from '@ionic-native/app-version';
import { AppVersionMock } from '@ionic-native-mocks/app-version';
import { Device } from '@ionic-native/device';
import { DeviceMock } from '@ionic-native-mocks/device';
import { EmailComposer } from '@ionic-native/email-composer';
import { EmailComposerMock } from '@ionic-native-mocks/email-composer';

import { SendLogReportDirective } from './send-log-report';
import { PopupService } from '../../providers/popup-service';
import { baseAccount } from '../../mocks/testing-items.mocks';
import {
  createTranslateLoader,
  PopupServiceMock,
} from '../../mocks/providers.mocks';
import { AppTasksMock } from '../../mocks/app-engine.mocks';

@Component({
  template: '<button send-log-report></button>'
})
class TestClickableComponent {

}

describe('Directive: send log report', () => {

  let fixture: ComponentFixture<TestClickableComponent>;
  let buttonEl: DebugElement;
  let emailComposer: EmailComposer;
  let platformMock;

  beforeEach(() => {
    platformMock = PlatformMock.instance();
    TestBed.configureTestingModule({
      declarations: [
        SendLogReportDirective,
        TestClickableComponent,
      ],
      imports: [
        NgReduxTestingModule,
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
        { provide: AppVersion, useClass: AppVersionMock },
        { provide: Device, useClass: DeviceMock },
        { provide: EmailComposer, useClass: EmailComposerMock },
        { provide: Platform, useFactory: () => platformMock },
        { provide: PopupService, useClass: PopupServiceMock },
        StateStore,
      ],
    });

    const injector = getTestBed();
    emailComposer = injector.get(EmailComposer);

    fixture = TestBed.createComponent(TestClickableComponent);
    buttonEl = fixture.debugElement.query(By.directive(SendLogReportDirective));
  });

  it('click the report button', () => {
    const accountStub = MockNgRedux.getSelectorStub(['core', 'account']);

    accountStub.next(null);
    accountStub.next(baseAccount);
    buttonEl.triggerEventHandler('click', null);
    fixture.detectChanges();
  });

  it('click the report button - emailComposer not ready', () => {
    spyOn(emailComposer, 'isAvailable').and.returnValue(Promise.reject('cordova_not_available'));

    const accountStub = MockNgRedux.getSelectorStub(['core', 'account']);
    accountStub.next(baseAccount);

    buttonEl.triggerEventHandler('click', null);
    fixture.detectChanges();
  });

  it('click the report button - unknown error', () => {
    spyOn(emailComposer, 'isAvailable').and.returnValue(Promise.reject('unknown_error'));

    buttonEl.triggerEventHandler('click', null);
    fixture.detectChanges();
  });

  it('click the report button - on iOS', () => {
    platformMock.is.and.returnValue(false);

    buttonEl.triggerEventHandler('click', null);
    fixture.detectChanges();
  });
});