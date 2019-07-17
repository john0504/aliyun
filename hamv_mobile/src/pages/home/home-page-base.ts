import {
  NavController,
  Platform,
} from 'ionic-angular';
import { Storage } from '@ionic/storage';
import {
  Group,
  StateStore,
  AppEngine,
} from 'app-engine';
import { TranslateService } from '@ngx-translate/core';
import {
  Observable,
  Subscription,
} from 'rxjs';
import { combineLatest } from 'rxjs/observable/combineLatest';
import {
  pairwise,
  tap,
} from 'rxjs/operators';
import isEqual from 'lodash/isEqual';

import { debounceImmediate } from '../../app/app.extends';
import { ThemeService } from '../../providers/theme-service';

import { ScrollableTabsOptions } from '../../components/scrollable-tabs/scrollable-tabs-options';
import {
  connect,
  IClientOptions,
  MqttClient
} from 'mqtt';

const TAB_CONFIG = 'tabConfig';

export abstract class HomePageBase {

  protected groupComponent;
  protected deviceComponent;

  private account$: Observable<any>;
  private deviceDisplayList$: Observable<any>;
  private groupDisplayList$: Observable<any>;
  private groups$: Observable<any>;
  private subs: Array<Subscription>;
  private userData$: Observable<any>;

  isLoggedIn: boolean = false;
  selectedGroup;
  groupsList: Array<any> = [];
  ready: boolean = false;
  tabs: Array<ScrollableTabsOptions> = [];
  currentTab: number = 0;
  myDevicesGroup: Group;
  accountToken;
  public client: MqttClient;
  topicR;
  public _deviceList =
    [];
  /*
  [{
    DevName: "test1",
    DevNo: "CLAW_0111",
    H60: 1,
    H61: 2,
    H62: 3,
    Status: 1,
    ExpireTime: this.getDate(1593077109),
    showDetails: false
  }, {
    DevName: "test2",
    DevNo: "CLAW_0222",
    H60: 4,
    H61: 5,
    H62: 6,
    Status: 0,
    ExpireTime: this.getDate(1594077109),
    showDetails: false
  }];*/

  opts: IClientOptions = {
    port: 9001,
    host: this.appEngine.getBaseUrl(),
    protocol: 'mqtt',
    key: "-----BEGIN RSA PRIVATE KEY-----\
    MIIEowIBAAKCAQEAlYpAETkvl0UkuAd8JTQknZ9hnnLY9xVVAGLFV7Q4vPIYYtFs\
    hXoWLygMqYT3u0ie3eaTkxj3KmgtZ9sejYYO6wBTRfmaIa4yRZmymrQMZMjE4hUR\
    68+XnR4/pyPvBNTYDDhsuHZiN6tuaZOYAv8Se/PQH5UD3UL6FYDlkV0dCIquDpZv\
    bWdtIvL0XVtVGOAMPLxcV3dpn4GZb+0NJRnhZIjyRZIIDG610QV3eLLp10agJYT/\
    +7Ld+Reh5OoB6lLhOYV+0HbUBfOzktLRetW32yM2qj/FLwPaiwgxIh8MId4BnZDZ\
    +fbIcdCzrhptvUECQdKxV11IQ03Cg31R9fonsQIDAQABAoIBAEIh5Nl5F9HnMyjr\
    rnxphfPrQ2mmUstatL+57potypXM3vn8seiJqHvsU0U417IMmK17xjHcbZpkfggb\
    AHUIH1rQRwOAMijI99SN902xaHW90ExHkyhdIyjJ8s6A9riFRJKK9ZHSUPdbqjWo\
    nyZcFZmZpqYA6beVYjHWUjAqJKfct7Etlm8ObA0PK3Rq3/Aaf9DPzxXuZuzk3dQU\
    4WpIpm54dK7ev8xCLlwCygksmZUHi4y53zbbusohIHnISgsVPdnAjVs3mu+MaogA\
    Y1aI1ssNWRebW+1/GedxtXdZ7nT6OD85mpyjnsrzWO9XxCtePK8Z4Ofx4kvjaYU0\
    c4rePgECgYEAxfc/Hg+RMBLwQ78YIUJ4BbLGOaktK+1ybE5H6bgebhynAMCTr9RJ\
    TVtXj/MsxvjtnZJ0NnSoPmjpg6wpPKGXe4Rzms+8j2rmdf3oxnA98FKotUBlU/CB\
    pRrCLN5TtO6SfPoLxYItot5Dp5XTv/obnBOO+HW+VY3oZLKuW3d9JZECgYEAwWDK\
    uKj4Od6iJu/NvcLmVbRIVYZF9VgAlAQTVyPdMRiH+Lcf3i1Mt5u/SW7fA30vqKVN\
    L6nDen5LZvOTrlDNeoIuRzboessXC1HP+8UstK0WzxAOMFVeGMxFKSHa9Wnkplc0\
    wZjGKFF9TurcU+fH4t6vaUOs3ctrKn3pyAfrUCECgYB9wCbJ052oaf9RKWwMhIp1\
    JDCipAJbqwNKJRetMRWzYGP9KFcoE7NUfjdK62+AHNPjigpkJQpSSpY62/t91i/B\
    eEtvBZKDj6ZBQT7B/r55kCg2qmczQM05sZuyoK+PeRR4auVbWuveT02ugI/3nMo5\
    BHuG/FQhSHlcrdvvoiFO4QKBgEYug8RbBqOyCjWJaKkLGB9Yq7vmXHN7edI+XGqO\
    yJMt7QM2KumulR4590WGaIfSoj5Zp9a5jQli1qjJk/p6tuhUYMlVwy/1jyp7ibk9\
    SUlVXGbP0+Z0xQ7I6/zOnbHdua8pDSuJ77joQksm78m/4AqVeSIB/rYMQpuMURFY\
    1m0hAoGBAJ8rFnYgC7YEGWK2il2zoiS2UHNa+anWIqrgDUhq7YYTSR4W4lq33Kks\
    ORrrcgtMrDDNAMSMyRLjOUxtlFKfsMsMLG4ia+4NeyfkL9pD6a3KpQSfo1OJMvBU\
    Nngghy4nd+j5a0FEzG+NTSGjieR3fMru7WJULyP9LRuAz8jp8oFa\
    -----END RSA PRIVATE KEY-----\
    ",
    cert: "-----BEGIN CERTIFICATE-----\
    MIIDsDCCApgCFB/TnYdbA2g/2PZqGTphTKssVEjmMA0GCSqGSIb3DQEBCwUAMIGT\
    MQswCQYDVQQGEwJUVzEPMA0GA1UECAwGVGFpd2FuMRAwDgYDVQQHDAdIc2luY2h1\
    MSgwJgYDVQQKDB9DbG91ZCBFZGdlIENvbXB1dGluZyBUZWNobm9sb2d5MRcwFQYD\
    VQQLDA53d3cuY2VjdGNvLmNvbTEeMBwGA1UEAwwVQ0VDVENPIEdsb2JhbCBSb290\
    IENBMB4XDTE5MDcxNzA3MTI1MFoXDTM4MDkxNTA3MTI1MFowgZQxCzAJBgNVBAYT\
    AlRXMQ8wDQYDVQQIDAZUYWl3YW4xEDAOBgNVBAcMB0hzaW5jaHUxKTAnBgNVBAoM\
    IENsb3VkIEVkZ2UgQ29tcHV0dGluZyBUZWNobm9sb2d5MRcwFQYDVQQLDA53d3cu\
    Y2VjdGNvLmNvbTEeMBwGA1UEAwwVQ0VDVENPIFdBV0EgQ2xpZW50IENBMIIBIjAN\
    BgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAlYpAETkvl0UkuAd8JTQknZ9hnnLY\
    9xVVAGLFV7Q4vPIYYtFshXoWLygMqYT3u0ie3eaTkxj3KmgtZ9sejYYO6wBTRfma\
    Ia4yRZmymrQMZMjE4hUR68+XnR4/pyPvBNTYDDhsuHZiN6tuaZOYAv8Se/PQH5UD\
    3UL6FYDlkV0dCIquDpZvbWdtIvL0XVtVGOAMPLxcV3dpn4GZb+0NJRnhZIjyRZII\
    DG610QV3eLLp10agJYT/+7Ld+Reh5OoB6lLhOYV+0HbUBfOzktLRetW32yM2qj/F\
    LwPaiwgxIh8MId4BnZDZ+fbIcdCzrhptvUECQdKxV11IQ03Cg31R9fonsQIDAQAB\
    MA0GCSqGSIb3DQEBCwUAA4IBAQDBpSMzl1nYBD272Wc0n8qrSG3psxo6PsQtL6I+\
    li497DiirQ2dXtkvbgZFCccHqLH2M7M6+bZnJV3wuuQD5lcDKUBBFjkiHxOZa+Hg\
    XIFbnoUu4KmHvEBj0FpGa2xtrEhlc8B7hEImlNp38sthFW6/95F9vJoYXRo47VWH\
    vFK5kTZbjo2K+6I3V3j/JO68HM07bhi2cGC6UEIajEnMnba3Svb93B33b8/hP8yy\
    tBUuwcFARdQRkPucgQ04ABjtnKQdhs9C3OAkeZBqcnNBsh4atU1HFbyyVISex4Tq\
    VXxT5amv/KY9NFZadL9YyowKEBJRzlZI9tWF5RRHU63rLSIW\
    -----END CERTIFICATE-----\
    ",
    ca: "-----BEGIN CERTIFICATE-----\
    MIIECzCCAvOgAwIBAgIUQtu6MKO0TmvTU1dPv+xFFUQV1LQwDQYJKoZIhvcNAQEL\
    BQAwgZMxCzAJBgNVBAYTAlRXMQ8wDQYDVQQIDAZUYWl3YW4xEDAOBgNVBAcMB0hz\
    aW5jaHUxKDAmBgNVBAoMH0Nsb3VkIEVkZ2UgQ29tcHV0aW5nIFRlY2hub2xvZ3kx\
    FzAVBgNVBAsMDnd3dy5jZWN0Y28uY29tMR4wHAYDVQQDDBVDRUNUQ08gR2xvYmFs\
    IFJvb3QgQ0EwIBcNMTkwNzE3MDM0MTI4WhgPMjExOTA2MjMwMzQxMjhaMIGTMQsw\
    CQYDVQQGEwJUVzEPMA0GA1UECAwGVGFpd2FuMRAwDgYDVQQHDAdIc2luY2h1MSgw\
    JgYDVQQKDB9DbG91ZCBFZGdlIENvbXB1dGluZyBUZWNobm9sb2d5MRcwFQYDVQQL\
    DA53d3cuY2VjdGNvLmNvbTEeMBwGA1UEAwwVQ0VDVENPIEdsb2JhbCBSb290IENB\
    MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA3w433S7ceossD3VuF86t\
    6kM5iX2Gly1pi6BU0oN9EUsyCI6V5Zr/lkXDa2KSRG8Ddawkx84sNHXAR0Or4TS2\
    4T/fRjO7rcq6/yd4vvLua53SYorKOokrOcTaF3rNIMCAlMmC/I0mujTWmQONUqqA\
    WsJwUaQiJ6Puiz2OKXacIOA+xuSBxMw5xkK7ItOjds+FRHKpIMGognPLAuucwh72\
    ufeW2k5MjS1Y/6gqO3Y7Mn2eNeV3uwVaA6KhUeklVdweH0awE5dqAbTRAbitaKWd\
    4WZWcVwz1tf6vHbBETy5AjQlHWUUz3JQrO58M0wpmOwn4/PKaIBDUIDw1H40ZJFS\
    vwIDAQABo1MwUTAdBgNVHQ4EFgQUPp26Pgvly2TihTk/MuUhyJPlf6owHwYDVR0j\
    BBgwFoAUPp26Pgvly2TihTk/MuUhyJPlf6owDwYDVR0TAQH/BAUwAwEB/zANBgkq\
    hkiG9w0BAQsFAAOCAQEAHvs2iSp8QAxKXhgx0yXkSXD/AjOiSvpcBkW3f3UDTdjd\
    EDb4vt6FiafFcAcoIsqchh5UivFAnlF1PXRYXQsVAPzQaMOV7KVg5qaLfoATWB5O\
    2vYOxhEIElUyEEvs9YDfslL8eBKqHOcdwJiQdGhvgIOqWnpUtP4Nbv8U4n7nT5HA\
    sHwwlhAqK+LGWb700d2YPS8dAvjbIGr9cnxOZEmdkbBCa3vmJr7ZgX9RCGYLBcLD\
    faFHobq/rvp5x2pduVaxVXmH/A6O9gt+AaGkahrbKi0L1bGVNhPObX7IfBZVfAs/\
    pe/dZkeXtHMzMZW64/bmfMhs7kXbkJnkiba6nQENtA==\
    -----END CERTIFICATE-----\
    ",
  };

  constructor(
    private navCtrl: NavController,
    private platform: Platform,
    private stateStore: StateStore,
    private translate: TranslateService,
    private storage: Storage,
    public themeService: ThemeService,
    private appEngine: AppEngine,
  ) {
    this.subs = [];
    this.account$ = this.stateStore.account$;
    this.deviceDisplayList$ = this.stateStore.deviceDisplayList$;
    this.groupDisplayList$ = this.stateStore.groupDisplayList$;
    this.groups$ = this.stateStore.groups$;
    this.userData$ = this.stateStore.userData$;

    this.storage.get(TAB_CONFIG)
      .then(value => {
        const isValid = value && value.lastSelectedIndex >= 0;
        this.currentTab = isValid ? value.lastSelectedIndex : 0;
      });
  }

  ionViewDidEnter() {
    this.subs.push(
      this.account$
        .pipe(
          tap(account => this.isLoggedIn = account && account.isLoggedIn),
          pairwise()
        )
        .subscribe(([oldAccount, newAccount]) => {
          const oldLoginState = oldAccount && oldAccount.isLoggedIn;
          const newLoginState = newAccount && newAccount.isLoggedIn;
          if (!oldLoginState && newLoginState) this.ready = false;
        })
    );
    this.subs.push(
      combineLatest(this.deviceDisplayList$, this.groups$, this.groupDisplayList$, this.userData$, this.translate.stream(['HOME']))
        .pipe(
          debounceImmediate(500),
          tap(() => {
            if (!this.ready) this.ready = true;
          })
        )
        .subscribe(latestValues => this.processValues(latestValues))
    );
    this.subs.push(
      this.account$
        .pipe(debounceImmediate(500))
        .subscribe(account => {
          console.log(JSON.stringify(account));
          this.accountToken = (account && account.token) || '';
          
          this.client = connect('', this.opts);
          this.client.on('connect', () => {

            if (this._deviceList.length == 0) {
              var topicG = `CECT/WAWA/${this.accountToken}/G`;
              this.client.publish(topicG, "{}", { qos: 1, retain: true });
            }

            this.topicR = `CECT/WAWA/${this.accountToken}/R`;
            this.client.subscribe(this.topicR, (err) => {
              if (!err) {
                this.client.on('message', (topic, message) => {
                  console.log(message.toString());
                  var obj = JSON.parse(message.toString());
                  if (topic == this.topicR) {
                    if (obj && obj.data) {
                      for (var i = 0; i < obj.data.length; i++) {
                        var topic = `CECT/WAWA/${obj.data[i].DevNo}/U`;
                        obj.data[i].topic = topic;
                        obj.data[i].ExpireTime = this.getDate(obj.data[i].ExpireDate);
                        if (Date.now() / 1000 <= obj.data[i].ExpireDate) {
                          this.client.subscribe(topic);
                        } else {
                          this.client.unsubscribe(topic);
                        }
                      }
                      this._deviceList = obj.data;
                    }
                  } else {
                    for (i = 0; i < this._deviceList.length; i++) {
                      if (topic == this._deviceList[i].topic) {
                        Object.assign(this._deviceList[i], obj);
                      }
                    }
                  }
                });
              }
            });
          });
        })
    );
  }

  ionViewWillLeave() {
    this.subs && this.subs.forEach((s) => {
      s.unsubscribe();
    });
    this.subs.length = 0;
    this.client.unsubscribe(this.topicR);
    for (var i = 0; i < this._deviceList.length; i++) {
      this.client.unsubscribe(this._deviceList[i].topic);
    }
  }

  private createTabsFromGroups(groups) {
    const tabs = groups.map((group) => {
      let title = this.translate.instant('HOME.LOADING'); // placeholder
      if (group && group.properties && group.properties.displayName) {
        title = group.properties.displayName;
      }
      return ({ title });
    });

    return tabs;
  }

  private processValues(latestValues) {
    const [
      deviceDisplayList,
      groups,
      groupDisplayList,
      userData,
    ] = latestValues;
    const groupsList = [];
    const { groupDisplayOrder } = userData;
    const groupOrder = groupDisplayOrder ? groupDisplayOrder : groupDisplayList;

    this.myDevicesGroup = this.generateGroup(deviceDisplayList, groups, groupOrder);
    this.myDevicesGroup.properties['displayName'] = this.translate.instant('MY_DEVICES.ALL_DEVICES');

    for (const groupId of groupOrder) {
      groupsList.push(groups[groupId]);
    }

    this.groupsList = groupsList;
    const tabs = this.createTabsFromGroups(groupsList);
    tabs.unshift({
      title: this.translate.instant('HOME.ALL'),
    });
    if (!isEqual(this.tabs, tabs)) {
      this.tabs = tabs;
    }
    if (this.currentTab > this.groupsList.length) {
      this.currentTab = 0;
    }
    this.selectGroup(this.currentTab);
  }

  isIOS(): boolean {
    return this.platform.is('ios');
  }

  goGroupDetail({ name }) {
    this.navCtrl.push('GroupDetailPage', { groupId: name });
  }

  tabSelected(tab) {
    const tabIndex = tab.index;
    const tabConfig = {
      lastSelectedIndex: tab.index,
    };
    this.currentTab = tab.index;
    this.storage.set(TAB_CONFIG, tabConfig);
    this.selectGroup(tabIndex);
  }

  private generateGroup(deviceDisplayList, groups, groupDisplayList = []): Group {
    let myDevices = [];

    groupDisplayList
      .forEach(groupId => {
        const g = groups[groupId];
        if (g && g.devices) myDevices = myDevices.concat(g.devices);
      });

    deviceDisplayList.forEach((deviceSn) => {
      const found = groupDisplayList.some((groupId) => {
        const group = groups[groupId];
        return group && group.devices && group.devices.some(dSn => (dSn === deviceSn));
      });

      if (!found) {
        myDevices.push(deviceSn);
      }
    });

    return {
      name: '__my_devices_group__',
      devices: myDevices,
      properties: {
      },
    };
  }

  private selectGroup(tabIndex) {
    if (tabIndex > 0) {
      this.selectedGroup = this.groupsList[tabIndex - 1];
    } else {
      this.selectedGroup = null;
    }
  }

  public getDate(timestamp) {
    var date = new Date(timestamp * 1000);
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  }
}
