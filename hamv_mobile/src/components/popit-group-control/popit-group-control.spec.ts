import { HttpClientModule, HttpClient } from '@angular/common/http';
import { IonicModule, NavController, ViewController } from 'ionic-angular';
import { MockNgRedux, NgReduxTestingModule } from '@angular-redux/store/testing';
import { NavControllerMock, ViewControllerMock } from 'ionic-mocks';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { MockComponent } from 'ng-mocks';

import { createTranslateLoader } from '../../mocks/providers.mocks';
import { PopitGroupControlComponent } from './popit-group-control';
import { GroupControlPanelComponent } from '../group-control-panel/group-control-panel';

describe('Component: empty device item', () => {
  let component: PopitGroupControlComponent;
  let fixture: ComponentFixture<PopitGroupControlComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        PopitGroupControlComponent,
        MockComponent(GroupControlPanelComponent),
      ],
      imports: [
        IonicModule.forRoot(PopitGroupControlComponent),
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
      ]
    });

    fixture = TestBed.createComponent(PopitGroupControlComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => MockNgRedux.reset());

  it('should create', () => {
    expect(component).toBeDefined();
    expect(component instanceof PopitGroupControlComponent).toBeTruthy();
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

  it('set expand', () => {
    component.expand = false;
    expect(component._expand).toBeFalsy();

    component.expand = true;
    expect(component._expand).toBeTruthy();
  });

  it('set showDevicesInGroupString', () => {
    component.showDevicesInGroupString = false;
    expect(component._showDevicesInGroupString).toBeFalsy();

    component.showDevicesInGroupString = true;
    expect(component._showDevicesInGroupString).toBeTruthy();
  });
});
