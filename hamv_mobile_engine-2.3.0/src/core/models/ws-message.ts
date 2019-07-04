export interface WebsocketMessage {
}

export interface Traceable {
    id: number;
}

export interface WebsocketEvent extends WebsocketMessage {
    event: string;
    data?: any;
}

export interface WebsocketRequest extends WebsocketMessage, Traceable {
    request: string;
    device?: string;
    data?: any;
}

export const makeWsRequest = (request: string, data?: any, device?: string):
    WebsocketRequest => {
    return {
        id: -1,
        request,
        device,
        data,
    }
}

export interface WebsocketResponse extends WebsocketMessage, Traceable {
    response: string;
    status: string;
    message?: string;
    code? :number;
}

export const WebsocketRequestType = {
    LOGIN: 'login',
    PROVISION_TOKEN: 'provision_token',
    GET_ME: 'get_me',
    CONFIG: 'config',
    SET: 'set',
    GET: 'get',
    OTA: 'ota',
    CALENDAR: 'calendar',
    ADD_USER: 'add_user',
    ADD_SHARING_DEVICE: 'add_user_verify',
    GET_SHARING_TOKEN: 'add_user',
    REMOVE_USER: 'rem_user',
    LIST_USER: 'lst_user',
    LIST_DEVICE: 'lst_device',
    SET_PROPERTIES: 'set_properties',
    DELETE_PROPERTIES: 'del_properties',
    DELETE_DEVICE: 'del_device',
    SET_GROUP: 'set_group',
    GET_GROUP: 'get_group',
    DELETE_GROUP: 'del_group',
    LIST_GROUP: 'lst_group',
    SET_USER_DATA: 'set_user_data',
    DELETE_USER_DATA: 'del_user_data',
    GET_USER_DATA: 'get_user_data',
};

export const WebsocketEventType = {
    TOKEN_EXPIRED: 'token_expired',
    DEVICE_CHANGE: 'device_change',
    ADD_DEVICE: 'add_device',
    DELETE_DEVICE: 'del_device',
    SET_GROUP: 'set_group',
    DELETE_GROUP: 'del_group',
    CALENDAR: 'calendar',
    USER_DATA_CHANGE: 'user_data_change',
};
