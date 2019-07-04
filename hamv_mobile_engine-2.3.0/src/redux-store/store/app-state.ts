import { ZeroconfService } from '@ionic-native/zeroconf';
import { Account } from '../../core/models/account';
import { UserMe } from '../../core/models/user-me';

export interface AppState {

    isInitialized: boolean;

    account?: Account;

    isAuthenticated: boolean;

    userData?;
    
    userMe?: UserMe;

    // device map, key => device serial number, value => device object
    devices;

    // device sn array, let app know how to display device
    deviceDisplayList: Array<string>;

    // group map, key => group id (group name), value => group object
    groups;

    // group id (group name) array, let app know how to display group
    groupDisplayList: Array<string>;

    //Dnssd
    dnssdServices: Array<ZeroconfService>;
}
