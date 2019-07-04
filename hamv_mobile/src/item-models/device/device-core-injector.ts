import { Injectable } from '@angular/core';
import {
  AppEngine,
  Device,
} from 'app-engine';

import { DeviceCore } from './device-core';
import { DeviceCoreImpl } from './device-core-impl';
import { InformationModelService } from '../../modules/information-model';
import { DeviceConfigService } from '../../providers/device-config-service';
import { DeviceControlService } from '../../providers/device-control-service';

@Injectable()
export class DeviceCoreInjector {

  constructor(
    private configSrv: DeviceConfigService,
    private ctrlSrv: DeviceControlService,
    private ims: InformationModelService,
    private appEngine: AppEngine,
  ) {
  }

  public create(): DeviceCore {
    return new DeviceCoreImpl(this.configSrv, this.ctrlSrv, this.ims, this.appEngine);
  }

  public bind(deviceCore: DeviceCore = this.create(), device: Device): DeviceCore {
    if (deviceCore instanceof DeviceCoreImpl) {
      deviceCore.bind(device);
    }
    return deviceCore;
  }

}