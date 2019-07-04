import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { debounceTime, filter } from 'rxjs/operators';
// import mixpanel from 'mixpanel-browser';

import {
  AppTasks,
  NetworkError,
  ResponseError,
  StateStore,
  TimeoutError,
} from 'app-engine';

import { AppUtils } from '../utils/app-utils';
import { InformationModelService } from '../modules/information-model';
import { PopupService } from './popup-service';

@Injectable()
export class DeviceControlService {

  private commandBuffer: Map<string, Object>;
  private currentCommand: Map<string, Object>;
  private subject: Subject<string>;
  private executors: Map<string, Subscription>;
  private devices;

  constructor(
    private appTasks: AppTasks,
    private ims: InformationModelService,
    private stateStore: StateStore,
    private popupService: PopupService,
    private translate: TranslateService,
  ) {
    this.commandBuffer = new Map<string, Object>();
    this.currentCommand = new Map<string, Object>();
    this.subject = new Subject<string>();
    this.executors = new Map<string, Subscription>();
    this.stateStore.devices$
      .subscribe(devices => this.devices = devices);
  }

  public setDevice(sn: string, commands: Object) {
    this.pushToQueue(sn, commands);
    this.setExecutor(sn);
    this.subject.next(sn);
  }

  private pushToQueue(sn: string, commands: Object) {
    if (!this.currentCommand.has(sn)) {
      this.currentCommand.set(sn, {});
    }
    let oldCommands = this.commandBuffer.get(sn) || {};
    this.setLock(sn, oldCommands, false);
    let mergedCommands = Object.assign(oldCommands, commands);
    this.setLock(sn, mergedCommands, true);
    this.commandBuffer.set(sn, mergedCommands);
  }

  private setExecutor(deviceSn) {
    if (!this.executors.has(deviceSn)) {
      let executor = this.subject
        .pipe(
          filter(sn => sn === deviceSn),
          debounceTime(500),
      )
        .subscribe((sn) => {
          let commands = this.commandBuffer.get(sn);
          this.commandBuffer.delete(sn);
          this.executeSetCommand(sn, commands);
        });
      this.executors.set(deviceSn, executor);
    }
  }

  private executeSetCommand(sn: string, commands: Object): Promise<any> {
    const newCommands = this.filterCommands(sn, commands);
    return this.appTasks.wsRequestSetTask(sn, newCommands)
      .then(() => {
        // for (let key in newCommands) {
          // mixpanel.track('Control Clicked', { key: key, value: commands[key], serialNumber: sn });
        // }
        this.setLock(sn, commands, false);
      })
      .catch(e => {
        this.setLock(sn, commands, false);
        this.handleError(e);
      });
  }

  private filterCommands(sn: string, commands: Object) {
    if (!commands || Object.keys(commands).length <= 1 ||
      !this.devices || !this.devices[sn]) return commands;
    const device = this.devices[sn];
    const uiModel = this.ims.getUIModel(device);
    if (!uiModel) return commands;
    let actions = [];
    let controlLayout = uiModel.controlLayout;
    if (controlLayout && controlLayout.primary) {
      let popular: Array<any> = [];
      controlLayout.primary.forEach((name) => {
        let m = uiModel.components[name];
        if (m) {
          popular.push(m);
        }
      });
      actions = [...popular];
    }
    if (controlLayout && controlLayout.secondary) {
      let expanded: Array<any> = [];
      controlLayout.secondary.forEach((name) => {
        let m = uiModel.components[name];
        if (m) {
          expanded.push(m);
        }
      });
      actions = [...actions, ...expanded];
    }

    return this.filter(commands, actions, commands);
  }

  public filter(commands: Object, controllers: Array<any>, defaultCommands = {}) {
    if (!controllers || controllers.length === 0) return commands;
    const newEsh = Object.assign({}, defaultCommands);
    controllers.forEach(componentModel => {
      componentModel.models.forEach(({ key, dependency, disable, values }) => {
        if (!AppUtils.isNumeric(commands[key])) return;

        const disableState = this.ims.processRules(disable, commands, key);
        if (!disableState) {
          const r = this.ims.processRules(dependency, commands, key);
          const vs = r && r.values ? r.values : values;
          if (Array.isArray(vs)) {
            newEsh[key] = vs.some(v => v.value === '*' || v.value === commands[key]) ? commands[key] : undefined;
          } else if (commands[key] >= Math.min(vs.min, vs.max) &&
            commands[key] <= Math.max(vs.min, vs.max)) {
            newEsh[key] = commands[key];
          }
        } else {
          delete newEsh[key];
        }
      });
    });

    return newEsh;
  }

  private setLock(sn: string, commands: Object, lock: boolean) {
    let cState = this.currentCommand.get(sn);
    for (let key in commands) {
      cState[key] = !cState[key] || cState[key] <= 0 ? (lock ? 1 : 0) : (lock ? ++cState[key] : --cState[key]);
    }
  }

  private handleError(e) {
    let message = '';
    if (e instanceof NetworkError) {
      message = this.translate.instant('DEVICE_CONTROL_SERVICE.NETWORK_ERROR');
    } else if (e instanceof ResponseError) {
      message = this.translate.instant('DEVICE_CONTROL_SERVICE.RESPONSE_ERROR');
    } else if (e instanceof TimeoutError) {
      message = this.translate.instant('DEVICE_CONTROL_SERVICE.TIMEOUT_ERROR');
    }
    if (message) {
      this.popupService.makeToast({
        duration: 3000,
        message,
        position: 'top',
      });
    }
  }

  public isAvailable(sn: string, commandId?: string): boolean {
    let cState = this.currentCommand.get(sn);
    let commands = this.commandBuffer.get(sn);
    if (!cState && !commands) {
      return true;
    } else if (commandId) {
      return (!cState || !cState[commandId] || cState[commandId] <= 0) && (!commands || !Number.isInteger(commands[commandId]));
    } else {
      return false;
    }
  }

  public clear() {
    this.commandBuffer.clear();
    this.currentCommand.clear();
    this.executors.forEach((subscription) => {
      subscription.unsubscribe();
    });
    this.executors.clear();
  }
}