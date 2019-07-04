import {
  TestBed,
  ComponentFixture,
  getTestBed,
  fakeAsync,
  tick as _tick,
} from '@angular/core/testing';
import { HTTP } from '@ionic-native/http';
import { HTTPMock } from '@ionic-native-mocks/http';
import { async as _async } from 'rxjs/scheduler/async';

import { ResourceDownloader } from './resource-downloader';

function getTick() {
  let currentTime = 0;
  spyOn(_async, 'now').and.callFake(() => currentTime);

  return delay => {
    currentTime = delay;
    _tick(delay);
  };
}

describe('Image cache module: resource downloader', () => {

  let instance: ResourceDownloader;
  let http;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: HTTP, useClass: HTTPMock },
        ResourceDownloader,
      ]
    });

    const injector = getTestBed();
    instance = injector.get(ResourceDownloader);
    http = injector.get(HTTP);
  });

  it('should create', () => {
    expect(instance).toBeDefined();
    expect(instance instanceof ResourceDownloader).toBeTruthy();
  });

  it('should trigger callback when downloading file is done', done => {
    instance.download({ url: 'https://www.exosite.com/a.jpg', filePath: 'a-cache-file-path' })
      .subscribe(() => {
        expect('request has been done').toBeTruthy();
        done();
      });
  });

  it('should trigger callback when downloading file is done - multiple trigger', done => {
    instance.download({ url: 'https://www.exosite.com/a.jpg', filePath: 'a-cache-file-path' })
      .subscribe(() => {
        expect('request has been done').toBeTruthy();
      });
    instance.download({ url: 'https://www.exosite.com/a.jpg', filePath: 'a-cache-file-path' })
      .subscribe(() => {
        expect('request has been done').toBeTruthy();
        done();
      });
  });

  it('should retry when network error', fakeAsync(() => {
    let requestDone = false;
    const tick = getTick();
    const spy = spyOn(http, 'downloadFile');
    spy.and.callFake(() => {
      throw { status: 0, error: 'The host could not be resolved', };
    });
    instance.download({ url: 'https://www.exosite.com/a.jpg', filePath: 'a-cache-file-path' })
      .subscribe(() => requestDone = true);
    expect(requestDone).toBeFalsy();
    tick(1000);
    spy.and.callThrough();
    expect(requestDone).toBeFalsy();
    tick(11000);
    expect(requestDone).toBeTruthy();
  }));

  it('should retry when server error', fakeAsync(() => {
    let requestDone = false;
    const tick = getTick();
    const spy = spyOn(http, 'downloadFile');
    spy.and.callFake(() => {
      throw { status: 502, error: 'There is something wrong on the server.', };
    });
    instance.download({ url: 'https://www.exosite.com/a.jpg', filePath: 'a-cache-file-path' })
      .subscribe(() => requestDone = true);
    expect(requestDone).toBeFalsy();
    tick(1000);
    spy.and.callThrough();
    expect(requestDone).toBeFalsy();
    tick(31000);
    expect(requestDone).toBeTruthy();
  }));

  it('should throw error when invalid request', done => {
    spyOn(http, 'downloadFile').and.callFake(args => {
      throw { status: 404, error: 'There was an error downloading the file', };
    });
    instance.download({ url: 'https://www.exosite.com/a.jpg', filePath: 'a-cache-file-path' })
      .subscribe(() => { }, error => {
        expect(error).toBeDefined();
        expect(error.error).toEqual('There was an error downloading the file');
        done();
      });
  });

  it('should throw error when null request', done => {
    instance.download(null)
      .subscribe(() => { }, error => {
        expect(error).toBeDefined();
        expect(error.message).toEqual('invalid source or destination');
        done();
      });
  });

});