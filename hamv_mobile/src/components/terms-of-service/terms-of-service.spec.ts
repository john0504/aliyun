import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import {
  TestBed,
  ComponentFixture,
  getTestBed,
} from '@angular/core/testing';
import {
  IonicModule,
  ViewController,
} from 'ionic-angular';
import { AppEngine } from 'app-engine';
import {
  HttpClientModule,
  HttpClient,
} from '@angular/common/http';

import { UtilsProvider } from '../../providers/utils-provider';
import { AppEngineMock } from '../../mocks/app-engine.mocks';
import { createTranslateLoader } from '../../mocks/providers.mocks';
import { TermsOfServiceComponent } from './terms-of-service';

describe('Component: Terms of Service Component', () => {

  let component: TermsOfServiceComponent;
  let fixture: ComponentFixture<TermsOfServiceComponent>;

  let utilProvider;

  beforeEach(() => {
    utilProvider = jasmine.createSpyObj('UtilsProvider', ['openLink']);
    utilProvider.openLink.and.callFake(() => { });
    TestBed.configureTestingModule({
      declarations: [
        TermsOfServiceComponent,
      ],
      imports: [
        IonicModule.forRoot(TermsOfServiceComponent),
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
        { provide: AppEngine, useClass: AppEngineMock },
        { provide: UtilsProvider, useValue: utilProvider },
      ],
    });

    fixture = TestBed.createComponent(TermsOfServiceComponent);
    component = fixture.componentInstance;

    const injector = getTestBed();
    utilProvider = injector.get(UtilsProvider);
  });

  it('should create', () => {
    expect(component).toBeDefined();
    expect(component instanceof TermsOfServiceComponent).toBeTruthy();
  });

  it('open terms of service link', () => {
    component.openTerms();

    expect(utilProvider.openLink).toHaveBeenCalledWith('https://baseUrl/#/legal');
  });
});