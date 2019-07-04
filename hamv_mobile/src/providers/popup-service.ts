import { Injectable } from '@angular/core';
import {
    Loading,
    LoadingController,
    LoadingOptions,
    Toast,
    ToastController,
    ToastOptions,
} from 'ionic-angular';

@Injectable()
export class PopupService {
    constructor(
        private loadingCtrl: LoadingController,
        private toastCtrl: ToastController,
    ) { }

    public loadingPopup(promise: Promise<any>, loadingOptions?: LoadingOptions): Promise<any> {
        if (!loadingOptions) {
            return promise;
        }

        const loading = this.makeLoading(loadingOptions);
        return promise
            .then(result => {
                loading.dismiss();
                return Promise.resolve(result);
            })
            .catch(error => {
                loading.dismiss();
                return Promise.reject(error);
            });
    }

    public makeLoading(options: LoadingOptions): Loading {
        const loading: Loading = this.loadingCtrl.create(options);
        loading.present();
        return loading;
    }

    public toastPopup(promise: Promise<any>, successToastOptions?: ToastOptions, failureToastOptions?: ToastOptions): Promise<any> {
        return promise
            .then(result => {
                if (successToastOptions) {
                    this.makeToast(successToastOptions);
                }
                return Promise.resolve(result);
            })
            .catch(error => {
                if (failureToastOptions) {
                    this.makeToast(failureToastOptions);
                }
                return Promise.reject(error);
            });
    }

    public makeToast(options: ToastOptions): Toast {
        const toast: Toast = this.toastCtrl.create(options);
        toast.present();
        return toast;
    }
}
