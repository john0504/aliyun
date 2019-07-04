export interface WifiAP {
    ssid: string;
    sec: string;
    dbm: number;
}

export const WifiSecurityType = {
    WEP: 'wep',
    WPA: 'wpa',
    WPA2: 'wpa2',
    OPEN: 'open',
};