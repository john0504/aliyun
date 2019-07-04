export interface DatabaseVersion {
    versionNumber: number;
    queries?: Array<string>;
}

export const databaseVersions: Array<DatabaseVersion> = [
    {
        versionNumber: 1,
        queries: [
            "CREATE TABLE IF NOT EXISTS device_model(device_sn TEXT PRIMARY KEY ON CONFLICT REPLACE NOT NULL, profile_esh_class TEXT, profile_esh_esh_version TEXT, profile_esh_device_id TEXT, profile_esh_brand TEXT, profile_esh_model TEXT, profile_module_fw_version TEXT, profile_module_mac_address TEXT, profile_module_local_ip TEXT, profile_module_ssid TEXT, profile_cert TEXT, calendar TEXT, status TEXT, fields TEXT, users TEXT, role TEXT, owner TEXT, properties TEXT);",
            "CREATE TABLE IF NOT EXISTS group_model(group_id TEXT PRIMARY KEY ON CONFLICT REPLACE NOT NULL, properties TEXT);",
            "CREATE TABLE IF NOT EXISTS device_group_model(device_sn TEXT NOT NULL REFERENCES device_model(device_sn) ON DELETE CASCADE, group_id TEXT NOT NULL REFERENCES group_model(group_id) ON DELETE CASCADE, PRIMARY KEY (device_sn, group_id));",
        ]
    },
    {
        versionNumber: 2,
        queries: [
            "CREATE TABLE IF NOT EXISTS provision_info_model(device_sn TEXT PRIMARY KEY ON CONFLICT REPLACE NOT NULL, secret TEXT);",
        ]
    },
    {
        versionNumber: 3,
        queries: [
            "ALTER TABLE device_model ADD COLUMN connected INTEGER DEFAULT 0;",
        ]
    },
    {
        versionNumber: 4,
        queries: [
            "ALTER TABLE device_model ADD COLUMN device_state TEXT DEFAULT 'idle';",
        ]
    },
    {
        versionNumber: 5,
        queries: [
            "DROP TABLE provision_info_model;",
        ]
    },    
    {
        versionNumber: 6,
        queries: [
            "ALTER TABLE device_model ADD COLUMN fields_range TEXT DEFAULT '[]';",
        ]
    },
];
