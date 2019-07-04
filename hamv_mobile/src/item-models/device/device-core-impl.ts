import {
  AppEngine,
  Device,
  Schedule,
} from 'app-engine';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';

import { DeviceCore } from './device-core';
import { InformationModelService } from '../../modules/information-model';
import { DeviceConfigService } from '../../providers/device-config-service';
import { DeviceControlService } from '../../providers/device-control-service';
import { AppUtils } from '../../utils/app-utils';

export class DeviceCoreImpl implements DeviceCore {

  private _device: Device;
  private _im;
  private _chartComponents: Array<any>;
  private _controllers: Array<any>;
  private _primaryCtrls: Array<any>;
  private _secondaryCtrls: Array<any>;
  private _actions: Array<any>;
  private _primaryActions: Array<any>;
  private _secondaryActions: Array<any>;

  constructor(
    private configSrv: DeviceConfigService,
    private ctrlSrv: DeviceControlService,
    private ims: InformationModelService,
    private appEngine: AppEngine,
  ) {
    this._chartComponents = [];
    this._controllers = [];
    this._primaryCtrls = [];
    this._secondaryCtrls = [];
    this._actions = [];
    this._primaryActions = [];
    this._secondaryActions = [];
  }

  public bind(val: Device) {
    const newDevice = cloneDeep(val);
    if (this._device) {
      this.checkStatus(this._device, newDevice);
    }
    this._device = newDevice;
  }

  private checkStatus(old, now) {
    for (let key of Object.keys(now.status)) {
      if (!this.ctrlSrv.isAvailable(old.device, key)) {
        now.status[key] = old.status[key];
      }
    }
  }

  get device(): Device {
    return this._device;
  }

  get deviceSn(): string {
    return this._device && this._device.device ? this._device.device : '';
  }

  get deviceName(): string {
    return this.displayName || this.model;
  }

  get displayName(): string {
    return this._device && this._device.properties && this._device.properties['displayName'];
  }

  get status() {
    return this._device && this._device.status ? this._device.status : {};
  }

  get firmwareVersion(): string {
    return this._device && this._device.profile && this._device.profile.module && this._device.profile.module.firmwareVersion;
  }

  get model(): string {
    return this._device && this._device.profile && this._device.profile.esh && this._device.profile.esh.model;
  }

  get macAddress(): string {
    return this._device && this._device.profile && this._device.profile.module && this._device.profile.module.macAddress;
  }

  get properties(): Object {
    return this._device && this._device.properties;
  }

  get calendar(): Array<Schedule> {
    return this._device && this._device.calendar ? this._device.calendar : [];
  }

  get hasHistoryComponents(): boolean {
    return !!(this._im && this._im.chartComponents);
  }

  get isConnected(): boolean {
    return this.appEngine.hasCloudConnection() && AppUtils.isDeviceOnline(this._device);
  }

  get isUpdating(): boolean {
    return AppUtils.isDeviceUpdate(this._device);
  }

  get isAvailable(): boolean {
    return this.isConnected && !this.isUpdating;
  }

  get informationModel() {
    return this._im;
  }

  get thumbnail() {
    return this._im && this._im.images && this._im.images.thumbnail;
  }

  get banner() {
    return this._im && this._im.images && this._im.images.banner;
  }

  get chartComponents(): Array<any> {
    return this._chartComponents;
  }

  get controllers(): Array<any> {
    return this._controllers;
  }

  get primaryControllers(): Array<any> {
    return this._primaryCtrls;
  }

  get secondaryControllers(): Array<any> {
    return this._secondaryCtrls;
  }

  get actions(): Array<any> {
    return this._actions;
  }

  get primaryActions(): Array<any> {
    return this._primaryActions;
  }

  get secondaryActions(): Array<any> {
    return this._secondaryActions;
  }

  public selfUpdate() {
    let uiModel = this.ims.getUIModel(this._device);
    if (!uiModel) {
      this._im = uiModel;
      this._controllers.length = 0;
      this._chartComponents.length = 0;
      this._primaryCtrls.length = 0;
      this._secondaryCtrls.length = 0;
      this._actions.length = 0;
      this._primaryActions.length = 0;
      this._secondaryActions.length = 0;
    } else if (!isEqual(this._im, uiModel)) {
      this._im = uiModel;
      this.updateChartComponents(uiModel);
      this.updateControllers(uiModel);
      this.updateActions(uiModel);
      this.requestConfig(this._device.device, uiModel.config);
    }
  }

  private updateChartComponents(uiModel) {
    this._chartComponents.length = 0;

    const chartLayout = uiModel.chartLayout;
    if (chartLayout) {
      const main = chartLayout.main;
      if (main) {
        main.forEach((name) => {
          const m = uiModel.chartComponents[name];
          if (m) {
            this._chartComponents.push(m);
          }
        });
      }
    }
  }

  private updateControllers(uiModel) {
    this._controllers.length = 0;
    this._primaryCtrls.length = 0;
    this._secondaryCtrls.length = 0;
    const controlLayout = uiModel.controlLayout;
    if (controlLayout) {
      if (controlLayout.primary) {
        controlLayout.primary.forEach((name) => {
          const m = uiModel.components[name];
          if (m) this._primaryCtrls.push(m);
        });
      }

      if (controlLayout.secondary) {
        controlLayout.secondary.forEach((name) => {
          const m = uiModel.components[name];
          if (m) this._secondaryCtrls.push(m);
        });
      }

      this._controllers = [...this._primaryCtrls, ...this._secondaryCtrls];
    }
  }

  private updateActions(uiModel) {
    this._actions.length = 0;
    this._primaryActions.length = 0;
    this._secondaryActions.length = 0;
    const scheduleLayout = uiModel.scheduleLayout;
    if (scheduleLayout) {
      if (scheduleLayout.primary) {
        scheduleLayout.primary.forEach((name) => {
          const m = uiModel.components[name];
          if (m) this._primaryActions.push(m);
        });
      }

      if (scheduleLayout.secondary) {
        scheduleLayout.secondary.forEach((name) => {
          const m = uiModel.components[name];
          if (m) this._secondaryActions.push(m);
        });
      }

      this._actions = [...this._primaryActions, ...this._secondaryActions];
    }
  }

  private requestConfig(sn: string, config: Array<string>) {
    if (!sn || !config) return;
    this.configSrv.requestConfig(sn, config);
  }

  public send(event: { key: string, value: number }) {
    if (!event) return;
    const cmd = {};
    cmd[event.key] = Number(event.value);
    this.sendCommands(cmd);
  }

  public sendCommands(commands: { [key: string]: any }) {
    if (!commands) return;
    commands = AppUtils.validateCommands(commands);
    if (Object.keys(commands).length === 0) return;
    this.ctrlSrv.setDevice(this._device.device, commands);
    this._device.status = Object.assign({}, this._device.status, commands);
  }

  public filterActions(esh: Object, defaultActions?: Object): Object {
    return this.ctrlSrv.filter(esh, this._actions, defaultActions);
  }

  public isOwner(account: string): boolean {
    return AppUtils.isOwner(this._device, account);
  }
}
