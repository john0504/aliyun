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
    ExpireDate: this.getDate(1593077109),
    showDetails: false
  }, {
    DevName: "test2",
    DevNo: "CLAW_0222",
    H60: 4,
    H61: 5,
    H62: 6,
    Status: 0,
    ExpireDate: this.getDate(1594077109),
    showDetails: false
  }];*/

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
          this.accountToken = (account && account.account) || '';
          var opts: IClientOptions = {
            port: 9001,
            host: this.appEngine.getBaseUrl(),
            protocol: 'mqtt'
          };
          this.client = connect('', opts);
          this.client.on('connect', () => {
            var topicG = `CECT/WAWA/${this.accountToken}/G`;
            this.client.publish(topicG, "{}", { qos: 1, retain: true });

            var topicR = `CECT/WAWA/${this.accountToken}/R`;
            this.client.subscribe(topicR, (err) => {
              if (!err) {
                this.client.on('message', (topic, message) => {
                  console.log(message.toString());
                  var obj = JSON.parse(message.toString());
                  if (topic == topicR) {
                    if (obj && obj.data) {
                      for (var i = 0; i < obj.data.length; i++) {
                        var topic = `CECT/WAWA/${obj.data[i].DevNo}/U`;
                        obj.data[i].topic = topic;
                        if (Date.now() / 1000 <= obj.data[i].ExpireDate) {
                          this.client.subscribe(topic);
                        } else {
                          this.client.unsubscribe(topic);
                        }
                      }
                      this._deviceList = obj.data;
                    }
                  } else {
                    for (var i = 0; i < this._deviceList.length; i++) {
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
