import { Schedule } from './schedule';

export interface Device {
    device: string;
    connected: number;
    deviceState: string;
    profile: Profile;
    calendar?: Array<Schedule>;
    status; // status map
    fields: Array<any>;
    fields_range?: Array<string>;
    users?: Array<User>;
    groups?: Array<string>;
    role: string;
    owner: string;
    properties;
}

export interface Profile {
    esh: Esh;
    module: Module;
    cert: Cert;
}

export interface Esh {
    class: string;
    eshVersion: string;
    deviceId: string;
    brand: string;
    model: string;
}

export interface Module {
    firmwareVersion: string;
    macAddress: string;
    localIp: string;
    ssid: string;
}

export interface Cert {
    fingerprint: Fingerprint;
    validity: Validity;
}

export interface Fingerprint {
    sha1: string;
}

export interface Validity {
    notBefore: string;
    notAfter: string;
}

export interface User {
    email: string;
    role: string;
}

export interface UserRole {
    role: string;
}
