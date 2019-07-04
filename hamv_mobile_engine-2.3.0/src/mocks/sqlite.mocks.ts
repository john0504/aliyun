import { SQLiteDatabaseConfig } from '@ionic-native/sqlite';

//SQL file is loaded via script tag in index.html --> <script src="assets/sql/sql.js"></script>
declare let SQL;

const nextTick = window.setImmediate || function (fun) {
  window.setTimeout(fun, 0);
};

export const READ_ONLY_REGEX = /^(\s|;)*(?:alter|create|delete|drop|insert|reindex|replace|update)/i;
export const TRANSACTION_REGEX = /^(\s|;)*(?:begin|end|commit|rollback)/i;

export class SQLiteObject {
  _objectInstance: any;
  txLock = {
    queue: [],
    inProgress: false,
  };

  constructor(_objectInstance: any) {
    this._objectInstance = _objectInstance;
  }

  public isQuery(statement: string) {
    return !(TRANSACTION_REGEX.test(statement) || READ_ONLY_REGEX.test(statement));
  }

  public executeSql(statement: string, params: Array<any>): Promise<any> {
    if (this.isQuery(statement)) {
      return this.run(statement, params);
    }

    return new Promise((resolve, reject) => {
      const mysuccess = (t, r) => resolve(r);
      const myerror = (t, e) => reject(e);
      const myfn = (tx) => tx.addStatement(statement, params, mysuccess, myerror);
      this.addTransaction(new SQLiteTransaction(this, myfn, null, null, this.txLock));
    });
  }

  public sqlBatch(statements: Array<any>): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!statements || statements.constructor !== Array) {
        throw new Error('sqlBatch expects an array');
      }
      const batchList = [];
      for (let j = 0, len1 = statements.length; j < len1; j++) {
        const st = statements[j];
        if (st.constructor === Array) {
          if (st.length === 0) {
            throw new Error('sqlBatch array element of zero (0) length');
          }
          batchList.push({
            sql: st[0],
            params: st.length === 0 ? [] : st[1]
          });
        } else {
          batchList.push({
            sql: st,
            params: []
          });
        }
      }
      if (batchList.findIndex((query) => !this.isQuery(query.sql)) > -1) {
        const myfn = (tx) => {
          let elem, k, len2, results;
          results = [];
          for (k = 0, len2 = batchList.length; k < len2; k++) {
            elem = batchList[k];
            results.push(tx.addStatement(elem.sql, elem.params, null, null));
          }
          return results;
        };
        this.addTransaction(new SQLiteTransaction(this, myfn, reject, resolve, this.txLock));
      } else {
        reject(new Error('There is no manipulation operation in sql batch'));
      }
    });
  }

  public transaction(fn: any): Promise<any> {
    return new Promise((resolve, reject) => this.addTransaction(new SQLiteTransaction(this, fn, reject, resolve, this.txLock)));
  }

  public addTransaction(t) {
    this.txLock.queue.push(t);
    this.startNextTransaction();
  };

  public startNextTransaction() {
    const self = this;
    nextTick((() => {
      return () => {
        const txLock = self.txLock;
        if (txLock.queue.length > 0 && !txLock.inProgress) {
          txLock.inProgress = true;
          txLock.queue.shift().start();
        }
      };
    })());
  }

  public run(statement: string, params: any): Promise<any> {

    return new Promise((resolve, reject) => {
      try {
        if (TRANSACTION_REGEX.test(statement)) {
          this._objectInstance.exec(statement);
          resolve();
        } else if (READ_ONLY_REGEX.test(statement)) {
          console.log(statement, params);
          this._objectInstance.run(statement, params);
          resolve();
        } else {
          console.log(statement, params);
          const st = this._objectInstance.prepare(statement, params);
          const rows: Array<any> = [];

          while (st.step()) {
            let row = st.getAsObject();
            rows.push(row);
          }
          st.free();
          const payload = {
            rows: {
              item: function (i) {
                return rows[i];
              },
              length: rows.length
            },
            rowsAffected: this._objectInstance.getRowsModified() || 0,
            insertId: this._objectInstance.insertId || void 0
          };

          resolve(payload);
        }
      } catch (e) {
        console.error('sql error -> ', e.message);
        reject(e);
      }
    });
  }

  public close() {
    this._objectInstance.close();
  }
}

export class SQLiteTransaction {

  private db: SQLiteObject;
  private fn;
  private error;
  private success;
  private txlock;
  private executes;

  private finalized;

  constructor(db: SQLiteObject, fn, error, success, txlock) {
    if (typeof fn !== 'function') {
      throw new Error('transaction expected a function');
    }
    this.db = db;
    this.fn = fn;
    this.error = error;
    this.success = success;
    this.txlock = txlock;
    this.executes = [];
    this.addStatement('BEGIN', [], null, (tx, err) => {
      throw new Error('unable to begin transaction: ' + err.message + '' + err.code);
    });
  }

  public start() {
    try {
      this.fn(this);
      this.run();
    } catch (error1) {
      this.txlock.inProgress = false;
      this.db.startNextTransaction();
      if (this.error) {
        this.error(new Error(error1));
      }
    }
  }

  private addStatement(sql, values, success, error) {
    const sqlStatement = typeof sql === 'string' ? sql : sql.toString();
    const params = [];
    if (!!values && values.constructor === Array) {
      for (let j = 0, len1 = values.length; j < len1; j++) {
        const v = values[j];
        const t = typeof v;
        params.push((v === null || v === void 0 ? null : t === 'number' || t === 'string' ? v : v.toString()));
      }
    }
    this.executes.push({
      success: success,
      error: error,
      sql: sqlStatement,
      params: params,
    });
  }

  private run() {
    let txFailure;
    const batchExecutes = this.executes;
    let waiting = batchExecutes.length;
    this.executes = [];
    const tx = this;
    const handlerFor = (index, didSucceed) => {
      return (response) => {
        if (!txFailure) {
          try {
            if (didSucceed) {
              tx.handleStatementSuccess(batchExecutes[index].success, response);
            } else {
              tx.handleStatementFailure(batchExecutes[index].error, new Error(response));
            }
          } catch (error1) {
            txFailure = error1;
          }
        }
        if (--waiting === 0) {
          if (txFailure) {
            tx.executes = [];
            tx.abort(txFailure);
          } else if (tx.executes.length > 0) {
            tx.run();
          } else {
            tx.finish();
          }
        }
      };
    };
    let i = 0;
    while (i < batchExecutes.length) {
      const request = batchExecutes[i];
      const success = handlerFor(i, true);
      const fail = handlerFor(i, false);
      this.db.run(request.sql, request.params)
        .then(response => success(response))
        .catch(error => fail(error));
      i++;
    }
  }

  private executeSql(sql, values, success, error) {
    if (this.finalized) {
      throw new Error('InvalidStateError: DOM Exception 11: This transaction is already finalized. Transactions are committed after its success or failure handlers are called. If you are using a Promise to handle callbacks, be aware that implementations following the A+ standard adhere to run-to-completion semantics and so Promise resolution occurs on a subsequent tick and therefore after the transaction commits.');
    }
    this.addStatement(sql, values, success, error);
  }

  private handleStatementSuccess(handler, response) {
    if (handler) {
      handler(this, response);
    }
  }

  private handleStatementFailure(handler, response) {
    if (!handler) {
      throw new Error("a statement with no error handler failed: " + response.message);
    }
    if (handler(this, response) !== false) {
      throw new Error("a statement error callback did not return false: " + response.message);
    }
  }

  private abort(txFailure) {
    if (this.finalized) {
      return;
    }
    const succeeded = (tx) => {
      this.txlock.inProgress = false;
      tx.db.startNextTransaction();
      if (tx.error && typeof tx.error === 'function') {
        tx.error(txFailure);
      }
    };
    const failed = (tx, err) => {
      this.txlock.inProgress = false;
      tx.db.startNextTransaction();
      if (tx.error && typeof tx.error === 'function') {
        tx.error(new Error('error while trying to roll back: ' + err.message));
      }
    };
    this.finalized = true;
    this.addStatement('ROLLBACK', [], succeeded, failed);
    this.run();
  }

  private finish() {
    if (this.finalized) {
      return;
    }
    const succeeded = (tx) => {
      this.txlock.inProgress = false;
      tx.db.startNextTransaction();
      if (tx.success && typeof tx.success === 'function') {
        tx.success();
      }
    };
    const failed = (tx, err) => {
      this.txlock.inProgress = false;
      tx.db.startNextTransaction();
      if (tx.error && typeof tx.error === 'function') {
        tx.error(new Error('error while trying to commit: ' + err.message));
      }
    };
    this.finalized = true;
    this.addStatement('COMMIT', [], succeeded, failed);
    this.run();
  }
}

export class SQLiteMock {

  public create(config: SQLiteDatabaseConfig): Promise<SQLiteObject> {
    return new Promise((resolve, reject) => {
      try {
        const db = new SQL.Database();
        console.log('SQLiteMock create -> ', db);

        resolve(new SQLiteObject(db));
      } catch (e) {
        reject(e);
      }
    });
  }
}
