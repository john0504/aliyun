import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  Renderer2
} from '@angular/core';
import { Storage } from '@ionic/storage';
import {
  App,
  Config,
  MenuController,
  NavController,
  NavParams,
  Platform,
  ViewController
} from 'ionic-angular';
import { Subscription } from 'rxjs/Subscription';
import {
  delay,
  filter,
  first,
  pairwise,
} from 'rxjs/operators';

import { AppVersion } from '@ionic-native/app-version';
import { Deeplinks } from '@ionic-native/deeplinks';
import { SplashScreen } from '@ionic-native/splash-screen';
import { TranslateService } from '@ngx-translate/core';

import {
  AppActions,
  AppEngine,
  AppTasks,
  Logger,
  LogService,
  ReduxModule,
  StateStore,
} from 'app-engine';
import createLogger from 'redux-logger';
import { NgRedux } from '@angular-redux/store';

import { debounceImmediate } from '../app/app.extends';
import { CheckNetworkService } from '../providers/check-network';
import { GoAddingDeviceService } from '../providers/go-adding-device-service';
// import { HockeyApp } from '../providers/hockey-app';
// import { OtaUpdatePopup } from '../providers/ota-update-popup';
import { OtaUpdateResult } from '../providers/ota-update-result';
import { PopupService } from '../providers/popup-service';
import { ImageCacheService } from '../modules/image-cache';
import { ThemeService } from '../providers/theme-service';
import { EchartsService } from '../components/chart-components/echarts-core/echarts-service';
import { PageRouteManager } from '../components/page-nav/page-route-manager';

import { ssidConfirmReducer } from '../pages/ssid-confirm/ssid-confirm';
import { deviceCreateReducer } from '../pages/device-create/device-create';
import { localModeReducer } from '../pages/local-mode-device-item/local-mode-device-item';
import { supportModeReducer } from '../pages/support-mode/support-mode';

import { ComponentProvider, ModelManagerService } from '../modules/information-model';
// import mixpanel from 'mixpanel-browser';
import './app.extends';

import {
  ButtonGroupWithToggle,
  RangeWithToggle,
  LargeToggleWithRange,
  LargeToggle,
  SimpleButtonGroup,
  MultiButtonGroup,
  SimpleRange,
  SimpleText,
  ColorText,
  SimpleToggle,
  LineChart,
} from '../components/control-items';
import { PageNav } from '../components/page-nav/page-nav';

import { appConfig } from './app.config';
import { appLanguages } from './app.languages';

const USER_LANGUAGE = 'userLang';

@Component({
  templateUrl: 'app.html'
})
export class MyApp implements OnInit, OnDestroy {

  @ViewChild(PageNav) navCtrl: NavController;

  subs: Array<Subscription>;
  accountName;
  appVer = '';
  supportLangs: Array<any> = [];
  testMode: boolean = false;
  testModeCount = 0;
  testModeToast;
  testModeDatetime: number;

  appPages: Array<any> = [
    { title: 'APP.HOME', component: 'HomeListPage' },
    { title: 'PAYMENT.PAYMENT', component: 'PaymentPage' },
    { title: 'APP.SETTINGS', component: 'SettingsPage' },
  ];

  bleSettingPage = { title: 'APP.BLUETOOTH_SETTING', component: 'BluetoothSettingPage' };

  constructor(
    private app: App,
    private appEngine: AppEngine,
    private appTasks: AppTasks,
    private config: Config,
    private cp: ComponentProvider,
    private deeplinks: Deeplinks,
    private esService: EchartsService,
    private goService: GoAddingDeviceService,
    // private hockeyApp: HockeyApp,
    private log: LogService,
    private imageCache: ImageCacheService,
    private mms: ModelManagerService,
    private ngRedux: NgRedux<any>,
    // private otaUpdatePopup: OtaUpdatePopup,
    private otaUpdateResult: OtaUpdateResult,
    private prManager: PageRouteManager,
    private platform: Platform,
    private popupService: PopupService,
    private reduxModule: ReduxModule,
    private renderer: Renderer2,
    private storage: Storage,
    private splashScreen: SplashScreen,
    private stateStore: StateStore,
    private translate: TranslateService,
    public appVersion: AppVersion,
    public menuCtrl: MenuController,
    public themeService: ThemeService,
    public checkNetworkService: CheckNetworkService,
  ) {
    this.subs = [];
    this.esService.init();
    platform.ready()
      .then(() => this.setupLogService())
      .then(() => this.themeService.setup(this.renderer))
      .then(() => this.imageCache.initImageCache())
      .then(() => this.setupLanguage())
      .then(() => this.setupTestMode())
      .then(() => this.loadModels())
      // .then(() => this.setupHockeyApp())
      // .then(() => mixpanel.init(appConfig.mixpanel.token))
      .then(() => this.setupDeeplinks())
      .then(() => this.startAppEngine())
      .then(() => this.startReduxModule())
      .then(() => this.runAppTasks())
      .then(() => this.registerBackButtonAction())
      .then(() => this.splashScreen.hide())
      .then(() => this.otaUpdateResult.start())
      .then(() => this.goHomePage())
      .catch((e) => this.exitApp(e));
  }

  public ngOnInit(): void {
    // Don't put appEngine.onInit() in here, because plugins are not ready

    const middlewares = [];
    const reduxLogger = createLogger();
    middlewares.push(reduxLogger);

    this.reduxModule.applyMiddleWare(middlewares);
    const pageReducers = {
      ssidConfirm: ssidConfirmReducer,
      deviceCreate: deviceCreateReducer,
      localMode: localModeReducer,
      supportMode: supportModeReducer,
    };
    this.reduxModule.configureStore(pageReducers);
    this.reduxModule.setLoginPage(MyModalWrapper);

    this.appEngine.setup(appConfig.appEngine);

    this.subs.push(
      this.app.viewDidEnter
        .pipe(delay(0))
        .subscribe(() => {
          this.appVersion
            .getVersionNumber()
            .then(name => this.appVer = 'v' + name || '')
            .catch(() => this.appVer = '');
          this.checkMenus();
        })
    );

    this.subs.push(
      this.app.viewDidLeave
        .pipe(delay(0))
        .subscribe(() => this.checkMenus())
    );

    const account$ = this.stateStore.account$;
    this.subs.push(
      account$
        .pipe(debounceImmediate(500))
        .subscribe(account => this.accountName = (account && account.account) || '')
    );

    // const isAuthenticated$ = this.stateStore.isAuthenticated$;
    // this.subs.push(
    //   isAuthenticated$
    //     .pipe(
    //       filter(isAuthenticated => isAuthenticated),
    //       delay(5000)
    //     )
    //     .subscribe(() => this.otaUpdatePopup.showOTAPopup())
    // );

    this.subs.push(
      account$
        .pipe(pairwise())
        .subscribe(([oldAccount, newAccount]) => {
          const oldLoginState = oldAccount && oldAccount.isLoggedIn;
          const newLoginState = newAccount && newAccount.isLoggedIn;
          if (newLoginState && !oldLoginState && newAccount.isNewUser) {
            this.goService.goAddingDevicePage(this.navCtrl);
          }
        })
    );
  }

  public ngOnDestroy(): void {
    this.checkNetworkService.destroy();
    this.subs && this.subs.forEach(sub => sub.unsubscribe());
    this.subs.length = 0;
    this.reduxModule.stop();
    this.appEngine.stop()
      .then(() => {
        Logger.log('Successfully destroyed AppEngine');
      }, (error) => {
        Logger.log('Failed to destroy AppEngine', error);
      });
  }

  private registerComponents() {
    this.cp.registerComponent('button-group-with-toggle', ButtonGroupWithToggle);
    this.cp.registerComponent('range-with-toggle', RangeWithToggle);
    this.cp.registerComponent('large-toggle-with-range', LargeToggleWithRange);
    this.cp.registerComponent('large-toggle', LargeToggle);
    this.cp.registerComponent('button-group', SimpleButtonGroup);
    this.cp.registerComponent('multi-button-group', MultiButtonGroup);
    this.cp.registerComponent('range', SimpleRange);
    this.cp.registerComponent('text', SimpleText);
    this.cp.registerComponent('color-text', ColorText);
    this.cp.registerComponent('toggle', SimpleToggle);
    this.cp.registerComponent('line-chart', LineChart);
  }

  goPage(p) {
    if (!this.isCurrentPage(p)) {
      this.navCtrl.setRoot(p.component);
    }
  }

  goHomePage() {
    this.navCtrl.setRoot('HomeListPage');
  }

  isCurrentPage(p): boolean {
    return this.navCtrl.first() && this.navCtrl.first().id === this.prManager.getPage(p.component);
  }

  isIOS(): boolean {
    return this.platform.is('ios');
  }

  private checkMenus() {
    const modalPortal = this.app._appRoot._getPortal(2);
    const menuState = this.navCtrl.length() <= 1 && modalPortal.length() === 0;
    this.menuCtrl.get('mainMenu').enable(menuState);
  }

  private exitApp(errors) {
    Logger.log('Failed to initialize AppEngine', errors);
    this.ngRedux.dispatch(AppActions.action(AppActions.APP_INITIALIZE_DONE, errors, true));
    this.platform.exitApp();
  }

  private setupLanguage() {
    return this.storage.get(USER_LANGUAGE)
      .then((value) => {
        this.supportLangs = appLanguages;
        const defaultLang = this.supportLangs[0].value;
        let userLang;

        if (!value) {
          const deviceLang = navigator.language.toLowerCase();
          const findLang = this.supportLangs.find(({ value }) => value.toLowerCase() === deviceLang);

          userLang = findLang ? findLang.value : defaultLang;
        } else {
          userLang = value;
        }

        this.translate.setDefaultLang(defaultLang);
        this.translate.use(userLang).subscribe();
        this.translate.get('LANGUAGE.BACK').subscribe(backLabel => this.config.set('ios', 'backButtonText', backLabel));
      });
  }

  private loadModels() {
    Logger.log('platform.ready');
    this.registerComponents();
    return this.mms.load(`https://${this.appEngine.getBaseUrl()}`);
  }

  private registerBackButtonAction() {
    this.platform.registerBackButtonAction(() => {
      const defaultPortal = this.app._appRoot._getPortal(1);
      const modalPortal = this.app._appRoot._getPortal(2);
      const loadingPortal = this.app._appRoot._getPortal(3);
      const rootNav = this.app.getRootNavs()[0];
      const homeComponent = this.prManager.getPage(this.appPages[0].component);
      if (
        !this.menuCtrl.isOpen() &&
        defaultPortal.length() === 0 &&
        modalPortal.length() === 0 &&
        loadingPortal.length() === 0 &&
        rootNav.length() === 1 &&
        rootNav.first().id !== homeComponent
      ) {
        rootNav.setRoot(homeComponent);
      } else {
        this.app.goBack();
      }
    }, 1);
  }

  private setupDeeplinks() {
    this.deeplinks.route({
      '/': 'HomePage',
      '/api:1/share/:share': 'HomePage',
    })
      .subscribe((match) => {
        if (!match.$args.share) return;

        this.stateStore.isAuthenticated$
          .pipe(
            filter(isAuthenticated => isAuthenticated),
            first()
          )
          .subscribe(() => {
            // const loadingContent = this.translate.instant('APP.ADDING_SHARED');
            // const popupAddedMsg = this.translate.instant('APP.SHARED_ADDED');
            // const popupFailedAddedMsg = this.translate.instant('APP.SHARED_ADDED_FAILED');

            // let p = this.appTasks.wsRequestAddSharingDeviceTask(match.$args.share);
            // p = this.popupService.loadingPopup(p, {
            //   content: loadingContent
            // });

            // p = this.popupService.toastPopup(p, {
            //   message: popupAddedMsg,
            //   duration: 3000
            // }, {
            //     message: popupFailedAddedMsg,
            //     duration: 3000
            //   });
          });
      }, (nomatch) => {
        Logger.error('nomatch - deeplinks:', nomatch);
        if (this.platform.is('cordova')) this.setupDeeplinks();
      });
  }

  // private setupHockeyApp() {
  //   if (this.platform.is('android') && appConfig.hockeyApp.ids.android) {
  //     this.hockeyApp.start(appConfig.hockeyApp.ids.android);
  //   } else if (this.platform.is('ios') && appConfig.hockeyApp.ids.ios) {
  //     this.hockeyApp.start(appConfig.hockeyApp.ids.ios);
  //   }
  // }

  private setupLogService() {
    if (!appConfig.app.disableLog) Logger.setup(this.log, appConfig.app.logConfig);
  }

  private startAppEngine() {
    this.ngRedux.dispatch(AppActions.action(AppActions.APP_INITIALIZE));
    return this.appEngine.start();
  }

  private startReduxModule() {
    Logger.log('Successfully initialized AppEngine');
    this.ngRedux.dispatch(AppActions.action(AppActions.APP_INITIALIZE_DONE));
    this.reduxModule.start();
  }

  private runAppTasks() {
    return Promise.all([
      this.appTasks.refreshDevicesTask(),
      this.appTasks.filterDevicesTask(),
      this.appTasks.refreshGroupsTask(),
      this.appTasks.filterGroupsTask(),
      this.appTasks.getUserDataTask(),
      this.appTasks.getUserMeTask(),
    ]);
  }

  private setupTestMode() {
    return this.storage.get('testMode')
      .then((testMode) => {
        if (testMode) {
          this.testMode = testMode;
        } else {
          this.testMode = false;
        }
      });
  }

  turnOnTestMode() {
    const currentDatetime = new Date().getTime();
    if (currentDatetime - this.testModeDatetime > 2000) {
      this.testModeCount = 0;
    }
    this.testModeDatetime = currentDatetime;
    this.testModeCount++;
    if (!this.testMode && this.testModeCount >= 10) {
      this.testMode = true;
      this.storage.set('testMode', this.testMode);
      const testModeMsg = this.translate.instant('APP.TEST_MODE_OPEN');
      this.popupService.makeToast({
        duration: 1000,
        message: testModeMsg,
        position: 'bottom',
      });
    } else if (!this.testMode && this.testModeCount >= 7) {
      const testModeMsg = this.translate.instant('APP.TEST_MODE_COUNT', { value: 10 - this.testModeCount });
      this.testModeToast = this.popupService.makeToast({
        duration: 1000,
        message: testModeMsg,
        position: 'bottom',
      });
    } else if (this.testMode) {
      this.testModeCount = 0;
      this.testMode = false;
      this.storage.set('testMode', this.testMode);
      const testModeMsg = this.translate.instant('APP.TEST_MODE_CLOSE');
      this.popupService.makeToast({
        duration: 1000,
        message: testModeMsg,
        position: 'bottom',
      });
    }
  }
}

@Component({
  template: '<page-nav [root]="rootPage" [rootParams]="rootParams"></page-nav>'
})
export class MyModalWrapper {

  @ViewChild(PageNav) _modalNav: NavController;
  _backButtonUnregister;
  rootPage;
  rootParams;

  constructor(
    private _app: App,
    private stateStore: StateStore,
    private viewCtrl: ViewController,
    public _platform: Platform,
    navParams: NavParams,
  ) {
    this.rootPage = 'AppStartPage';
    this.rootParams = Object.assign({}, navParams.data, { viewCtrl });

    this._backButtonUnregister = this._platform.registerBackButtonAction(() => {
      if (this._modalNav.canGoBack()) {
        this._app.goBack();
      } else {
        this._platform.exitApp();
      }
    }, 9007199254740901);
  }

  ionViewDidLoad() {
    this.stateStore.isAuthenticated$
      .pipe(
        filter(isAuthenticated => isAuthenticated),
        first()
      )
      .subscribe(() => this.viewCtrl.dismiss());
  }

  ionViewWillUnload() {
    this._backButtonUnregister && this._backButtonUnregister();
  }
}
