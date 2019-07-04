import { TestBed, getTestBed, inject } from '@angular/core/testing';

import { Platform } from 'ionic-angular';
import { PlatformMock } from 'ionic-mocks';
import { SQLite } from '@ionic-native/sqlite';
import { SQLiteMock } from '../mocks/sqlite.mocks';

import { LogService, Logger } from './log-service';

describe('Log Service', () => {

  let instance: LogService;

  it('Service initialize', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Platform, useFactory: () => PlatformMock.instance() },
        { provide: SQLite, useClass: SQLiteMock },
        LogService
      ],
    });

    const injector = getTestBed();
    instance = injector.get(LogService);

    expect(instance).toBeDefined();
  });

  it('Service initialize - throw error', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Platform, useFactory: () => PlatformMock.instance() },
        SQLite,
        LogService
      ],
    });

    try {
      const injector = getTestBed();
      injector.get(LogService);
    } catch (e) {
      expect(e).toBeDefined();
    }
  });

  it('Add a debug log', () => {
    return instance.debug('a debug log');
  });

  it('Add an error log', () => {
    return instance.error('an error log');
  });

  it('Add an info log', () => {
    return instance.info('an info log');
  });

  it('Add a log log', () => {
    return instance.log('a log log');
  });

  it('Add a warn log', () => {
    return instance.warn('a warn log');
  });

  it('Export logs', () => {
    return instance.export()
      .then(logs => {
        expect(logs).toBeDefined();
        expect(logs).toContain('a debug log');
        expect(logs).toContain('an error log');
        expect(logs).toContain('an info log');
        expect(logs).toContain('a log log');
        expect(logs).toContain('a warn log');
      });
  });

  it('Test setup and add a object as log content', () => {
    const newConfig = instance.setup({
      recordLimit: 3
    });
    expect(newConfig).toEqual({
      recordLimit: 3
    });
    instance.log({
      testContent: 3
    });
  });

});

describe('Logger test cases', () => {

  it('Add a debug log', () => {
    return Logger.debug('a debug log');
  });

  it('Add an error log', () => {
    return Logger.error('an error log');
  });

  it('Add an info log', () => {
    return Logger.info('an info log');
  });

  it('Add a log log', () => {
    return Logger.log('a log log');
  });

  it('Add a warn log', () => {
    return Logger.warn('a warn log');
  });

  it('Export logs', () => {
    return Logger.export()
      .then(logs => expect(logs).toBeUndefined());
  });

  describe('Logger with logger service', () => {

    beforeAll(() => {
      TestBed.configureTestingModule({
        providers: [
          { provide: Platform, useFactory: () => PlatformMock.instance() },
          { provide: SQLite, useClass: SQLiteMock },
          LogService
        ],
      });
  
      const injector = getTestBed();
      const logService = injector.get(LogService);
  
      Logger.setup(logService, {
        recordLimit: 3
      });
    });
    
    it('Add a debug log', () => {
      return Logger.debug('a debug log');
    });
  
    it('Add an error log', () => {
      return Logger.error('an error log');
    });
  
    it('Add an info log', () => {
      return Logger.info('an info log');
    });
  
    it('Add a log log', () => {
      return Logger.log('a log log');
    });
  
    it('Add a warn log', () => {
      return Logger.warn('a warn log');
    });
  
    it('Export logs', () => {
      return Logger.export()
        .then(logs => expect(logs).toBeDefined());
    });

    it('Setup to default', () => {
      Logger.setup(null, null);
    });
  });

});