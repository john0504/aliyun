import { TestBed, getTestBed } from "@angular/core/testing";
import { AppEngine, AppTasks } from "app-engine";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { HttpClientModule, HttpClient } from "@angular/common/http";
import { Platform } from "ionic-angular";
import { PlatformMock } from "ionic-mocks";
import { File } from "@ionic-native/file";
import { FileMock } from "@ionic-native-mocks/file";
import cloneDeep from "lodash/cloneDeep";

import { GroupCoreImpl } from "./group-core-impl";
import { GroupCoreInjector } from "./group-core-injector";
import { PopupService } from "../../providers/popup-service";
import { DeviceConfigService } from "../../providers/device-config-service";
import { DeviceControlService } from "../../providers/device-control-service";

import {
  createTranslateLoader,
  DeviceConfigServiceMock,
  DeviceControlServiceMock,
  PopupServiceMock
} from "../../mocks/providers.mocks";
import { InformationModelModule, InformationModelService } from "../../modules/information-model";
import { AppEngineMock } from "../../mocks/app-engine.mocks";
import { rasModel } from "../../mocks/information-model.mocks";

const fakeDevices = {
  'foo': {
    device: 'foo',
    connected: 1,
    profile: {
      esh: {
        class: 123,
        eshVersion: '4.0.0',
        deviceId: 1,
        brand: 'ACCompany1',
        model: 'AC001',
      },
    },
    status: {
      H00: 0,
      H02: 33,
    },
  },
  'bar': {
    device: 'bar',
    connected: 1,
    profile: {
      esh: {
        class: 123,
        eshVersion: '4.0.0',
        deviceId: 1,
        brand: 'ACCompany2',
        model: 'AC002',
      },
    },
    status: {
      H00: 0,
      H02: 27,
    },
  },
};

const fakeDevicesWithoutStatus = {
  'foo': {
    device: 'foo',
    connected: 1,
    profile: {
      esh: {
        class: 123,
        eshVersion: '4.0.0',
        deviceId: 1,
        brand: 'ACCompany1',
        model: 'AC001',
      },
    },
  },
  'bar': {
    device: 'bar',
    connected: 1,
    profile: {
      esh: {
        class: 123,
        eshVersion: '4.0.0',
        deviceId: 1,
        brand: 'ACCompany2',
        model: 'AC002',
      },
    },
  },
};

const fakeModel = {
  "familyName": "Fake",
  "familyMembers": [
    "fake.*"
  ],
  "controlLayout": {
    "primary": [
      "AC_POWER_AND_TEMP"
    ],
    "secondary": [
      "AC_POWER",
    ]
  },
  "scheduleLayout": {
    "primary": [
    ]
  },
  "deviceId": 1,
  "components": {
    "AC_POWER_AND_TEMP": {
      "type": "large-toggle",
      "title": "",
      "models": [{
        "key": "H00",
        "values": [{
            "value": 0,
            "text": "INFORMATION_MODEL.OFF"
          },
          {
            "value": 1,
            "text": "INFORMATION_MODEL.ON"
          }
        ],
      }]
    },
    "AC_POWER": {
      "type": "toggle",
      "title": "INFORMATION_MODEL.POWER",
      "models": [{
        "key": "H00",
        "values": [{
            "value": 0,
            "text": "INFORMATION_MODEL.OFF"
          },
          {
            "value": 1,
            "text": "INFORMATION_MODEL.ON"
          }
        ],
      }]
    },
    "AC_TEMP": {
      "type": "range",
      "title": "INFORMATION_MODEL.TEMPERATURE",
      "hideFromGroup": true,
      "models": [{
        "key": "H03",
        "values": {
          "min": 16,
          "max": 32,
          "step": 1,
          "func": "tempCelsius"
        },
      }]
    },
  },
};

describe("group core test cases", () => {
  let ims: InformationModelService;
  let configSrv: DeviceConfigService;
  let ctrlSrv: DeviceControlService;
  let groupInjector: GroupCoreInjector;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        InformationModelModule.forRoot(),
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
        { provide: AppEngine, useClass: AppEngineMock },
        AppTasks,
        { provide: File, useClass: FileMock },
        { provide: PopupService, useClass: PopupServiceMock },
        GroupCoreInjector,
        { provide: DeviceConfigService, useClass: DeviceConfigServiceMock },
        { provide: DeviceControlService, useClass: DeviceControlServiceMock },
        { provide: Platform, useFactory: () => PlatformMock.instance() }
      ]
    });

    const injector = getTestBed();
    ims = injector.get(InformationModelService);
    configSrv = injector.get(DeviceConfigService);
    ctrlSrv = injector.get(DeviceControlService);
    groupInjector = injector.get(GroupCoreInjector);
  });

  afterEach(() => {
    getTestBed().resetTestingModule();
  });

  it("test create a new device core", () => {
    const groupCore = groupInjector.create();

    expect(groupCore.controllers).toEqual([]);
    expect(groupCore.deviceIds).toEqual([]);
    expect(groupCore.group).toBeUndefined();
    expect(groupCore.groupId).toBeUndefined();
    expect(groupCore.groupName).toEqual("");
    expect(groupCore.status).toEqual({});
  });

  it("bind group with undefined devices and groups", () => {
    const groupCore = groupInjector.bind(groupInjector.create(), undefined, undefined);

    expect(groupCore.controllers).toEqual([]);
    expect(groupCore.deviceIds).toEqual([]);
    expect(groupCore.group).toBeUndefined();
    expect(groupCore.groupId).toBeUndefined();
    expect(groupCore.groupName).toEqual("");
    expect(groupCore.status).toEqual({});
  });

  it("bind group, with groups and devices", () => {
    spyOn(ims, 'getUIModelName').and.callFake((device) => {
      if (!device) return null;
      return device.profile.esh.model;
    });
    spyOn(ims, 'getUIModelFromName').and.callFake((device) => {
      if (!device) return null;
      return cloneDeep(rasModel);
    });

    const devices = fakeDevices;
    const group = {
      name: 'a group name',
      devices: ['foo'],
      properties: {
        displayName: 'blub'
      }
    };
    const groupCore = groupInjector.bind(groupInjector.create(), group , devices);

    expect(groupCore.deviceIds).toEqual(['foo']);
    expect(groupCore.group).toEqual({
      name: 'a group name',
      devices: ['foo'],
      properties: {
        displayName: 'blub'
      }
    });
    expect(groupCore.groupId).toEqual('a group name');
    expect(groupCore.groupName).toEqual('blub');
    expect(groupCore.status).toEqual({ H00: 0, H02: 33 });
  });

  it("bind group, with groups and devices are not available", () => {
    spyOn(ims, 'getUIModelName').and.callFake((device) => {
      if (!device) return null;
      return device.profile.esh.model;
    });
    spyOn(ims, 'getUIModelFromName').and.callFake((device) => {
      if (!device) return null;
      return cloneDeep(rasModel);
    });
    spyOn(ctrlSrv, 'isAvailable').and.returnValue(false);

    const devices = fakeDevices;
    const group = {
      name: 'a group name',
      devices: ['foo'],
      properties: {
        displayName: 'blub'
      }
    };
    const groupCore = groupInjector.bind(groupInjector.create(), group , devices);

    expect(groupCore.deviceIds).toEqual(['foo']);
    expect(groupCore.group).toEqual({
      name: 'a group name',
      devices: ['foo'],
      properties: {
        displayName: 'blub'
      }
    });
    expect(groupCore.groupId).toEqual('a group name');
    expect(groupCore.groupName).toEqual('blub');
    expect(groupCore.status).toEqual({ H00: undefined, H02: undefined });
  });

  it("bind group, with groups and devices without status", () => {
    spyOn(ims, "getUIModelName").and.callFake(device => {
      if (!device) return null;
      return device.profile.esh.model;
    });
    spyOn(ims, "getUIModelFromName").and.callFake(device => {
      if (!device) return null;
      return cloneDeep(rasModel);
    });

    const devices = fakeDevicesWithoutStatus;
    const group = {
      name: 'a group name',
      devices: ['foo'],
      properties: {
        displayName: 'blub'
      }
    };
    const groupCore = groupInjector.bind(groupInjector.create(), group , devices);

    expect(groupCore.deviceIds).toEqual(['foo']);
    expect(groupCore.group).toEqual({
      name: 'a group name',
      devices: ['foo'],
      properties: {
        displayName: 'blub'
      }
    });
    expect(groupCore.groupId).toEqual('a group name');
    expect(groupCore.groupName).toEqual('blub');
    expect(groupCore.status).toEqual({});
  });

  it("bind group, with groups and devices, bind again", () => {
    spyOn(ims, 'getUIModelName').and.callFake((device) => {
      if (!device) return null;
      return device.profile.esh.model;
    });
    spyOn(ims, 'getUIModelFromName').and.callFake((device) => {
      if (!device) return null;
      return cloneDeep(rasModel);
    });

    const devices = fakeDevices;
    const group = {
      name: 'a group name',
      devices: ['foo'],
      properties: {
        displayName: 'blub'
      }
    };

    groupInjector.bind(groupInjector.create(), group, devices);
    const groupCore = groupInjector.bind(groupInjector.create(), group, devices);

    expect(groupCore.deviceIds).toEqual(['foo']);
    expect(groupCore.group).toEqual({
      name: 'a group name',
      devices: ['foo'],
      properties: {
        displayName: 'blub'
      }
    });
    expect(groupCore.groupId).toEqual('a group name');
    expect(groupCore.groupName).toEqual('blub');
    expect(groupCore.status).toEqual({ H00: 0, H02: 33 });
  });

  it("bind group, with groups and devices, ui model has no primary and secondary fields", () => {
    spyOn(ims, 'getUIModelName').and.callFake((device) => {
      if (!device) return null;
      return device.profile.esh.model;
    });
    spyOn(ims, 'getUIModelFromName').and.callFake((device) => {
      if (!device) return null;
      return {
        "familyName": "Nothing",
        "familyMembers": [
          "nothing.*"
        ],
        "scheduleLayout": {
          "primary": [
          ]
        },
        "deviceId": 1,
        "components": {
        },
      };
    });

    const devices = fakeDevices;
    const group = {
      name: 'a group name',
      devices: ['foo'],
      properties: {
        displayName: 'blub'
      }
    };
    const groupCore = groupInjector.bind(groupInjector.create(), group, devices);

    expect(groupCore.controllers).toEqual([]);
  });

  it("bind group, with groups and devices, ui model has correctly primary and secondary fields data", () => {
    spyOn(ims, 'getUIModelName').and.callFake((device) => {
      if (!device) return null;
      return device.profile.esh.model;
    });
    spyOn(ims, 'getUIModelFromName').and.callFake((device) => {
      if (!device) return null;
      return fakeModel;
    });

    const devices = fakeDevices;
    const group = {
      name: 'a group name',
      devices: ['foo', 'bar'],
      properties: {
        displayName: 'blub'
      }
    };
    const groupCore = groupInjector.bind(groupInjector.create(), group, devices);

    expect(groupCore.controllers).toEqual([
      {
        "type": "large-toggle",
        "title": "",
        "models": [{
          "key": "H00",
          "values": [{
              "value": 0,
              "text": "INFORMATION_MODEL.OFF"
            },
            {
              "value": 1,
              "text": "INFORMATION_MODEL.ON"
            }
          ],
        }]
      },
      {
        "type": "toggle",
        "title": "INFORMATION_MODEL.POWER",
        "models": [{
          "key": "H00",
          "values": [{
              "value": 0,
              "text": "INFORMATION_MODEL.OFF"
            },
            {
              "value": 1,
              "text": "INFORMATION_MODEL.ON"
            }
          ],
        }]
      }
    ]);
  });

  it("bind group, with two devices in a groups and devices", () => {
    spyOn(ims, 'getUIModelName').and.callFake((device) => {
      if (!device) return null;
      return device.profile.esh.model;
    });
    spyOn(ims, 'getUIModelFromName').and.callFake((device) => {
      if (!device) return null;
      return {
        "familyName": "Fake",
        "familyMembers": [
          "fake.*"
        ],
        "controlLayout": {
          "primary": [
            "FAN"
          ],
          "secondary": [
            "AC_TEMP",
          ]
        },
        "scheduleLayout": {
          "primary": [
          ]
        },
        "deviceId": 1,
        "components": {
          "AC_POWER_AND_TEMP": {
            "type": "large-toggle",
            "title": "",
            "models": [{
              "key": "H00",
              "values": [{
                  "value": 0,
                  "text": "INFORMATION_MODEL.OFF"
                },
                {
                  "value": 1,
                  "text": "INFORMATION_MODEL.ON"
                }
              ],
            }]
          },
          "AC_POWER": {
            "type": "toggle",
            "title": "INFORMATION_MODEL.POWER",
            "models": [{
              "key": "H00",
              "values": [{
                  "value": 0,
                  "text": "INFORMATION_MODEL.OFF"
                },
                {
                  "value": 1,
                  "text": "INFORMATION_MODEL.ON"
                }
              ],
            }]
          },
        },
      };
    });

    const devices = fakeDevices;
    const group = {
      name: 'a group name',
      devices: ['foo', 'bar'],
      properties: {
        displayName: 'blub'
      }
    };
    const groupCore = groupInjector.bind(groupInjector.create(), group, devices);

    expect(groupCore.controllers).toEqual([
      {
        "type": "large-toggle",
        "title": "",
        "models": [{
          "key": "H00",
          "values": [{
              "value": 0,
              "text": "INFORMATION_MODEL.OFF"
            },
            {
              "value": 1,
              "text": "INFORMATION_MODEL.ON"
            }
          ],
        }]
      },
      {
        "type": "toggle",
        "title": "INFORMATION_MODEL.POWER",
        "models": [{
          "key": "H00",
          "values": [{
              "value": 0,
              "text": "INFORMATION_MODEL.OFF"
            },
            {
              "value": 1,
              "text": "INFORMATION_MODEL.ON"
            }
          ],
        }]
      }
    ]);
  });

  it('send commands', () => {
    const devices = fakeDevices;
    const group = {
      name: 'a group name',
      devices: ['foo', 'bar'],
      properties: {
        displayName: 'blub'
      }
    };
    const spy = spyOn(ctrlSrv, 'setDevice').and.callThrough();
    const groupCore = groupInjector.bind(groupInjector.create(), group, devices);

    groupCore.send({ key: 'H00', value: 1 });
    expect(spy).toHaveBeenCalledWith('foo', Object({ H00: 1 }));
    expect(spy).toHaveBeenCalledWith('bar', Object({ H00: 1 }));
  });

  it('send commands without devices', () => {
    const devices = {};
    const group = {
      name: 'a group name',
      devices: ['foo', 'bar'],
      properties: {
        displayName: 'blub'
      }
    };
    const spy = spyOn(ctrlSrv, 'setDevice').and.callThrough();
    const groupCore = groupInjector.bind(groupInjector.create(), group, devices);

    groupCore.send({ key: 'H00', value: 1 });
    expect(spy).not.toHaveBeenCalled();
  });

  it('send commands with devices are not connected', () => {
    const devices = {
      'foo': {
        device: 'foo',
        connected: 0,
        profile: {
          esh: {
            class: 123,
            eshVersion: '4.0.0',
            deviceId: 1,
            brand: 'ACCompany1',
            model: 'AC001',
          },
        },
        status: {
          H00: 0,
          H02: 33,
        },
      }
    };
    const group = {
      name: 'a group name',
      devices: ['foo', 'bar'],
      properties: {
        displayName: 'blub'
      }
    };
    const spy = spyOn(ctrlSrv, 'setDevice').and.callThrough();
    const groupCore = groupInjector.bind(groupInjector.create(), group, devices);

    groupCore.send({ key: 'H00', value: 1 });
    expect(spy).not.toHaveBeenCalled();
  });
});
