import { Injectable } from "@angular/core";

import { InformationModelService } from "../../modules/information-model";
import { DeviceControlService } from "../../providers/device-control-service";

import { GroupCore } from './group-core';
import { GroupCoreImpl } from './group-core-impl';

@Injectable()
export class GroupCoreInjector {
  constructor(
    private deviceCtrlService: DeviceControlService,
    private ims: InformationModelService,
  ) {}

  public create(): GroupCore {
    return new GroupCoreImpl(this.deviceCtrlService, this.ims);
  }

  public bind(groupCore: GroupCore, group, allDevices): GroupCore {
    if (groupCore instanceof GroupCoreImpl) {
      groupCore.bind(group);
    }
    groupCore.update(allDevices);
    groupCore.selfUpdate();
    return groupCore;
  }
}
