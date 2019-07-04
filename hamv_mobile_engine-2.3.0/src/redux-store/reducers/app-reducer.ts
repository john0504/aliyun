import { AppActions } from '../actions/app-actions';
import { AppState } from '../store/app-state';

const INITIAL_STATE: AppState = {
    isInitialized: false,
    account: null,
    isAuthenticated: false,
    userData: {},
    userMe: null,
    devices: {},
    deviceDisplayList: [],
    groups: {},
    groupDisplayList: [],
    dnssdServices: [],
};

export default function appReducer(state = INITIAL_STATE, action): AppState {
    switch (action.type) {
        case AppActions.APP_INITIALIZE_DONE:
            if (!action.error) {
                return Object.assign({}, state, { isInitialized: true });
            }
            return state;
        case AppActions.GET_ACCOUNT_DONE:
        case AppActions.SET_ACCOUNT_DONE:
        case AppActions.WS_REQUEST_PROVISION_TOKEN_DONE:
            if (!action.error) {
                return Object.assign({}, state, { account: action.payload });
            }
            return state;
        case AppActions.REGISTER_DONE:
        case AppActions.LOGIN_DONE:
        case AppActions.LOGIN_WITH_FB_DONE:
        case AppActions.REFRESH_TOKEN_DONE:
        case AppActions.SESSION_DONE:
            if (!action.error) {
                return Object.assign({}, state, { account: action.payload, isAuthenticated: true });
            }
            return Object.assign({}, state, { isAuthenticated: false });
        case AppActions.WS_TOKEN_EXPIRED:
            return Object.assign({}, state, { isAuthenticated: false });
        case AppActions.LOGOUT_DONE:
            if (!action.error) {
                return Object.assign({}, INITIAL_STATE, { account: action.payload, isInitialized: state.isInitialized });
            }
            return state;
        case AppActions.DELETE_ACCOUNT_DONE:
        case AppActions.REMOVE_ALL_DATA_DONE:
            if (!action.error) {
                return Object.assign({}, INITIAL_STATE, { isInitialized: state.isInitialized });
            }
            return state;
        case AppActions.REFRESH_DEVICES_DONE:
            if (!action.error) {
                let newDevices = Object.assign({}, state.devices, action.payload);
                return Object.assign({}, state, { devices: newDevices });
            }
            return state;
        case AppActions.FILTER_DEVICES_DONE:
            if (!action.error) {
                return Object.assign({}, state, { deviceDisplayList: action.payload });
            }
            return state;
        case AppActions.REFRESH_GROUPS_DONE:
            if (!action.error) {
                let newGroups = Object.assign({}, state.groups, action.payload);
                return Object.assign({}, state, { groups: newGroups });
            }
            return state;
        case AppActions.FILTER_GROUPS_DONE:
            if (!action.error) {
                return Object.assign({}, state, { groupDisplayList: action.payload });
            }
            return state;
        case AppActions.WS_REQUEST_SET_DONE: {
            if (!action.error) {
                let { sn, commands } = action.payload;
                let d = state.devices[sn];
                if (d) {
                    d.status = Object.assign({}, d.status, commands);
                }
            }
            let newDevices = Object.assign({}, state.devices);
            return Object.assign({}, state, { devices: newDevices });
        }
        case AppActions.WS_REQUEST_CALENDAR_DONE: {
            if (!action.error) {
                let { sn, calendar } = action.payload;
                let d = state.devices[sn];
                if (d && calendar) {
                    d.calendar = calendar;
                }
            }
            let newDevices = Object.assign({}, state.devices);
            return Object.assign({}, state, { devices: newDevices });
        }
        case AppActions.WS_REQUEST_ADD_USER_DONE: {
            if (!action.error) {
                let { sn, user } = action.payload;
                let d = state.devices[sn];
                if (d) {
                    d.users = [...d.users, user];
                }
            }
            let newDevices = Object.assign({}, state.devices);
            return Object.assign({}, state, { devices: newDevices });
        }
        case AppActions.WS_REQUEST_REMOVE_USER_DONE: {
            if (!action.error) {
                let { sn, email } = action.payload;
                let d = state.devices[sn];
                if (d) {
                    let index = d.users.findIndex((element, index, array) => {
                        return element.email === email;
                    });
                    if (index > -1) {
                        d.users.splice(index, 1);
                    }
                }
            }
            let newDevices = Object.assign({}, state.devices);
            return Object.assign({}, state, { devices: newDevices });
        }
        case AppActions.WS_REQUEST_SET_PROPERTIES:
        case AppActions.WS_REQUEST_SET_PROPERTIES_DONE: {
            if (!action.error) {
                let { sn, properties } = action.payload;
                let d = state.devices[sn];
                if (d && properties) {
                    d.properties = Object.assign({}, d.properties, properties);
                }
            }
            let newDevices = Object.assign({}, state.devices);
            return Object.assign({}, state, { devices: newDevices });
        }
        case AppActions.WS_REQUEST_DELETE_PROPERTIES:
        case AppActions.WS_REQUEST_DELETE_PROPERTIES_DONE: {
            if (!action.error) {
                let { sn, properties } = action.payload;
                let d = state.devices[sn];
                if (d && properties) {
                    for (let key in properties) {
                        const value = properties[key];
                        delete d.properties[value];
                    }
                }
            }
            let newDevices = Object.assign({}, state.devices);
            return Object.assign({}, state, { devices: newDevices });
        }
        case AppActions.WS_EVENT_DELETE_DEVICE: {
            if (!action.error) {
                let { device } = action.payload.data;
                delete state.devices[device];
            }
            let newDevices = Object.assign({}, state.devices);
            return Object.assign({}, state, { devices: newDevices });
        }
        case AppActions.WS_REQUEST_DELETE_DEVICE_DONE: {
            if (!action.error) {
                let sn = action.payload;
                delete state.devices[sn];
            }
            let newDevices = Object.assign({}, state.devices);
            return Object.assign({}, state, { devices: newDevices });
        }
        case AppActions.WS_REQUEST_SET_GROUP:
        case AppActions.WS_REQUEST_SET_GROUP_DONE: {
            if (!action.error) {
                let group = action.payload;
                state.groups[group.name] = group;
                if (!state.groupDisplayList.some(groupName => groupName === group.name)) {
                    state.groupDisplayList.push(group.name);
                }
            }
            let newGroups = Object.assign({}, state.groups);
            return Object.assign({}, state, { groups: newGroups });
        }
        case AppActions.WS_EVENT_DELETE_GROUP: {
            if (!action.error) {
                let { name } = action.payload.data;
                delete state.groups[name];
            }
            let newGroups = Object.assign({}, state.groups);
            return Object.assign({}, state, { groups: newGroups });
        }
        case AppActions.WS_REQUEST_DELETE_GROUP_DONE: {
            if (!action.error) {
                let name = action.payload;
                delete state.groups[name];
            }
            let newGroups = Object.assign({}, state.groups);
            return Object.assign({}, state, { groups: newGroups });
        }
        case AppActions.UPDATE_DNSSD_LIST:
            return Object.assign({}, state, { dnssdServices: action.payload });
        case AppActions.GET_USER_DATA_DONE:
        case AppActions.SET_USER_DATA_DONE:
        case AppActions.WS_REQUEST_SET_USER_DATA_DONE:
        case AppActions.WS_REQUEST_DELETE_USER_DATA_DONE:
        case AppActions.WS_REQUEST_GET_USER_DATA_DONE:
            if (!action.error) {
                return Object.assign({}, state, { userData: action.payload });
            }
            return state;
        case AppActions.WS_EVENT_USER_DATA_CHANGE:
            if (!action.error) {
                return Object.assign({}, state, { userData: action.payload.data });
            }
            return state;
        case AppActions.GET_USER_ME_DONE:
        case AppActions.SET_USER_ME_DONE:
        case AppActions.WS_REQUEST_GET_ME_DONE:
            if (!action.error) {
                return Object.assign({}, state, { userMe: action.payload });
            }
            return state;
        default:
            return state;
    }
}
