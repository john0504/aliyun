import { TestBed, getTestBed } from '@angular/core/testing';
import { NavController } from 'ionic-angular';
import { NavControllerMock } from 'ionic-mocks';

import { GoAddingDeviceService } from './go-adding-device-service';

describe('Service: Go Adding Device Service', () => {

  let instance: GoAddingDeviceService;
  let navCtrl: NavController;

  beforeEach(() => {
    navCtrl = NavControllerMock.instance();
    TestBed.configureTestingModule({
      providers: [
        GoAddingDeviceService,
      ],
    });
    const injector = getTestBed();
    instance = injector.get(GoAddingDeviceService);
  });

  it('just go to Device Create page', () => {
    instance.goAddingDevicePage(navCtrl);

    expect(navCtrl.push).toHaveBeenCalledWith('DeviceCreatePage');
  });

});