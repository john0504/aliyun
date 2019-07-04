import { Component } from '@angular/core';

import {
    ComponentModel,
    ControlItemModel,
    InformationModelService,
    UIOptions,
    UIComponentBase,
    RangeLogic,
    RangeLogicState,
    ToggleLogic,
    ToggleLogicState,
    ValueItem,
} from '../../../modules/information-model';

@Component({
  selector: 'range-with-toggle',
  templateUrl: 'range-with-toggle.html'
})
export class RangeWithToggle extends UIComponentBase {
  rangeLogic: RangeLogic;
  rangeState: RangeLogicState;
  title: string = '';
  toggleLogic: ToggleLogic;
  toggleState: ToggleLogicState;

  constructor(
    ims: InformationModelService,
  ) {
    super(ims, 'range-with-toggle', null);

    this.toggleLogic = new ToggleLogic(ims, this.exoChange);
    this.toggleState = this.toggleLogic.state;

    this.rangeLogic = new RangeLogic(ims, this.exoChange);
    this.rangeState = this.rangeLogic.state;
  }

  protected processLayout(model: ComponentModel, values: Array<ValueItem> | UIOptions, key: string, index: number, unitModel: ControlItemModel, range?: any) {
    if (!values || !model || !unitModel || (index !== 0 && index !== 1) ) return;
    this.title = model.title;

    if (index === 0) {
      this.rangeState = this.rangeLogic.processLayout(values, key, unitModel, range);
    } else if (index === 1) {
      this.toggleState = this.toggleLogic.processLayout(values, key, unitModel);
    }
  }

  protected processUIState(currentValueState: any, key: string, index: number, model: ControlItemModel) {
    if (!key || (index !== 0 && index !== 1)) return;

    if (index === 0) {
      this.rangeState = this.rangeLogic.processUIState(currentValueState, key, model);
    } else if (index === 1) {
      this.toggleState = this.toggleLogic.processUIState(currentValueState, key, model);
    }
  }

  protected processDisableState(disableState, key: string, index: number, model: ControlItemModel) {
    if (index !== 0 && index !== 1) return;

    if (index === 0) {
      this.rangeState = this.rangeLogic.processDisableState(disableState, key, model);
    } else if (index === 1) {
      this.toggleState = this.toggleLogic.processDisableState(disableState, key, model);
    }
  }

  sendRangeValue({ value: index }) {
    if (this.model) {
      this.rangeState = this.rangeLogic.sendValue(index);
    }
  }

  sendToggleValue() {
    if (this.model) {
      this.toggleState = this.toggleLogic.sendValue(this.toggleState.currentState);
    }
  }

  rangeValueChanges({ value: index }) {
    this.rangeState = this.rangeLogic.valueChanges(index);
  }
}
