import { SQLiteObject } from './sqlite.mocks';
declare let SQL;

export class WebSQLMock {

  public version = 1.0;
  private _db: SQLiteObject;

  constructor(config?) {
    try {
      const db = new SQL.Database();
      console.log('WebSQLMock create -> ', db);

      this._db = new SQLiteObject(db);
    } catch (e) {
    }
  }

  public transaction(fn, errFn?, successFn?) {
    this._db.transaction(fn)
      .then(() => successFn && successFn())
      .catch(e => errFn && errFn(e));
  }

  public readTransaction(fn, errFn?, successFn?) {
    this._db.transaction(fn)
      .then(() => successFn && successFn())
      .catch(e => errFn && errFn(e));
  }

  public changeVersion(oldVersion, newVersion, fn?, errFn?, successFn?) {
    successFn && successFn();
  }
}