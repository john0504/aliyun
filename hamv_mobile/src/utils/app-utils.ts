import { Device, Group } from 'app-engine';
import includes from 'lodash/includes';

export class AppUtils {

  public static isOwner(device: Device, account: string): boolean {
    if (device && account && Array.isArray(device.users)) {
      return device.users.some(user => user.email && user.email.toLocaleLowerCase() === account.toLocaleLowerCase() && user.role === 'owner');
    }
    return false;
  }

  public static isDeviceOnline(device: Device): boolean {
    return device && device.connected === 1;
  }

  public static isDeviceUpdate(device: Device): boolean {
    return device && device.deviceState === "updating";
  }

  public static isSupported(device: Device, saa: string) {
    return device && device.fields && includes(device.fields, saa);
  }

  public static compareDevice(a: Device, b: Device): number {
    let aName = '';
    if (a && a.properties && a.properties.displayName) {
      aName = a.properties.displayName;
    } else if (a && a.profile && a.profile.esh && a.profile.esh.model) {
      aName = a.profile.esh.model;
    }
    let bName = '';
    if (b && b.properties && b.properties.displayName) {
      bName = b.properties.displayName;
    } else if (b && b.profile && b.profile.esh && b.profile.esh.model) {
      bName = b.profile.esh.model;
    }
    return aName.localeCompare(bName);
  }

  public static getFormatTime(hour: number) {
    // Return the time format 'HH:mm'
    let hourS = hour < 10 ? '0' + hour : new String(hour);
    return hourS + ':00';
  }

  public static compareGroup(a: Group, b: Group): number {
    let aName = '';
    if (a && a.properties && a.properties.displayName) {
      aName = a.properties.displayName;
    }
    let bName = '';
    if (b && b.properties && b.properties.displayName) {
      bName = b.properties.displayName;
    }
    return aName.localeCompare(bName);
  }

  public static compareWifiSignalStrength(a, b): number {
    if (!(a && a.dbm)) return 1;
    if (!(b && b.dbm)) return -1;
    return -(a.dbm - b.dbm);
  }

  public static validateCommands(commands: Object): Object {
    if (!commands) return {};
    for (let key of Object.keys(commands)) {
      if (!AppUtils.isValidCommandId(key) ||
        !AppUtils.isNumeric(commands[key])) {
        delete commands[key];
      }
    }
    return commands;
  }

  public static isValidCommandId(key: string): boolean {
    return /^H[0-9A-F]{2}$/.test(key);
  }

  public static isNumeric(n): boolean {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }
}
