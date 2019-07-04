export class AlertMock {

  public static instance(): any {
    let _dismissCallback: Function;
    let instance = jasmine.createSpyObj('Alert', ['present', 'dismiss', 'onDidDismiss', 'options', 'triggerButtonHandler']);
    instance.present.and.returnValue(Promise.resolve());

    instance.dismiss.and.callFake(x => {
      _dismissCallback(x);
      return Promise.resolve();
    });

    instance.onDidDismiss.and.callFake((callback: Function) => {
      if (callback) {
        _dismissCallback = callback;
      }
    });

    let _options;
    instance.options.and.callFake((opts?) => {
      _options = opts;
    });

    instance.triggerButtonHandler.and.callFake((number, value?) => {
      const buttons = _options && _options.buttons;
      if (buttons && number >= 0 && number < buttons.length && buttons[number] && buttons[number].handler) {
        buttons[number].handler(value);
      }
    });

    return instance;
  }

}

export class AlertControllerMock {

  public static instance(alertMock?: AlertMock): any {

    const instance = jasmine.createSpyObj('AlertController', ['create']);

    const returnMock = alertMock || AlertMock.instance();

    // re-assign options every time when calling 'create' function
    instance.create.and.callFake((opts) => {
      returnMock.options(opts);
      return returnMock;
    });

    return instance;
  }
}

export class ActionSheetMock {

  public static instance(): any {
    let _dismissCallback: Function;
    let instance = jasmine.createSpyObj('ActionSheet', ['present', 'dismiss', 'onDidDismiss', 'options', 'triggerButtonHandler', 'addButton']);
    instance.present.and.returnValue(Promise.resolve());

    instance.dismiss.and.callFake(x => {
      _dismissCallback(x);
      return Promise.resolve();
    });

    instance.onDidDismiss.and.callFake((callback: Function) => {
      if (callback) {
        _dismissCallback = callback;
      }
    });

    let _options;
    let buttons = [];
    instance.options.and.callFake((opts?) => {
      _options = opts;
      const obs = _options && _options.buttons;
      buttons = obs || [];
    });

    instance.addButton.and.callFake(button => {
      buttons.push(button);
    });

    instance.triggerButtonHandler.and.callFake((number) => {
      if (number >= 0 && number < buttons.length && buttons[number] && buttons[number].handler) {
        buttons[number].handler();
      }
    });

    return instance;
  }

}

export class ActionSheetControllerMock {

  public static instance(alertMock?: ActionSheetMock): any {

    const instance = jasmine.createSpyObj('ActionSheetController', ['create']);

    const returnMock = alertMock || ActionSheetMock.instance();

    // re-assign options every time when calling 'create' function
    instance.create.and.callFake((opts) => {
      returnMock.options(opts);
      return returnMock;
    });

    return instance;
  }
}