import { By } from '@angular/platform-browser';
import { Component, TemplateRef } from '@angular/core';
import { ComponentFixture, fakeAsync, getTestBed, TestBed, tick } from '@angular/core/testing';
import { File } from '@ionic-native/file';
import { FileMock } from '@ionic-native-mocks/file';
import { HttpClientModule } from '@angular/common/http';
import { MockNgRedux, NgReduxTestingModule } from '@angular-redux/store/testing';
import { NavControllerMock, PlatformMock } from 'ionic-mocks';
import { Platform, NavController } from 'ionic-angular';
import { StateStore } from 'app-engine';
import cloneDeep from 'lodash/cloneDeep';

import { baseDevice } from '../../mocks/testing-items.mocks';
import { GoDeviceHistoricalPageDirective } from './go-device-historical-page';
import { InformationModelModule, InformationModelService } from '../../modules/information-model';
import { rasModel } from '../../mocks/information-model.mocks';

@Component({
  template: '<button *go-device-historical="deviceSn"></button>'
})
class TestClickableComponent {
  deviceSn = 'foo';
}

describe('Directive: Go device historical page directive', () => {

  let fixture: ComponentFixture<TestClickableComponent>;
  let ims: InformationModelService;

  let navCtrl;

  beforeEach(() => {
    navCtrl = NavControllerMock.instance();
    TestBed.configureTestingModule({
      declarations: [
        GoDeviceHistoricalPageDirective,
        TestClickableComponent
      ],
      imports: [
        InformationModelModule.forRoot(),
        NgReduxTestingModule,
        HttpClientModule,
      ],
      providers: [
        { provide: Platform, useFactory: () => PlatformMock.instance() },
        { provide: NavController, useFactory: () => navCtrl },
        { provide: File, useClass: FileMock },
        StateStore,
        TemplateRef,
      ]
    });

    const injector = getTestBed();
    ims = injector.get(InformationModelService);

    fixture = TestBed.createComponent(TestClickableComponent);
  });

  afterEach(() => MockNgRedux.reset());

  it('click go device historical page button', fakeAsync(() => {
    const devicesStub = MockNgRedux.getSelectorStub(['core', 'devices']);

    const testDevice = cloneDeep(baseDevice);
    testDevice.device = 'foo';

    spyOn(ims, 'getUIModel').and.callFake(device => {
      if (!device) return null;
      const model = cloneDeep(rasModel);
      return model;
    });

    devicesStub.next({
      'foo': testDevice,
    });
    tick(500);
    fixture.detectChanges();
    fixture.debugElement.query(By.css('button')).triggerEventHandler('click', null);

    expect(navCtrl.push).toHaveBeenCalledWith('DeviceHistoryPage', { deviceSn: 'foo' });
  }));
});
