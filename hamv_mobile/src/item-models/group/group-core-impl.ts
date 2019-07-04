import { Group } from 'app-engine';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';

import { InformationModelService } from "../../modules/information-model";
import { DeviceControlService } from "../../providers/device-control-service";
import { GroupCore } from "./group-core";
export class GroupCoreImpl implements GroupCore {
  private _controllers: Array<any>;
  private _devices: Array<any>;
  private _group: Group;
  private _possibleModelsNames;
  private _state;

  constructor(
    private deviceCtrlService: DeviceControlService,
    private ims: InformationModelService,
  ) {
    this._controllers = [];
    this._devices = [];

    this._state = {};
  }

  public bind(group: Group) {
    this._group = cloneDeep(group);
  }

  get group(): Group {
    return this._group;
  }

  get groupId(): string {
    return this._group && this._group.name;
  }

  get groupName(): string {
    const name = this._group && this._group.properties && this._group.properties["displayName"];
    return name || '';
  }

  get controllers(): Array<any> {
    return this._controllers;
  }

  get deviceIds(): Array<string> {
    return (this._group && this._group.devices) || [];
  }

  get status() {
    return this._state;
  }

  private cleanRelationship(uiModels) {
    uiModels.forEach(model => {
      const components = model.components;
      const removeKeys = Object.keys(components).filter(
        component => components[component].hideFromGroup
      );

      removeKeys.map(key => {
        if (components[key]) {
          delete components[key];
        }
      });

      for (let key in components) {
        const component = components[key];
        const models = component.models;
        models &&
          models.forEach(ctrl => {
            delete ctrl.dependency;
            delete ctrl.disable;
          });
      }
    });
  }

  private filterPossibleModels() {
    const possibleModelNames = [];
    this._devices.forEach((device) => {
      const modelName = this.ims.getUIModelName(device);
      possibleModelNames.push(modelName);
    });
    if (possibleModelNames.some(t => !t)) return [];

    return possibleModelNames.filter((v, i, a) => a.indexOf(v) === i);
  }

  private generateControls(possibleModelNames) {
    const uiModels = [];
    for (let modelName of possibleModelNames) {
      uiModels.push(this.ims.getUIModelFromName(modelName));
    }

    if (!uiModels || uiModels.length <= 0) return [];
    this.cleanRelationship(uiModels);
    if (uiModels.length === 1) {
      const uiModel = uiModels[0];
      return this.getControlsFromModel(uiModel);
    } else {
      const controls = this.generateGroupControlsFromControlLayouts(uiModels);
      return controls.length > 0
        ? controls
        : this.generateGroupControlsFromComponentRepository(uiModels);
    }
  }

  private getControlsFromModel(uiModel) {
    const uiControls = [];
    const controlLayout = uiModel.controlLayout;
    if (controlLayout && controlLayout.primary) {
      controlLayout.primary.forEach(name => {
        let m = uiModel.components[name];
        if (m) {
          uiControls.push(m);
        }
      });
    }
    if (controlLayout && controlLayout.secondary) {
      controlLayout.secondary.forEach(name => {
        let m = uiModel.components[name];
        if (m) {
          uiControls.push(m);
        }
      });
    }
    return uiControls;
  }

  private generateGroupControlsFromControlLayouts(uiModels) {
    const controlMaps = {};
    let shortestCtrls;
    let length = Number.MAX_SAFE_INTEGER;
    uiModels.forEach(uiModel => {
      const c = this.getControlsFromModel(uiModel);
      controlMaps[uiModel.familyName] = c;
      if (c.length < length) {
        shortestCtrls = { name: uiModel.familyName, ctrls: c };
        length = c.length;
      }
    });
    delete controlMaps[shortestCtrls.name];
    const controls = [];
    for (let candidate of shortestCtrls.ctrls) {
      let voted = true;
      for (let key in controlMaps) {
        const temp = controlMaps[key];
        voted = voted && temp.some(ctrl => isEqual(ctrl, candidate));
        if (!voted) break;
      }
      if (voted) {
        controls.push(candidate);
      }
    }
    return controls;
  }

  private generateGroupControlsFromComponentRepository(uiModels) {
    const controlMaps = {};
    let shortestCtrls;
    let length = Number.MAX_SAFE_INTEGER;
    uiModels.forEach(uiModel => {
      const c = uiModel.components;
      controlMaps[uiModel.familyName] = c;
      const cLength = Object.keys(c).length;
      if (cLength < length) {
        shortestCtrls = { name: uiModel.familyName, ctrls: c };
        length = cLength;
      }
    });
    delete controlMaps[shortestCtrls.name];
    const controls = [];
    for (let key in shortestCtrls.ctrls) {
      const candidate = shortestCtrls.ctrls[key];
      let voted = true;
      for (let key in controlMaps) {
        let temp = controlMaps[key];
        let found = false;
        for (let cName in temp) {
          let ctrl = temp[cName];
          if (isEqual(ctrl, candidate)) {
            found = true;
            break;
          }
        }
        voted = voted && found;
        if (!voted) break;
      }
      if (voted) {
        controls.push(candidate);
      }
    }
    return controls;
  }

  public send({ key, value }) {
    const hasDevices = this.hasDevices();
    if (hasDevices) {
      this._devices.forEach(({ device: deviceId, connected }) => {
        if (connected) {
          let cmd = {};
          cmd[key] = value;
          this.deviceCtrlService.setDevice(deviceId, cmd);

          this._state = Object.assign({}, this._state, cmd);
        }
      });
    }
  }

  private hasDevices() {
    return this._devices.length > 0;
  }

  public update(allDevices = {}) {
    const groupDevices = this._group ? [...this._group.devices] : [];
    const hasDevices = Object.keys(allDevices).length > 0;
    const devices = hasDevices ? groupDevices.map(deviceId => allDevices[deviceId]) : [];
    this._devices = devices.filter(device => device);
  }

  public selfUpdate() {
    const hasDevices = this.hasDevices();

    if (hasDevices) {
      const possibleModelsNames = this.filterPossibleModels();
      if (!isEqual(possibleModelsNames, this._possibleModelsNames)) {
        this._possibleModelsNames = possibleModelsNames;
        this._controllers = this.generateControls(possibleModelsNames);
      }
      this._state = this.updateState(this._state);
    } else {
      this._controllers.length = 0;
    }
  }

  private updateState(current) {
    const temp = {};
    this._devices.forEach(({ status }) => {
      if (status) {
        for (const key in status) {
          if (!temp[key]) {
            temp[key] = { value: status[key], keep: true, count: 1 };
          } else if (temp[key].value === status[key]) {
            temp[key].count++;
          } else {
            temp[key].keep = false;
          }
        }
      }
    });

    const oldState = current.state || {};
    const state = {};
    for (const key in temp) {
      const item = temp[key];
      const hasAvailableDevices = this._devices.some(({ device: deviceId }) => this.deviceCtrlService.isAvailable(deviceId, key));
      if (item.keep && item.count === this._devices.length) {
        if (hasAvailableDevices) {
          state[key] = item.value;
        } else {
          state[key] = oldState[key];
        }
      }
    }

    let status: any = state;
    if (!isEqual(current, status)) {
      status = Object.assign({}, current, status);
    }

    return status;
  }
}
