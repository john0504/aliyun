import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule } from 'ionic-angular';
import { MyApp, MyModalWrapper } from './app.component';

import { ComponentsModule } from '../components/components.module';
import { InformationModelModule } from '../modules/information-model';
import { ImageCacheModule } from '../modules/image-cache';

import { AppVersion } from '@ionic-native/app-version';
import { Deeplinks } from '@ionic-native/deeplinks';
import { Device } from '@ionic-native/device';
import { EmailComposer } from '@ionic-native/email-composer';
import { Market } from '@ionic-native/market';
import { OpenNativeSettings } from '@ionic-native/open-native-settings';
import { SafariViewController } from '@ionic-native/safari-view-controller';
import { SplashScreen } from '@ionic-native/splash-screen';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Insomnia } from '@ionic-native/insomnia';
import { SocialSharing } from '@ionic-native/social-sharing';
import { File } from '@ionic-native/file';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { GroupCoreInjector } from "../item-models/group/group-core-injector";

import { CalendarService } from '../providers/calendar-service';
import { CheckNetworkService } from '../providers/check-network';
import { DeviceConfigService } from '../providers/device-config-service';
import { DeviceControlService } from '../providers/device-control-service';
import { GoAddingDeviceService } from '../providers/go-adding-device-service';
import { PopupService } from '../providers/popup-service';
import { ViewStateService } from '../providers/view-state-service';
import { HockeyApp } from '../providers/hockey-app';
import { OtaUpdatePopup } from '../providers/ota-update-popup';
import { OtaUpdateResult } from '../providers/ota-update-result';
import { ScheduleAdapterService } from '../providers/schedule-adapter-service';
import { ThemeService } from '../providers/theme-service';
import { UtilsProvider } from '../providers/utils-provider';
import { DeviceCoreInjector } from '../item-models/device/device-core-injector';
import { ScheduleCoreInjector } from '../item-models/schedule/schedule-core-injector';

import { AppEngineModule, ReduxModule } from 'app-engine';

import { Geolocation } from '@ionic-native/geolocation';
import { BLE } from '@ionic-native/ble';
import { FileTransfer } from '@ionic-native/file-transfer';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    MyApp,
    MyModalWrapper,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp),
    AppEngineModule,
    ReduxModule,
    InformationModelModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      },
    }),
    ComponentsModule,
    ImageCacheModule.forRoot(),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    MyModalWrapper,
  ],
  providers: [
    AppVersion,
    Deeplinks,
    Device,
    EmailComposer,
    GroupCoreInjector,
    SafariViewController,
    SplashScreen,
    InAppBrowser,
    Insomnia,
    SocialSharing,
    File,
    CheckNetworkService,
    DeviceConfigService,
    DeviceControlService,
    GoAddingDeviceService,
    Market,
    OtaUpdatePopup,
    OtaUpdateResult,
    PopupService,
    ViewStateService,
    HockeyApp,
    OpenNativeSettings,
    ScheduleAdapterService,
    ThemeService,
    UtilsProvider,
    DeviceCoreInjector,
    ScheduleCoreInjector,
    CalendarService,
    Geolocation,
    BLE,
    FileTransfer,
  ]
})
export class AppModule { }
