import {
  Component,
  forwardRef,
  ViewEncapsulation
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { AppTasks } from 'app-engine';

import {
  ComponentModel,
  ControlItemModel,
  InformationModelService,
  ReadOnlyLogic,
  ReadOnlyLogicState,
  UIOptions,
  UIComponentBase,
  ValueItem
} from '../../../modules/information-model';

@Component({
  selector: 'color-text',
  templateUrl: 'color-text.html',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ColorText), multi: true }],
  encapsulation: ViewEncapsulation.None,
})
export class ColorText extends UIComponentBase {
  title: string = '';
  logic: ReadOnlyLogic;
  state: ReadOnlyLogicState;
  options: any;
  fontColor: string = '#000000';

  constructor(
    ims: InformationModelService,
    appTasks: AppTasks,
  ) {
    super(ims, 'color-text', null);
    this.logic = new ReadOnlyLogic(ims, this.exoChange);
    this.state = this.logic.state;
  }

  protected processLayout(model: ComponentModel, values: Array<ValueItem> | UIOptions, key: string, index: number, unitModel: ControlItemModel) {
    if (!values || !model || !unitModel || index !== 0) return;
    this.title = model.title;
    this.state = this.logic.processLayout(values, key, unitModel);
  }

  protected processUIState(currentValueState: any, key: string, index: number, model: ControlItemModel) {
    if (!key || index !== 0) return;
    this.state = this.logic.processUIState(currentValueState, key, model);
    this.options = model.options;
    this.fontColor = model.options ? model.options.fontColor : "#000000";
  }

  protected processDisableState(disableState, key: string, index: number, model: ControlItemModel) {
    if (index !== 0) return;
    this.state = this.logic.processDisableState(disableState, key, model);
  }
}
