import { HttpClientModule, HttpClient } from '@angular/common/http';
import { IonicModule, NavController, ViewController } from 'ionic-angular';
import { MockNgRedux, NgReduxTestingModule } from '@angular-redux/store/testing';
import { NavControllerMock, ViewControllerMock } from 'ionic-mocks';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';

import { createTranslateLoader } from '../../mocks/providers.mocks';
import { ThemeService } from '../../providers/theme-service';
import { ButtonGroupControlComponent } from './button-group-control';

describe('Component: empty device item', () => {
  let component: ButtonGroupControlComponent;
  let fixture: ComponentFixture<ButtonGroupControlComponent>;
  let navCtrl;

  beforeEach(() => {
    navCtrl = NavControllerMock.instance();
    const themeService = jasmine.createSpyObj('ThemeService', ['logoUrl']);
    themeService.logoUrl = '';
    TestBed.configureTestingModule({
      declarations: [
        ButtonGroupControlComponent,
      ],
      imports: [
        IonicModule.forRoot(ButtonGroupControlComponent),
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

    fixture = TestBed.createComponent(ButtonGroupControlComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => MockNgRedux.reset());

  it('should create', () => {
    expect(component).toBeDefined();
    expect(component instanceof ButtonGroupControlComponent).toBeTruthy();
  });

  it('set group', () => {
    component.group = {
      name: 'foo',
      devices: ['Foo', 'Bar']
    };

    expect(component.group).toEqual({
      name: 'foo',
      devices: ['Foo', 'Bar']
    });
  });

  it('open group detail page', () => {
    const group = {
      name: 'foo'
    };
    component.goGroupDetail(group);
    expect(navCtrl.push).toHaveBeenCalledWith('GroupDetailPage', { groupId: 'foo' });
  });
});
