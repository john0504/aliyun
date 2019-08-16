import {
  NavController,
  Platform,
  AlertOptions,
  AlertController,
} from 'ionic-angular';
import { Storage } from '@ionic/storage';
import {
  Group,
  StateStore,
  AppEngine,
  AppTasks
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
import { HttpClient } from '@angular/common/http';
import { PopupService } from '../../providers/popup-service';

const TAB_CONFIG = 'tabConfig';
const USER_LIST = 'userList';
const CLIENT_ID = 'clientId';

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
  accountToken = "";
  public client: MqttClient;
  topicC;
  topicD;
  public _deviceList = [];
  private _deviceListDate = 0;
  private _userList = [];
  private _timestamp = 0;
  noNetworkToast;
  messageD = "";
  updateOnline;

  opts: IClientOptions = {
    port: 9001,
    host: this.appEngine.getBaseUrl(),
    clientId: 'CECTCO-ionic',
    // protocol: 'mqtt',
    protocol: 'mqtts',
    username: 'ZWN0Y28uY29tMCAXDTE5MDcxODAzMzUyMVoYDzIxMTkwNjI0MDMzNTIxWjBlMQsw',
    password: 'CQYDVQQGEwJUVzEPMA0GA1UECAwGVGFpd2FuMRAwDgYDVQQHDAdIc2luY2h1MQ8w',
    key: "",
    cert: "",
    ca: "",
    rejectUnauthorized: false,
  };

  constructor(
    private navCtrl: NavController,
    private platform: Platform,
    private stateStore: StateStore,
    private translate: TranslateService,
    private storage: Storage,
    public themeService: ThemeService,
    private appEngine: AppEngine,
    private http: HttpClient,
    public appTasks: AppTasks,
    public alertCtrl: AlertController,
    private popupService: PopupService,
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
    this.http.get('./assets/ca/ca_bundle.crt', { responseType: "text" })
      .subscribe(cafile => this.opts.ca = cafile);
    // this.http.get('./assets/ca/ca.crt', { responseType: "text" })
    //   .subscribe(cafile => this.opts.ca = cafile);
    // this.http.get('./assets/ca/client.crt', { responseType: "text" })
    //   .subscribe(certfile => this.opts.cert = certfile);
    // this.http.get('./assets/ca/client.key', { responseType: "text" })
    //   .subscribe(keyfile => this.opts.key = keyfile);
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
          this.accountToken = (account && account.token) || '';
          if (this.accountToken.length != 0 && this.accountToken.length != 4) {
            this.logout();
          } else if (this.accountToken.length != 0) {
            this.loadUserList();
          }
        })
    );
  }

  ionViewWillLeave() {
    this.subs && this.subs.forEach((s) => {
      s.unsubscribe();
    });
    this.subs.length = 0;
    this._timestamp = 0;
    if (this.client) {
      this.client.unsubscribe(this.topicC);
      this.client.unsubscribe(this.topicD);
      this._deviceList.forEach(device => {
        this.client.unsubscribe(device.topicC);
        this.client.unsubscribe(device.topicU);
        this.client.unsubscribe(device.topicS);
      });
      this.client.end();
    }
    this.client = null;
    clearInterval(this.updateOnline);
  }

  loadUserList() {
    this.storage.get(USER_LIST)
      .then(userList => {
        this._userList = userList ? userList : [];
        var tokenFound = false;
        this._userList.forEach(user => {
          if (user.token == this.accountToken) {
            this._deviceListDate = user.date;
            this._deviceList = user.list;
            tokenFound = true;
          }
        });
        if (tokenFound == false) {
          this._deviceListDate = 0;
          this._userList.push({
            token: this.accountToken,
            list: this._deviceList,
            date: this._deviceListDate
          });
          this.storage.set(USER_LIST, this._userList);
        }
        this.connectMqtt();
      });
  }

  connectMqtt() {
    if (!this.client) {
      var timestamp = Date.now();
      this.storage.get(CLIENT_ID)
        .then(clientId => {
          if (clientId) {
            this.opts.clientId = clientId;
          } else {
            this.opts.clientId = `CECTCO-ionic-${Math.random().toString(16).substr(2, 8)}-${timestamp}`;
            this.storage.set(CLIENT_ID, this.opts.clientId);
          }
          this.client = connect('', this.opts);
          // 檢查裝置是否上線
          this.updateOnline = setInterval(() => {
            var offlineTime = Date.now() / 1000 - 60 * 2;
            this._deviceList.forEach(device => {
              var online = device.UpdateDate > offlineTime;
              if (device.Online != online) {
                device.Online = online;
              }
            });
          }, 3000);
          this.toggleToast(true);

          this.client.on('connect', () => {
            this.toggleToast(false);
            this.subscribeTopic();
          });

          this.client.on('message', (topic, message) => {
            this.getMessage(topic, message);
          });

          this.client.on('error', (err) => {
            console.log("Log Here - " + JSON.stringify(err));
          });
        });
    }
  }

  subscribeTopic() {
    this.topicD = `WAWA/${this.accountToken}/D`;
    this.client.subscribe(this.topicD, { qos: 1 });
    // 更新裝置列表
    var topic = `WAWA/${this.accountToken}/U`;
    var paylod = JSON.stringify({ action: "list" });
    this.client.publish(topic, paylod, { qos: 1, retain: false });

    // 將重複登入者剔除機制
    this.topicC = `WAWA/${this.accountToken}/C`;
    this.client.subscribe(this.topicC, { qos: 1 });
    this._timestamp = Date.now();
    var paylodC = { time: this._timestamp };
    this.client.publish(this.topicC, JSON.stringify(paylodC), { qos: 1, retain: false });
  }

  getMessage(topic, message) {
    if (topic == this.topicC) {
      var obj = JSON.parse(message.toString());
      if (obj && obj.time && this.accountToken != "0005") {
        if (obj.time > this._timestamp) {
          console.log("topic: " + topic + " & message: " + message.toString());
          this.client.end();
          const alertTitle = "已與伺服器斷開，請重新登入";
          let options: AlertOptions = {
            title: alertTitle,
            buttons: [
              {
                text: "確定",
                handler: () => {
                  this.logout();
                },
              }
            ],
          };

          const alert = this.alertCtrl.create(options);
          alert.present();
        }
      }
    } else if (topic == this.topicD) {
      obj = JSON.parse(message.toString());
      console.log("topic: " + topic + " & message: " + message.toString());
      if (obj && obj.data) {
        var newDeviceList = this._deviceList;
        this._deviceList = [];
        obj.data.forEach(data => {
          data.topicC = `WAWA/${data.D}/C`;
          data.topicU = `WAWA/${data.D}/U`;
          data.topicS = `WAWA/${data.D}/S`;
          data.DevNo = data.D;
          data.ExpireDate = data.E;
          data.UpdateDate = data.U;
          data.ExpireTime = this.getDate(data.E);
          if (Date.now() / 1000 <= data.E) {
            this.client.subscribe(data.topicU, { qos: 1 });
          }
          this.client.subscribe(data.topicC, { qos: 1 });
          this.client.subscribe(data.topicS, { qos: 1 });
          newDeviceList.forEach(device => {
            if (device.DevNo == data.D) {
              data = Object.assign(device, data);
            }
          });
          this._deviceList.push(data);
        });
        this.saveUserList();
      }
    } else {
      for (var i = 0; i < this._deviceList.length; i++) {
        if (topic == this._deviceList[i].topicC) {
          obj = JSON.parse(message.toString());
          Object.assign(this._deviceList[i], obj);
          console.log("topic: " + topic + " & message:" + message.toString());
          this.saveUserList();
        } else if (topic == this._deviceList[i].topicU) {
          var arrayBuffer: ArrayBuffer = new ArrayBuffer(message.length);
          var view = new Uint8Array(arrayBuffer);
          for (var j = 0; j < message.length; j++) {
            view[j] = message[j];
          }
          var dataView = new DataView(arrayBuffer);
          obj = {};
          var timestamp = dataView.getUint32(0);
          for (j = 4; j < message.length; j += 3) {
            var service = dataView.getUint8(j);
            var value = dataView.getUint16(j + 1);
            obj["H" + service.toString(16).toUpperCase()] = value;
          }
          Object.assign(this._deviceList[i], obj);
          if (this._deviceList[i].UpdateDate < timestamp) {
            this._deviceList[i].UpdateDate = timestamp;
          }
          this._deviceList[i].UpdateTime = this.getTime(timestamp);
          console.log("topic: " + topic + " & timestamp:" + timestamp);
          this.saveUserList();
        } else if (topic == this._deviceList[i].topicS) {
          timestamp = 0;
          if (!timestamp) {
            timestamp = parseInt((Date.now() / 1000).toString(), 10);
          }
          this._deviceList[i].UpdateDate = timestamp;
          console.log("topic: " + topic + " & timestamp:" + timestamp);
          this.saveUserList();
        }
      }
    }
  }

  private saveUserList() {
    var timestamp = Date.now() / 1000;
    this._deviceListDate = parseInt(timestamp.toString(), 10);
    this._userList.forEach(user => {
      if (user.token == this.accountToken) {
        user.date = this._deviceListDate;
        user.list = this._deviceList;
      }
    });
    this.storage.set(USER_LIST, this._userList);
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

  public getTime(timestamp) {
    var date = new Date(timestamp * 1000);
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  }

  logout() {
    this.appTasks.logoutTask()
      .then(() => {
        this.goHomePage();
      });
  }

  private goHomePage() {
    this.navCtrl.setRoot('HomePage');
  }

  public toggleToast(show: boolean) {
    if (show && !this.noNetworkToast) {
      const notFoundMsg = this.translate.instant('CHECK_NETWORKS.NOT_FOUND');
      this.noNetworkToast = this.popupService.makeToast({
        message: notFoundMsg,
        position: 'top',
        showCloseButton: true,
        closeButtonText: 'X',
      });
    } else if (!show && this.noNetworkToast) {
      this.noNetworkToast.dismiss();
      this.noNetworkToast = null;
    }
  }
}
