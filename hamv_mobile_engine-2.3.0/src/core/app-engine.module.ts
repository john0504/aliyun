import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { IonicStorageModule } from '@ionic/storage';

import { AppEngine } from './app-engine';
import { WebSocketMessageDispatcher } from './ws-message-dispatcher';
import { AppEngineTasks } from './tasks/app-engine-tasks';
import { AccountService } from './services/account/account-service';
import { DatabaseService } from './services/storage/db-service';
import { MuranoApiService } from './services/network/murano-api-service';
import { DnssdService } from './services/mdns/dnssd-service';
import { LogModule } from '../log/log.module';
import { WebsocketAuth } from './services/network/ws-auth';

import { Facebook } from '@ionic-native/facebook';
import { HTTP } from '@ionic-native/http';
import { Network } from '@ionic-native/network';
import { SQLite } from '@ionic-native/sqlite';
import { Zeroconf } from '@ionic-native/zeroconf';

@NgModule({
  imports: [
    HttpClientModule,
    LogModule,
    IonicStorageModule.forRoot(),
  ],
  providers: [
    AppEngine,
    AccountService,
    MuranoApiService,
    DatabaseService,
    DnssdService,
    WebsocketAuth,
    AppEngineTasks,
    WebSocketMessageDispatcher,
    Zeroconf,
    Facebook,
    HTTP,
    Network,
    SQLite,
  ]
})
export class AppEngineModule { }