import { MockComponent } from 'ng-mocks';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ViewController, IonicModule } from 'ionic-angular';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewControllerMock, StorageMock } from 'ionic-mocks';
import { Storage } from '@ionic/storage';

import { WifiApManagePage } from './wifi-ap-manage';
import { ExtraPageSpaceComponent } from '../../components/extra-page-space/extra-page-space';
import { createTranslateLoader } from '../../mocks/providers.mocks';

describe('Page: Wifi AP Manage', () => {
  let component: WifiApManagePage;
  let fixture: ComponentFixture<WifiApManagePage>;
  let viewCtrl;
  let storage;

  beforeEach(() => {
    viewCtrl = ViewControllerMock.instance();
    storage = StorageMock.instance();

    TestBed.configureTestingModule({
      declarations: [
        WifiApManagePage,
        MockComponent(ExtraPageSpaceComponent),
      ],
      imports: [
        IonicModule.forRoot(WifiApManagePage),
        HttpClientModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: createTranslateLoader,
            deps: [HttpClient]
          }
        })
      ],
      providers: [
        { provide: Storage, useFactory: () => storage },
        { provide: ViewController, useFactory: () => viewCtrl },
      ]
    });

    fixture = TestBed.createComponent(WifiApManagePage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeDefined();
    expect(component instanceof WifiApManagePage).toBeTruthy();
  });

  it('remove exist ssid', () => {
    component.ssidList = [{ ssid: 'abc', sec: 'open' }, { ssid: 'cde', password: 'password', sec: 'wpa2' }];
    component.removeSsid({ ssid: 'abc', sec: 'open' });
    expect(storage.set).toHaveBeenCalledWith('_ssid_list', [{ ssid: 'cde', password: 'password', sec: 'wpa2' }]);
    expect(component.ssidList).toEqual([{ ssid: 'cde', password: 'password', sec: 'wpa2' }]);
  });

  it('remove unexist ssid', () => {
    component.ssidList = [{ ssid: 'cde', password: 'password', sec: 'wpa2' }];
    component.removeSsid({ ssid: 'abc', sec: 'open' });
    expect(storage.set).toHaveBeenCalledWith('_ssid_list', [{ ssid: 'cde', password: 'password', sec: 'wpa2' }]);
    expect(component.ssidList).toEqual([{ ssid: 'cde', password: 'password', sec: 'wpa2' }]);
  });

  it('close page', () => {
    component.closePage();
    expect(viewCtrl.dismiss).toHaveBeenCalled();
  });
});