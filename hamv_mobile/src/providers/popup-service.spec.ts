import {
  TestBed,
  getTestBed
} from '@angular/core/testing';
import {
  LoadingController,
  ToastController,
} from 'ionic-angular';
import {
  LoadingControllerMock,
  ToastControllerMock,
} from 'ionic-mocks';

import { PopupService } from './popup-service';

describe('Check popup service', () => {

  let instance: PopupService;
  let toastCtrl: ToastController;
  let loadingCtrl: LoadingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: ToastController, useFactory: () => ToastControllerMock.instance() },
        { provide: LoadingController, useFactory: () => LoadingControllerMock.instance() },
        PopupService,
      ],
    });
    const injector = getTestBed();
    instance = injector.get(PopupService);
    toastCtrl = injector.get(ToastController);
    loadingCtrl = injector.get(LoadingController);
  });

  it('show loading popup', () => {
    const options = {
      duration: 5000,
      content: 'Hello world!',
    };
    return instance.loadingPopup(Promise.resolve(), options)
      .then(() => {
        expect(loadingCtrl.create).toHaveBeenCalledWith({
          duration: 5000,
          content: 'Hello world!',
        });
      });
  });

  it('don\'t show loading popup when there is no loading options', () => {
    return instance.loadingPopup(Promise.resolve(), null)
      .then(() => expect(loadingCtrl.create).not.toHaveBeenCalled());
  });

  it('show loading popup with error promise', () => {
    const options = {
      duration: 5000,
      content: 'Hello world!',
    };
    return instance.loadingPopup(Promise.reject(new Error('forced error')), options)
      .catch(e => {
        expect(e).toBeDefined();
        expect(e.message).toEqual('forced error');
      });
  });

  it('show toast popup when promise success', () => {
    const successOptions = {
      duration: 3000,
      message: 'Hello world!',
      position: 'bottom',
    };
    return instance.toastPopup(Promise.resolve(), successOptions)
      .then(() => {
        expect(toastCtrl.create).toHaveBeenCalledWith({
          duration: 3000,
          message: 'Hello world!',
          position: 'bottom',
        });
      });
  });

  it('show toast popup when promise throws error', () => {
    const errorOptions = {
      duration: 3000,
      message: 'Something wrong!!',
      position: 'bottom',
    };
    return instance.toastPopup(Promise.reject(new Error('forced error')), null, errorOptions)
      .catch(e => {
        expect(e).toBeDefined();
        expect(e.message).toEqual('forced error');
        expect(toastCtrl.create).toHaveBeenCalledWith({
          duration: 3000,
          message: 'Something wrong!!',
          position: 'bottom',
        });
      });
  });

  it('don\'t show toast popup when there is no options', () => {
    return instance.toastPopup(Promise.resolve(), null, null)
      .then(() => expect(toastCtrl.create).not.toHaveBeenCalled())
      .then(() => instance.toastPopup(Promise.reject(new Error('forced error')), null, null))
      .catch(e => {
        expect(e).toBeDefined();
        expect(e.message).toEqual('forced error');
        expect(toastCtrl.create).not.toHaveBeenCalled();
      });
  });

});