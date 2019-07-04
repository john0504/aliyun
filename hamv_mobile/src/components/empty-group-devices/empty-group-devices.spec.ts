import { HttpClientModule, HttpClient } from '@angular/common/http';
import { IonicModule, NavController, ViewController } from 'ionic-angular';
import { MockNgRedux, NgReduxTestingModule } from '@angular-redux/store/testing';
import { NavControllerMock, ViewControllerMock } from 'ionic-mocks';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { MockComponent } from 'ng-mocks';

import { createTranslateLoader } from '../../mocks/providers.mocks';
import { EmptyGroupDevicesComponent } from './empty-group-devices';
import { ExtraPageSpaceComponent } from '../extra-page-space/extra-page-space';
import { ThemeService } from '../../providers/theme-service';

describe('Component: empty device item', () => {
  let component: EmptyGroupDevicesComponent;
  let fixture: ComponentFixture<EmptyGroupDevicesComponent>;
  let navCtrl;

  beforeEach(() => {
    navCtrl = NavControllerMock.instance();
    const themeService = jasmine.createSpyObj('ThemeService', ['logoUrl']);
    themeService.logoUrl = '';
    TestBed.configureTestingModule({
      declarations: [
        EmptyGroupDevicesComponent,
        MockComponent(ExtraPageSpaceComponent),
      ],
      imports: [
        IonicModule.forRoot(EmptyGroupDevicesComponent),
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
        { provide: ViewController, useFactory: () => ViewControllerMock.instance() },
        { provide: NavController, useFactory: () => navCtrl },
        { provide: ThemeService, useFactory: () => themeService },
      ]
    });

    fixture = TestBed.createComponent(EmptyGroupDevicesComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => MockNgRedux.reset());

  it('should create', () => {
    expect(component).toBeDefined();
    expect(component instanceof EmptyGroupDevicesComponent).toBeTruthy();
  });

  it('open go to groups page', () => {
    component.goToGroupsPage();
    expect(navCtrl.setRoot).toHaveBeenCalledWith('MyGroupsPage');
  });
});
