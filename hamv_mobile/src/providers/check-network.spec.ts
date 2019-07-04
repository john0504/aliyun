import { TestBed, getTestBed, fakeAsync, tick } from '@angular/core/testing';
import { EventEmitter } from '@angular/core';
import { Platform } from 'ionic-angular';
import {
  TranslateModule,
  TranslateLoader
} from '@ngx-translate/core';
import {
  HttpClient,
  HttpClientModule,
} from '@angular/common/http';
import { ObjectUnsubscribedError } from 'rxjs';

import { CheckNetworkService } from './check-network';
import { PopupService } from './popup-service';
import { AppEngine } from 'app-engine';
import { AppEngineMock } from '../mocks/app-engine.mocks';
import {
  PopupServiceMock,
  createTranslateLoader,
} from '../mocks/providers.mocks';
import { PlatformMock } from 'ionic-mocks';

describe('Check network service', () => {

  let instance: CheckNetworkService;
  let platform;

  beforeAll(() => {
    platform = PlatformMock.instance();
    platform.resume = new EventEmitter<Event>();
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: (createTranslateLoader),
            deps: [HttpClient]
          },
        }),
      ],
      providers: [
        { provide: AppEngine, useClass: AppEngineMock },
        { provide: Platform, useFactory: () => platform },
        { provide: PopupService, useClass: PopupServiceMock },
        CheckNetworkService,
      ],
    });
    const injector = getTestBed();
    instance = injector.get(CheckNetworkService);
  });

  it('pause then resume', () => {
    instance.pause();
    instance.resume();
  });

  it('on platform resume', fakeAsync(() => {
    navigator['connection'].getInfo = (f) => {
      f('wifi');
    };
    navigator['connection'].type = 'none';

    instance.pause();
    platform.resume.emit('resume');

    tick(4000);
  }));

  it('destory', () => {
    instance.destroy();

    try {
      instance.pause();
    } catch (e) {
      expect(e).toBeDefined();
      expect(e instanceof ObjectUnsubscribedError).toBeTruthy();
    }

    try {
      instance.resume();
    } catch (e) {
      expect(e).toBeDefined();
      expect(e instanceof ObjectUnsubscribedError).toBeTruthy();
    }
  });

});
