import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import {
  TestBed,
  ComponentFixture,
} from '@angular/core/testing';
import {
  IonicModule,
  NavParams,
  Platform,
  ViewController,
} from 'ionic-angular';
import {
  PlatformMock,
  ViewControllerMock,
} from 'ionic-mocks';
import {
  HttpClientModule,
  HttpClient,
} from '@angular/common/http';
import { MockComponent } from 'ng-mocks';

import { createTranslateLoader } from '../../mocks/providers.mocks';
import { GdprAlertComponent } from './gdpr-alert';
import { ExtraPageSpaceComponent } from '../extra-page-space/extra-page-space';
import { TermsOfServiceComponent } from '../terms-of-service/terms-of-service';

describe('Component: GDPR Alert Component', () => {

  let component: GdprAlertComponent;
  let fixture: ComponentFixture<GdprAlertComponent>;

  let viewCtrl;

  beforeEach(() => {
    viewCtrl = ViewControllerMock.instance();
    TestBed.configureTestingModule({
      declarations: [
        GdprAlertComponent,
        MockComponent(TermsOfServiceComponent),
        MockComponent(ExtraPageSpaceComponent),
      ],
      imports: [
        IonicModule.forRoot(GdprAlertComponent),
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
        { provide: ViewController, useFactory: () => viewCtrl },
        { provide: NavParams, useValue: new NavParams({ appName: 'app name', oauthProvider: 'Facebook', oauthName: 'facebook.com' }) },
      ],
    });

    fixture = TestBed.createComponent(GdprAlertComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeDefined();
    expect(component instanceof GdprAlertComponent).toBeTruthy();
    expect(component.appName).toEqual('app name');
    expect(component.oauthProvider).toEqual('Facebook');
    expect(component.oauthName).toEqual('facebook.com');
  });

  it('send GDPR consent', () => {
    component.gdprConsent(false);
    expect(viewCtrl.dismiss).toHaveBeenCalledWith(false);
    component.gdprConsent(true);
    expect(viewCtrl.dismiss).toHaveBeenCalledWith(true);
  });
});