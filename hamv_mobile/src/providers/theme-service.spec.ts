import {
  TestBed,
  getTestBed
} from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { File } from '@ionic-native/file';
import { AppEngine } from 'app-engine';
import { FileMock } from '@ionic-native-mocks/file';
import * as moment from 'moment-timezone';

import { ThemeService } from './theme-service';
import { renderer2Mock } from '../mocks/angular-module.mocks';
import { AppEngineMock } from '../mocks/app-engine.mocks';
import { cloudConfigObject } from '../mocks/testing-items.mocks';
import { delayPromise } from '../mocks/utils.mocks';

describe('Check theme service', () => {

  let instance: ThemeService;
  let renderer;
  let httpMock: HttpTestingController;
  let fileMock: FileMock;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        { provide: AppEngine, useClass: AppEngineMock },
        { provide: File, useClass: FileMock },
        ThemeService,
      ],
    });
    const injector = getTestBed();
    instance = injector.get(ThemeService);
    renderer = renderer2Mock;
    httpMock = injector.get(HttpTestingController);
    fileMock = injector.get(File);
  });

  it('test getting all properties', () => {
    expect(instance.baseUrl).toEqual('https://baseUrl');
    expect(instance.config).toEqual(jasmine.any(Object));
    expect(instance.configEndpoint).toEqual('https://baseUrl/api:1/theme');
    expect(instance.logoEndpoint).toEqual('https://baseUrl/theme/logo.png');
    expect(instance.navbarLogoEndpoint).toEqual('https://baseUrl/theme/logo_navbar.png');
    expect(instance.primaryColor).toEqual('#00baff');
    expect(instance.productName).toEqual(jasmine.any(String));
    expect(instance.wifiName).toEqual(jasmine.any(String));
  });

  it('test all files are empty case', () => {
    jasmine.clock().mockDate(moment.tz('2018-04-16 18:00:00', 'Asia/Taipei').toDate());
    spyOn(fileMock, 'writeFile').and.callFake(() => Promise.resolve({
      createWriter: () => Promise.resolve(),
      file: () => Promise.resolve(),
    }));

    spyOn(fileMock, 'readAsText').and.callFake(() => Promise.resolve("{}"));

    return instance.setup(renderer)
      .then(() => {
        const req = httpMock.expectOne('https://baseUrl/api:1/theme');
        expect(req.request.method).toEqual('GET');
        req.flush(JSON.stringify(cloudConfigObject));
      })
      .then(() => delayPromise(100))
      .then(() => {
        const req1 = httpMock.expectOne('https://baseUrl/theme/logo.png');
        expect(req1.request.method).toEqual('GET');
        req1.flush(null);

        const req2 = httpMock.expectOne('https://baseUrl/theme/logo_navbar.png');
        expect(req2.request.method).toEqual('GET');
        req2.flush(null);
      })
      .then(() => delayPromise(100))
      .then(() => {
        expect(instance.config).toEqual(jasmine.any(Object));
        expect(instance.logoUrl).toEqual('undefined?1523872800000');
        expect(instance.navbarLogoUrl).toEqual('undefined?1523872800000');
        expect(instance.themeUrl).toEqual('undefined?1523872800000');
        jasmine.clock().uninstall();
      });
  });

  it('test empty config value from cloud', () => {
    spyOn(fileMock, 'writeFile').and.callFake(() => Promise.resolve({
      createWriter: () => Promise.resolve(),
      file: () => Promise.resolve(),
    }));

    return instance.setup(renderer)
      .then(() => {
        const req = httpMock.expectOne('https://baseUrl/api:1/theme');
        expect(req.request.method).toEqual('GET');

        req.flush(JSON.stringify(""));
      });
  });

  it('test up-to-date state', () => {
    instance.config = {
      primaryColor: '#00baff',
      productName: 'Product Name',
      wifiName: 'WifiName-XXXX',
      timestamp: 1523966401,
    };
    spyOn(fileMock, 'writeFile').and.callFake(() => Promise.resolve({
      createWriter: () => Promise.resolve(),
      file: () => Promise.resolve(),
    }));

    return instance.setup(renderer)
      .then(() => {
        const req = httpMock.expectOne(`https://baseUrl/api:1/theme`);
        expect(req.request.method).toEqual('GET');

        req.flush(JSON.stringify(cloudConfigObject));
      });
  });

  it('download config from cloud failed, trigger retry mechanism', () => {
    instance.config = {
      primaryColor: '#00baff',
      productName: 'Product Name',
      wifiName: 'WifiName-XXXX',
      timestamp: 1523966401,
    };

    const callFailed = () => {
      const req = httpMock.expectOne(`https://baseUrl/api:1/theme`);
      expect(req.request.method).toEqual('GET');

      req.error(new ErrorEvent('AUTH_ERROR'), {
        status: 400,
        statusText: 'auth error'
      });
    };

    return instance.setup(renderer)
      .then(callFailed)
      .then(() => jasmine.clock().install())
      .then(() => jasmine.clock().tick(2800))
      .then(() => jasmine.clock().uninstall())
      .then(callFailed)
      .then(() => jasmine.clock().install())
      .then(() => jasmine.clock().tick(4100))
      .then(() => jasmine.clock().uninstall())
      .then(callFailed)
      .then(() => jasmine.clock().install())
      .then(() => jasmine.clock().tick(8100))
      .then(() => jasmine.clock().uninstall())
      .then(callFailed)
      .then(() => jasmine.clock().install())
      .then(() => jasmine.clock().tick(16100))
      .then(() => jasmine.clock().uninstall())
      .then(callFailed)
      .then(() => jasmine.clock().install())
      .then(() => jasmine.clock().tick(32100))
      .then(() => jasmine.clock().uninstall())
      .then(callFailed)
      .then(() => jasmine.clock().install())
      .then(() => jasmine.clock().tick(64100))
      .then(() => jasmine.clock().uninstall())
      .then(() => {
        const req = httpMock.expectOne('https://baseUrl/api:1/theme');
        expect(req.request.method).toEqual('GET');
        req.flush(JSON.stringify(cloudConfigObject));
      });
  });

  it('test getting image from cloud failed with no local cache', () => {
    spyOn(fileMock, 'writeFile').and.callFake(() => Promise.resolve({
      createWriter: () => Promise.resolve(),
      file: () => Promise.resolve(),
    }));
    spyOn(fileMock, 'checkFile').and.returnValue(Promise.resolve(false));
    spyOn(fileMock, 'copyFile').and.callFake(() => Promise.resolve({
      createWriter: () => Promise.resolve(),
      file: () => Promise.resolve(),
    }));

    return instance.setup(renderer)
      .then(() => {
        const req = httpMock.expectOne('https://baseUrl/api:1/theme');
        expect(req.request.method).toEqual('GET');

        req.flush(JSON.stringify(cloudConfigObject));
      })
      .then(() => delayPromise(100))
      .then(() => {
        const req1 = httpMock.expectOne('https://baseUrl/theme/logo.png');
        expect(req1.request.method).toEqual('GET');
        req1.error(new ErrorEvent('AUTH_ERROR'), {
          status: 400,
          statusText: 'auth error'
        });

        const req2 = httpMock.expectOne('https://baseUrl/theme/logo_navbar.png');
        expect(req2.request.method).toEqual('GET');
        req2.error(new ErrorEvent('AUTH_ERROR'), {
          status: 400,
          statusText: 'auth error'
        });
      })
      .then(() => delayPromise(100))
      .then(() => expect(fileMock.copyFile).toHaveBeenCalled());
  });

  it('test getting image from cloud failed with local caches', () => {
    spyOn(fileMock, 'writeFile').and.callFake(() => Promise.resolve({
      createWriter: () => Promise.resolve(),
      file: () => Promise.resolve(),
    }));
    spyOn(fileMock, 'checkFile').and.returnValue(Promise.resolve(true));
    spyOn(fileMock, 'removeFile').and.returnValue(Promise.resolve());
    spyOn(fileMock, 'copyFile').and.callFake(() => Promise.resolve({
      createWriter: () => Promise.resolve(),
      file: () => Promise.resolve(),
    }));

    return instance.setup(renderer)
      .then(() => {
        const req = httpMock.expectOne('https://baseUrl/api:1/theme');
        expect(req.request.method).toEqual('GET');

        req.flush(JSON.stringify(cloudConfigObject));
      })
      .then(() => delayPromise(100))
      .then(() => {
        const req1 = httpMock.expectOne('https://baseUrl/theme/logo.png');
        expect(req1.request.method).toEqual('GET');
        req1.error(new ErrorEvent('AUTH_ERROR'), {
          status: 400,
          statusText: 'auth error'
        });

        const req2 = httpMock.expectOne('https://baseUrl/theme/logo_navbar.png');
        expect(req2.request.method).toEqual('GET');
        req2.error(new ErrorEvent('AUTH_ERROR'), {
          status: 400,
          statusText: 'auth error'
        });
      })
      .then(() => delayPromise(100))
      .then(() => expect(fileMock.copyFile).toHaveBeenCalled());
  });

  it('test set out-of-date object', () => {
    // use this as current config in local
    instance.config = {
      primaryColor: '#00baff',
      productName: 'Product Name',
      wifiName: 'WifiName-XXXX',
      timestamp: (Date.now() / 1000 | 0),
    };
    // use this as download config from cloud
    instance.config = {
      primaryColor: '#00baff',
      productName: 'Product Name',
      wifiName: 'WifiName-XXXX',
      timestamp: 0,
    };
  });

});
