import { databaseVersions } from './database-versions';
import { Logger } from '../../../../log/log-service';

const win: any = window;

export class WebSqlDatabase {

    constructor(
    ) {
    }

    private static _DB = { name: 'app_engine.db' };

    private _db: any;

    public initialize(): Promise<any> {
        var initialSteps = [
            this.createVersionHistoryTable,
            this.selectCurrentVersion
        ];
        var migrationSteps = this.executeMigrations();
        var steps = initialSteps.concat(migrationSteps);

        return new Promise((resolve, reject) => {
            try {
                this._db = win.openDatabase(WebSqlDatabase._DB.name, '1.0', 'database', 5 * 1024 * 1024);
                resolve(this._db);
            } catch (error) {
                Logger.warn(error);
                reject(error);
            }
        })
            .then((db) => {
                Logger.log("database opened");

                return steps
                    .map((step) => {
                        return step.bind(this);
                    })
                    .reduce((previous, current) => {
                        return previous.then(num => current(num));
                    }, Promise.resolve())
                    .then(() => {
                        Logger.log("All migrations executed");
                    }, (error) => {
                        Logger.log("Failed to initialize database: ", error);
                        throw error;
                    });
            }, (error) => {
                Logger.log("Failed to open database: ", error);
                throw error;
            });
    }

    private createVersionHistoryTable(): Promise<any> {
        let query = "CREATE TABLE IF NOT EXISTS version_history(versionNumber INTEGER PRIMARY KEY NOT NULL, migratedAt DATE)";
        return this.query(query)
            .then(() => {
                var versionNumber = 0;
                return versionNumber;
            }, (error) => {
                Logger.log("Failed to create version history table: ", error);
                throw error;
            });
    }

    private selectCurrentVersion(): Promise<any> {
        let query = "SELECT MAX(versionNumber) AS maxVersion FROM version_history";
        return this.query(query)
            .then((res) => {
                let maxVersion = res.rows.item(0).maxVersion;
                if (!maxVersion) maxVersion = 0;
                Logger.log("The current version is: " + maxVersion);
                return maxVersion;
            }, (error) => {
                Logger.log("Failed to select current version: ", error);
                throw error;
            });
    }

    private executeMigrations(): Array<any> {
        return databaseVersions.map((version) => {
            return (currentVersion) => {
                if (currentVersion >= version.versionNumber)
                    return Promise.resolve(currentVersion);

                var promise = this.executeInChain(version.queries)
                    .then(() => {
                        Logger.log("Version " + version.versionNumber + " migration executed");
                        return version.versionNumber;
                    }, (error) => {
                        Logger.log('Transaction error: ', error);
                        throw error;
                    })
                    .then(this.storeVersionInHistoryTable.bind(this));

                return promise;
            };
        });
    }

    private executeInChain(queries): Promise<any> {
        return this.sqlBatch(queries);
    }

    private storeVersionInHistoryTable(versionNumber) {
        var query = "INSERT INTO version_history (versionNumber, migratedAt) VALUES (?, ?)";
        return this.query(query, [versionNumber, new Date()])
            .then((res) => {
                Logger.log("Stored version in history table: " + versionNumber);
                return versionNumber;
            });
    }

    public transaction(fn): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                this._db.transaction(fn, (err: any) => reject(err), () => resolve());
            } catch (err) {
                reject(err);
            }
        });
    }

    public query(query: string, params?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                this._db.transaction((tx: any) => {
                    tx.executeSql(query, params,
                        (tx: any, res: any) => resolve(res),
                        (tx: any, err: any) => reject(err));
                }, (err: any) => reject(err));
            } catch (err) {
                reject(err);
            }
        });
    }

    public sqlBatch(sqlBatch): Promise<any> {
        var batchList, j, len1, myfn, st;
        if (!sqlBatch || sqlBatch.constructor !== Array) {
            throw new Error('sqlBatch expects an array');
        }
        batchList = [];
        for (j = 0, len1 = sqlBatch.length; j < len1; j++) {
            st = sqlBatch[j];
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
                    params: null
                });
            }
        }

        return new Promise((resolve, reject) => {
            try {
                this._db.transaction((tx: any) => {
                    batchList.forEach((query) => {
                        tx.executeSql(query.sql, query.params);
                    });
                }, e => reject(e), () => resolve());
            } catch (err) {
                reject(err);
            }
        });
    }

    public close(): Promise<any> {
        return Promise.reject('Not supported');
    }

    public deleteStorage(): Promise<any> {
        return Promise.reject('Not supported');
    }
}
