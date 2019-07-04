import { Component } from '@angular/core';

import {
    ComponentModel,
    ControlItemModel,
    InformationModelService,
    UIOptions,
    UIComponentBase,
    ButtonGroupLogic,
    ButtonGroupLogicState,
    ToggleLogic,
    ToggleLogicState,
    ValueItem,
} from '../../../modules/information-model';

@Component({
  selector: 'button-group-with-toggle',
  templateUrl: 'button-group-with-toggle.html'
})
export class ButtonGroupWithToggle extends UIComponentBase {
  btnGroupLogic: ButtonGroupLogic;
  btnGroupState: ButtonGroupLogicState;
  title: string = '';
  toggleLogic: ToggleLogic;
  toggleState: ToggleLogicState;

  constructor(
    ims: InformationModelService,
  ) {
    super(ims, 'button-group-with-toggle', null);

    this.toggleLogic = new ToggleLogic(ims, this.exoChange);
    this.toggleState = this.toggleLogic.state;

    this.btnGroupLogic = new ButtonGroupLogic(ims, this.exoChange);
    this.btnGroupState = this.btnGroupLogic.state;
  }

  protected processLayout(model: ComponentModel, values: Array<ValueItem> | UIOptions, key: string, index: number, unitModel: ControlItemModel) {
    if (!values || !model || !unitModel || (index !== 0 && index !== 1) ) return;
    this.title = model.title;

    if (index === 0) {
      this.btnGroupState = this.btnGroupLogic.processLayout(values, key, unitModel);
    } else if (index === 1) {
      this.toggleState = this.toggleLogic.processLayout(values, key, unitModel);
    }
  }

  protected processUIState(currentValueState: any, key: string, index: number, model: ControlItemModel) {
    if (!key || (index !== 0 && index !== 1)) return;

    if (index === 0) {
      this.btnGroupState = this.btnGroupLogic.processUIState(currentValueState, key, model);
    } else if (index === 1) {
      this.toggleState = this.toggleLogic.processUIState(currentValueState, key, model);
    }
  }

  protected processDisableState(disableState, key: string, index: number, model: ControlItemModel) {
    if (index !== 0 && index !== 1) return;

    if (index === 0) {
      this.btnGroupState = this.btnGroupLogic.processDisableState(disableState, key, model);
    } else if (index === 1) {
      this.toggleState = this.toggleLogic.processDisableState(disableState, key, model);
    }
  }

  onButtonClicked(val: any) {
    if (this.model) {
        this.btnGroupState = this.btnGroupLogic.sendValue(val);
    }
  }

  sendToggleValue() {
    if (this.model) {
      this.toggleState = this.toggleLogic.sendValue(this.toggleState.currentState);
    }
  }
}
