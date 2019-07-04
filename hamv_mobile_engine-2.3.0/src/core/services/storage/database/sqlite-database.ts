import { SQLite, SQLiteObject } from '@ionic-native/sqlite';

import { databaseVersions } from './database-versions';
import { Logger } from '../../../../log/log-service';

export class SqliteDatabase {

    private static _DB = { name: 'app_engine.db', location: 'default' };

    private _db: SQLiteObject;

    constructor(
        private sqlite: SQLite
    ) {
    }

    public initialize(): Promise<any> {
        var initialSteps = [
            this.createVersionHistoryTable,
            this.selectCurrentVersion
        ];
        var migrationSteps = this.executeMigrations();
        var steps = initialSteps.concat(migrationSteps);
        return this.sqlite.create(SqliteDatabase._DB)
            .then((db) => {
                this._db = db;
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
        return this._db.executeSql(query, [])
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
        return this._db.executeSql(query, [])
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
        return this._db.sqlBatch(queries);
    }

    private storeVersionInHistoryTable(versionNumber) {
        var query = "INSERT INTO version_history (versionNumber, migratedAt) VALUES (?, ?)";
        return this._db.executeSql(query, [versionNumber, new Date().getTime()])
            .then((res) => {
                Logger.log("Stored version in history table: " + versionNumber);
                return versionNumber;
            });
    }

    public transaction(fn): Promise<any> {
        return this._db.transaction(fn);
    }

    public query(query: string, params?: any): Promise<any> {
        return this._db.executeSql(query, params);
    }

    public sqlBatch(sqlBatch): Promise<any> {
        return this._db.sqlBatch(sqlBatch);
    }

    public close(): Promise<any> {
        return this._db.close();
    }

    public deleteStorage(): Promise<any> {
        return this.close()
            .then(() => {
                return this.sqlite.deleteDatabase(SqliteDatabase._DB);
            });
    }
}
