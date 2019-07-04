import {
  TestBed,
  getTestBed,
} from '@angular/core/testing';
import { HTTP } from '@ionic-native/http';
import { HTTPMock } from '@ionic-native-mocks/http';
import { File } from '@ionic-native/file';
import { FileMock } from 'ionic-mocks';

import { ImageCacheModule } from './image-cache.module';
import { ImageCacheService } from './image-cache.service';

describe('Image cache module: image cache service - initialize step', () => {

  let instance: ImageCacheService;
  let file;

  beforeEach(() => {
    file = FileMock.instance();
    TestBed.configureTestingModule({
      imports: [
        ImageCacheModule.forRoot(),
      ],
      providers: [
        { provide: HTTP, useClass: HTTPMock },
        { provide: File, useFactory: () => file },
      ]
    });

    const injector = getTestBed();
    instance = injector.get(ImageCacheService);
  });

  it('should create', () => {
    expect(instance).toBeDefined();
    expect(instance instanceof ImageCacheService).toBeTruthy();
  });

  it('initial image cache service - use broswer base', () => {
    return instance.initImageCache()
      .then(() => expect(file.createDir).not.toHaveBeenCalled());
  });

  it('initial image cache service - has folder', () => {
    spyOn(File, 'installed').and.returnValue(true);
    return instance.initImageCache()
      .then(() => expect(file.createDir).not.toHaveBeenCalled());
  });

  it('initial image cache service - no folder', () => {
    spyOn(File, 'installed').and.returnValue(true);
    file.checkDir.and.returnValue(Promise.resolve(false));
    return instance.initImageCache()
      .then(() => expect(file.createDir).toHaveBeenCalled());
  });

  it('initial image cache service - invalid folder', () => {
    spyOn(File, 'installed').and.returnValue(true);
    file.checkDir.and.returnValue(Promise.reject(new Error('invalid folder')));
    return instance.initImageCache()
      .then(() => expect(file.createDir).toHaveBeenCalled());
  });

});

describe('Image cache module: image cache service - browser base', () => {

  let instance: ImageCacheService;
  let file;

  beforeEach(() => {
    file = FileMock.instance();
    TestBed.configureTestingModule({
      imports: [
        ImageCacheModule.forRoot(),
      ],
      providers: [
        { provide: HTTP, useClass: HTTPMock },
        { provide: File, useFactory: () => file },
      ]
    });

    const injector = getTestBed();
    instance = injector.get(ImageCacheService);

    return instance.initImageCache();
  });

  it('should create', () => {
    expect(instance).toBeDefined();
    expect(instance instanceof ImageCacheService).toBeTruthy();
  });

  it('getImagePath - invalid image url: empty string', () => {
    return instance.getImagePath('').toPromise()
      .catch(e => {
        expect(e).toBeDefined();
        expect(e.message).toEqual('The image url provided was empty or invalid.');
      });
  });

  it('getImagePath - valid image url: http string', () => {
    return instance.getImagePath('http://a.jpg').toPromise()
      .then(url => expect(url).toEqual('http://a.jpg'));
  });

});

describe('Image cache module: image cache service - phone base', () => {

  let instance: ImageCacheService;
  let file;

  beforeEach(() => {
    file = FileMock.instance();
    TestBed.configureTestingModule({
      imports: [
        ImageCacheModule.forRoot(),
      ],
      providers: [
        { provide: HTTP, useClass: HTTPMock },
        { provide: File, useFactory: () => file },
      ]
    });

    spyOn(File, 'installed').and.returnValue(true);
    file.cacheDirectory = 'a-cache-directory/';

    const injector = getTestBed();
    instance = injector.get(ImageCacheService);

    return instance.initImageCache();
  });

  it('should create', () => {
    expect(instance).toBeDefined();
    expect(instance instanceof ImageCacheService).toBeTruthy();
  });

  it('getImagePath - valid image url: local path url', () => {
    return instance.getImagePath('file:///a.jpg').toPromise()
      .then(url => expect(url).toEqual('file:///a.jpg'));
  });

  describe('getImagePath - valid image url: http url', () => {

    it('getImagePath - cached', done => {
      file.resolveLocalFilesystemUrl.and.callFake(filePath => Promise.resolve({ nativeURL: filePath }));

      instance.getImagePath('http://www.exosite.com/a.jpg')
        .subscribe(url => {
          expect(url).toEqual('a-cache-directory/image-cache/-2087187822.jpg');
          done();
        });
    });

    it('getImagePath - no cache', done => {
      file.checkFile.and.returnValue(Promise.resolve(false));
      file.resolveLocalFilesystemUrl.and.callFake(filePath => Promise.resolve({ nativeURL: filePath }));

      instance.getImagePath('http://www.exosite.com/a.jpg')
        .subscribe(url => {
          expect(url).toEqual('a-cache-directory/image-cache/-2087187822.jpg');
          done();
        });
    });

    it('getImagePath - cache broken', done => {
      file.checkFile.and.returnValue(Promise.reject(new Error('cache broken')));
      file.resolveLocalFilesystemUrl.and.callFake(filePath => Promise.resolve({ nativeURL: filePath }));

      instance.getImagePath('http://www.exosite.com/a.jpg')
        .subscribe(url => {
          expect(url).toEqual('a-cache-directory/image-cache/-2087187822.jpg');
          done();
        });
    });

    it('getImagePath - double trigger', done => {
      file.resolveLocalFilesystemUrl.and.callFake(filePath => Promise.resolve({ nativeURL: filePath }));

      instance.getImagePath('http://www.exosite.com/a.jpg')
        .subscribe(url => expect(url).toEqual('a-cache-directory/image-cache/-2087187822.jpg'));
      instance.getImagePath('http://www.exosite.com/a.jpg')
        .subscribe(url => {
          expect(url).toEqual('a-cache-directory/image-cache/-2087187822.jpg');
          done();
        });
    });

    it('getImagePath - special url', done => {
      file.resolveLocalFilesystemUrl.and.callFake(filePath => Promise.resolve({ nativeURL: filePath }));

      instance.getImagePath('http://www.exosite.com/a.jpg?132312')
        .subscribe(url => {
          expect(url).toEqual('a-cache-directory/image-cache/650151793.jpg');
          done();
        });
    });

    it('getImagePath - default extension file name', done => {
      file.resolveLocalFilesystemUrl.and.callFake(filePath => Promise.resolve({ nativeURL: filePath }));

      instance.getImagePath('http://www.exosite.com/picture?132312')
        .subscribe(url => {
          expect(url).toEqual('a-cache-directory/image-cache/1126095751.jpg');
          done();
        });
    });
    
    it('getImagePath - get complex extension name', done => {
      file.resolveLocalFilesystemUrl.and.callFake(filePath => Promise.resolve({ nativeURL: filePath }));

      instance.getImagePath('https://scontent.ftpe7-2.fna.fbcdn.net/v/t1.0-9/33663737_1296382893826939_3202350331979628544_o.jpg?_nc_fx=ftpe7-2&_nc_cat=0&oh=457707195c42536d0e56a27a5bf64d8d&oe=5B89FC32')
        .subscribe(url => {
          expect(url).toEqual('a-cache-directory/image-cache/1541359539.jpg');
          done();
        });
    });
  });
});