export class AppActions {

    static APP_INITIALIZE: string = 'app-initialize';
    static APP_INITIALIZE_DONE: string = 'app-initialize-done';

    static GET_ACCOUNT: string = 'get-account';
    static GET_ACCOUNT_DONE: string = 'get-account-done';
    static SET_ACCOUNT: string = 'set-account';
    static SET_ACCOUNT_DONE: string = 'set-account-done';

    static GET_USER_DATA: string = 'get-user-data';
    static GET_USER_DATA_DONE: string = 'get-user-data-done';
    static SET_USER_DATA: string = 'set-user-data';
    static SET_USER_DATA_DONE: string = 'set-user-data-done';

    static GET_USER_ME: string = 'get-user-me';
    static GET_USER_ME_DONE: string = 'get-user-me-done';
    static SET_USER_ME: string = 'set-user-me';
    static SET_USER_ME_DONE: string = 'set-user-me-done';

    static REFRESH_DEVICES: string = 'refresh-devices';
    static REFRESH_DEVICES_DONE: string = 'refresh-devices-done';
    static FILTER_DEVICES: string = 'filter-devices';
    static FILTER_DEVICES_DONE: string = 'filter-devices-done';

    static REFRESH_GROUPS: string = 'refresh-groups';
    static REFRESH_GROUPS_DONE: string = 'refresh-groups-done';
    static FILTER_GROUPS: string = 'filter-groups';
    static FILTER_GROUPS_DONE: string = 'filter-groups-done';

    static REGISTER: string = 'register';
    static REGISTER_DONE: string = 'register-done';

    static SENDMAIL: string = 'sendmail';
    static SENDMAIL_DONE: string = 'sendmail-done';

    static SENDSMS: string = 'sendsms';
    static SENDSMS_DONE: string = 'sendsms-done';

    static ALLDEVICE: string = 'alldevice';
    static ALLDEVICE_DONE: string = 'alldevice-done';

    static UPDATEDEVICE: string = 'updatedevice';
    static UPDATEDEVICE_DONE: string = 'updatedevice-done';

    static DELETEDEVICE: string = 'deletedevice';
    static DELETEDEVICE_DONE: string = 'deletedevice-done';

    static PAYMENT: string = 'payment';
    static PAYMENT_DONE: string = 'payment-done';
    //login action
    static LOGIN: string = 'login';
    static LOGIN_DONE: string = 'login-done';
    static LOGIN_WITH_FB: string = 'login-with-fb';
    static LOGIN_WITH_FB_DONE: string = 'login-with-fb-done';
    // session
    static SESSION: string = 'session';
    static SESSION_DONE: string = 'session-done';
    // refresh token
    static REFRESH_TOKEN: string = 'refresh-token';
    static REFRESH_TOKEN_DONE: string = 'refresh-token-done';

    static REQUEST_RESET_PASSWORD: string = 'request-reset-password';
    static REQUEST_RESET_PASSWORD_DONE: string = 'request-reset-password-done';

    static REQUEST_RESET_PASSWORD_SMS: string = 'request-reset-password-sms';
    static REQUEST_RESET_PASSWORD_SMS_DONE: string = 'request-reset-password-sms-done';
    //logout action
    static LOGOUT: string = 'logout';
    static LOGOUT_DONE: string = 'logout-done';

    static DELETE_ACCOUNT: string = 'delete-account';
    static DELETE_ACCOUNT_DONE: string = 'delete-account-done';

    static REMOVE_ALL_DATA: string = 'remove-all-data';
    static REMOVE_ALL_DATA_DONE: string = 'remove-all-data-done';

    static QUERY_DEVICE_INFO: string = 'query-device-info';
    static QUERY_DEVICE_INFO_DONE: string = 'query-device-info-done';

    static FIRE_AP_MODE: string = 'fire-ap-mode';
    static FIRE_AP_MODE_DONE: string = 'fire-ap-mode-done';

    static OTA_SERVICE: string = 'ota-service';
    static OTA_SERVICE_DONE: string = 'ota-service-done';

    static BROADCAST: string = 'broadcast';
    static BROADCAST_DONE: string = 'broadcast-done';

    static LOCAL_MODE: string = 'local-mode';
    static LOCAL_MODE_DONE: string = 'local-mode-done';

    static GET_DEVICE_MODEL_INFO: string = 'get-device-model-info';
    static GET_DEVICE_MODEL_INFO_DONE: string = 'get-device-model-info-done';

    static GET_FIRMWARE_LIST: string = 'get-firmware-list';
    static GET_FIRMWARE_LIST_DONE: string = 'get-firmware-list-done';

    static GET_HISTORICAL_DATA: string = 'get-historical-data';
    static GET_HISTORICAL_DATA_DONE: string = 'get-historical-data-done';

    static GET_SERVICE_STATUS: string = 'get-service-status';
    static GET_SERVICE_STATUS_DONE: string = 'get-service-status-done';

    static POST_SERVICE_STATUS: string = 'post-service-status';
    static POST_SERVICE_STATUS_DONE: string = 'post-service-status-done';

    static REQUEST_USER_DATA: string = 'request-user-data';
    static REQUEST_USER_DATA_DONE: string = 'request-user-data-done';

    //Dnssd
    static DNSSD_WATCH: string = 'dnssd-watch';
    static DNSSD_WATCH_DONE: string = 'dnssd-watch-done';
    static DNSSD_UNWATCH: string = 'dnssd-unwatch';
    static DNSSD_UNWATCH_DONE: string = 'dnssd-unwatch-done';
    static UPDATE_DNSSD_LIST: string = 'update-dnssd-list';

    // websocket on/off
    static WEBSOCKET_OPEN: string = 'websocket-open';
    static WEBSOCKET_OPEN_DONE: string = 'websocket-open-done';
    static WEBSOCKET_CLOSE: string = 'websocket-close';
    static WEBSOCKET_CLOSE_DONE: string = 'websocket-close-done';
    static WEBSOCKET_CONNECTION: string = 'websocket-connection';

    // websocket auth
    static WS_TOKEN_EXPIRED = "ws-token-expired";

    // websocket request
    static WS_REQUEST_LOGIN: string = 'ws-request-login';
    static WS_REQUEST_LOGIN_DONE: string = 'ws-request-login-done';
    static WS_REQUEST_PROVISION_TOKEN: string = 'ws-request-provision-token';
    static WS_REQUEST_PROVISION_TOKEN_DONE: string = 'ws-request-provision-token-done';
    static WS_REQUEST_INIT: string = 'ws-request-init';
    static WS_REQUEST_INIT_DONE: string = 'ws-request-init-done';
    static WS_REQUEST_SET: string = 'ws-request-set';
    static WS_REQUEST_SET_DONE: string = 'ws-request-set-done';
    static WS_REQUEST_GET: string = 'ws-request-get';
    static WS_REQUEST_GET_DONE: string = 'ws-request-get-done';
    static WS_REQUEST_OTA: string = 'ws-request-ota';
    static WS_REQUEST_OTA_DONE: string = 'ws-request-ota-done';
    static WS_REQUEST_CALENDAR: string = 'ws-request-calendar';
    static WS_REQUEST_CALENDAR_DONE: string = 'ws-request-calendar-done';
    static WS_REQUEST_ADD_USER: string = 'ws-request-add-user';
    static WS_REQUEST_ADD_USER_DONE: string = 'ws-request-add-user-done';
    static WS_REQUEST_ADD_SHARING_DEVICE: string = 'ws-request-add-sharing-device';
    static WS_REQUEST_ADD_SHARING_DEVICE_DONE: string = 'ws-request-add-sharing-device-done';
    static WS_REQUEST_GET_SHARING_TOKEN: string = 'ws-request-get-sharing-token';
    static WS_REQUEST_GET_SHARING_TOKEN_DONE: string = 'ws-request-get-sharing-token-done';
    static WS_REQUEST_REMOVE_USER: string = 'ws-request-remove-user';
    static WS_REQUEST_REMOVE_USER_DONE: string = 'ws-request-remove-user-done';
    static WS_REQUEST_LIST_USER: string = 'ws-request-list-user';
    static WS_REQUEST_LIST_USER_DONE: string = 'ws-request-list-user-done';
    static WS_REQUEST_LIST_DEVICE: string = 'ws-request-list-device';
    static WS_REQUEST_LIST_DEVICE_DONE: string = 'ws-request-list-device-done';
    static WS_REQUEST_SET_PROPERTIES: string = 'ws-request-set-properties';
    static WS_REQUEST_SET_PROPERTIES_DONE: string = 'ws-request-set-properties-done';
    static WS_REQUEST_DELETE_PROPERTIES: string = 'ws-request-delete-properties';
    static WS_REQUEST_DELETE_PROPERTIES_DONE: string = 'ws-request-delete-properties-done';
    static WS_REQUEST_DELETE_DEVICE: string = 'ws-request-delete-device';
    static WS_REQUEST_DELETE_DEVICE_DONE: string = 'ws-request-delete-device-done';
    static WS_REQUEST_SET_GROUP: string = 'ws-request-set-group';
    static WS_REQUEST_SET_GROUP_DONE: string = 'ws-request-set-group-done';
    static WS_REQUEST_GET_GROUP: string = 'ws-request-get-group';
    static WS_REQUEST_GET_GROUP_DONE: string = 'ws-request-get-group-done';
    static WS_REQUEST_DELETE_GROUP: string = 'ws-request-delete-group';
    static WS_REQUEST_DELETE_GROUP_DONE: string = 'ws-request-delete-group-done';
    static WS_REQUEST_LIST_GROUP: string = 'ws-request-list-group';
    static WS_REQUEST_LIST_GROUP_DONE: string = 'ws-request-list-group-done';
    static WS_REQUEST_SET_USER_DATA: string = 'ws-request-set-user-data';
    static WS_REQUEST_SET_USER_DATA_DONE: string = 'ws-request-set-user-data-done';
    static WS_REQUEST_DELETE_USER_DATA: string = 'ws-request-delete-user-data';
    static WS_REQUEST_DELETE_USER_DATA_DONE: string = 'ws-request-delete-user-data-done';
    static WS_REQUEST_GET_USER_DATA: string = 'ws-request-get-user-data';
    static WS_REQUEST_GET_USER_DATA_DONE: string = 'ws-request-get-user-data-done';
    static WS_REQUEST_GET_ME: string = 'ws-request-get-me';
    static WS_REQUEST_GET_ME_DONE: string = 'ws-request-get-me-done';

    // websocket event
    static WS_EVENT_DEVICE_CHANGE: string = 'ws-event-device-change';
    static WS_EVENT_ADD_DEVICE: string = 'ws-event-add-device';
    static WS_EVENT_DELETE_DEVICE: string = 'ws-event-delete-device';
    static WS_EVENT_SET_GROUP: string = 'ws-event-set-group';
    static WS_EVENT_DELETE_GROUP: string = 'ws-event-delete-group';
    static WS_EVENT_CALENDAR: string = 'ws-event-calendar';
    static WS_EVENT_UNKNOWN: string = 'ws-event-unknown';
    static WS_EVENT_USER_DATA_CHANGE: string = 'ws-event-user-data-change';

    static REMOVE_ERROR: string = 'remove-error';

    // follow Flux Standard Action spec
    public static action(type: string, payload?: any, error: boolean = false, meta?: any) {
        return { type, payload, error, meta };
    }

}
