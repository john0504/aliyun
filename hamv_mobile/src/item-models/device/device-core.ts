import {
  Device,
  Schedule,
} from 'app-engine';

import { Updatable } from '../updatable';

export interface DeviceCore extends Updatable {
  device: Device;
  deviceSn: string;
  deviceName: string;
  displayName: string;
  status;
  firmwareVersion: string;
  model: string;
  macAddress: string;
  properties: Object;
  calendar: Array<Schedule>;
  hasHistoryComponents: boolean;
  isConnected: boolean;
  isUpdating: boolean;
  isAvailable: boolean;
  thumbnail;
  banner;
  informationModel;
  controllers: Array<any>;
  chartComponents: Array<any>;
  primaryControllers: Array<any>;
  secondaryControllers: Array<any>;
  actions: Array<any>;
  primaryActions: Array<any>;
  secondaryActions: Array<any>;

  send(event: { key, value });
  sendCommands(commands: { [key: string]: any });
  filterActions(esh: Object, defaultActions?: Object): Object;
  isOwner(account: string): boolean;
}
