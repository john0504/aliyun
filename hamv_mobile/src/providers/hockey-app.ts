import { Injectable } from '@angular/core';
import { Cordova, IonicNativePlugin, Plugin } from '@ionic-native/core';

@Plugin({
    pluginName: 'HockeyApp',
    pluginRef: 'hockeyapp',
    plugin: 'cordova-plugin-hockeyapp',
    repo: 'https://github.com/bitstadium/HockeySDK-Cordova',
    platforms: ['iOS', 'Android']
})
@Injectable()
export class HockeyApp extends IonicNativePlugin {

    @Cordova({
        successIndex: 0,
        errorIndex: 1,
    })
    start(appId: string, autoSend?: boolean, ignoreDefaultHandler?: any, loginMode?: number, appSecret?: string): Promise<any> { return; }

    @Cordova({
        successIndex: 0,
        errorIndex: 1,
    })
    feedback(): Promise<any> { return; }

    @Cordova({
        successIndex: 0,
        errorIndex: 1,
    })
    composeFeedback(attachScreenshot: boolean, data: any): Promise<any> { return; }

    @Cordova({
        successIndex: 0,
        errorIndex: 1,
    })
    forceCrash(): Promise<any> { return; }

    @Cordova({
        successIndex: 0,
        errorIndex: 1,
    })
    checkForUpdate(): Promise<any> { return; }

    @Cordova({
        successIndex: 0,
        errorIndex: 1,
    })
    addMetaData(data: Object): Promise<any> { return; }

    @Cordova({
        successIndex: 0,
        errorIndex: 1,
    })
    trackEvent(eventName: string): Promise<any> { return; }

    loginMode: {
        ANONYMOUS: 0,
        EMAIL_ONLY: 1,
        EMAIL_PASSWORD: 2,
        VALIDATE: 3
    };
}
