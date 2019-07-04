import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';

import { SQLite, SQLiteObject } from '@ionic-native/sqlite';

@Injectable()
export class LogService {

  private db: SQLiteObject;
  private recordCount: number;

  private config = {
    recordLimit: 10 ** 4,
  };

  constructor(
    private platform: Platform,
    private sqlite: SQLite,
  ) {
    this.platform.ready()
      .then(() => this.dbInit());
  }

  public setup(config) {
    Object.assign(this.config, config);
    return this.config;
  }

  private addLog(type: string, ...logs): Promise<any> {
    const text = logs
      .map(log => {
        if (typeof log !== 'string' && typeof log !== 'number') {
          return JSON.stringify(log);
        }
        return log;
      })
      .join(' ');

    return this.dbAddRecord(type, text);
  }

  private dbAddRecord(type: string, text: string): Promise<any> {
    if (!this.db) return Promise.resolve();

    const query = 'INSERT INTO log (ts, type,content) VALUES (?, ?, ?);';

    return this.db
      .executeSql(query, [
        Date.now(),
        type,
        text,
      ])
      .then(res => {
        this.recordCount++;

        return this.recordCount >= this.config.recordLimit
          ? this.dbRemoveOldestRecord()
          : res;
      });
  }

  private dbCreateTable(): Promise<any> {
    const query = 'CREATE TABLE IF NOT EXISTS log(ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP, type, content);';

    return this.db.executeSql(query, [])
      .catch(e => {
        if (e.code === 5) return Promise.resolve();
        throw e;
      });
  }

  private dbGetAllRecords(): Promise<Array<any>> {
    const query = 'SELECT * FROM log ORDER BY ts DESC LIMIT ?;';

    return this.db.executeSql(query, [this.config.recordLimit])
      .then(res => {
        const array = [];

        for (let i = 0; i < res.rows.length; i++) {
          array.push(res.rows.item(i));
        }

        return array;
      });
  }

  private dbGetNumberOfRecords(): Promise<any> {
    const query = 'SELECT COUNT(ROWID) AS recordCount FROM log;';
    return this.db.executeSql(query, [])
      .then(res => {
        this.recordCount = res.rows.item(0)['recordCount'];
        return res;
      });
  }

  private dbInit(): Promise<any> {
    return this.sqlite
      .create({
        location: 'default',
        name: 'log.db',
      })
      .then(db => this.db = db)
      .then(() => this.dbCreateTable())
      .then(() => this.dbGetNumberOfRecords())
      .catch(e => {
        if (e !== 'cordova_not_available') throw e;
      });
  }

  private dbRemoveOldestRecord(): Promise<any> {
    const query = 'DELETE FROM log WHERE ROWID IN (SELECT ROWID FROM log ORDER BY ts ASC LIMIT 1);';

    return this.db.executeSql(query, [])
      .then(res => {
        this.recordCount--;
        return res;
      });
  }

  private logsToText(logs) {
    return logs
      .map(log => `${new Date(log.ts).toJSON()} ${log.type} ${log.content}`)
      .join('\n');
  }

  public debug(...args): Promise<any> {
    console.debug.apply(console, args);
    return this.addLog('DEBUG', ...args);
  }

  public error(...args): Promise<any> {
    console.error.apply(console, args);
    return this.addLog('ERROR', ...args);
  }

  public info(...args): Promise<any> {
    console.info.apply(console, args);
    return this.addLog('INFO', ...args);
  }

  public log(...args): Promise<any> {
    console.log.apply(console, args);
    return this.addLog('LOG', ...args);
  }

  public warn(...args): Promise<any> {
    console.warn.apply(console, args);
    return this.addLog('WARN', ...args);
  }

  public export(): Promise<any> {
    return this.dbGetAllRecords()
      .then(logs => this.logsToText(logs));
  }
}

export class Logger {

  private static DEFAULT_LOG_SERVICE = {
    setup(config) {
    },
    debug(...args): Promise<any> {
      return Promise.resolve();
    },
    error(...args): Promise<any> {
      return Promise.resolve();
    },
    info(...args): Promise<any> {
      return Promise.resolve();
    },
    log(...args): Promise<any> {
      return Promise.resolve();
    },
    warn(...args): Promise<any> {
      return Promise.resolve();
    },
    export(): Promise<any> {
      return Promise.resolve();
    }
  };

  private static _serviceInstance = Logger.DEFAULT_LOG_SERVICE;

  public static setup(serviceInstance, config) {
    if (serviceInstance) {
      this._serviceInstance = serviceInstance;
      this._serviceInstance.setup(config);
    } else {
      this._serviceInstance = Logger.DEFAULT_LOG_SERVICE;
    }
  }

  public static debug(...args): Promise<any> {
    return Logger._serviceInstance.debug('DEBUG', ...args);
  }

  public static error(...args): Promise<any> {
    return Logger._serviceInstance.error('ERROR', ...args);
  }

  public static info(...args): Promise<any> {
    return Logger._serviceInstance.info('INFO', ...args);
  }

  public static log(...args): Promise<any> {
    return Logger._serviceInstance.log('LOG', ...args);
  }

  public static warn(...args): Promise<any> {
    return Logger._serviceInstance.warn('WARN', ...args);
  }

  public static export(): Promise<any> {
    return Logger._serviceInstance.export();
  }
}