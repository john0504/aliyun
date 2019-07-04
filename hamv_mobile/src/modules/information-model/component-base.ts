import {
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { NgControl } from '@angular/forms';
import isEqual from 'lodash/isEqual';

import { ComponentModel, ControlItemModel, UIOptions, ValueItem } from './information-model';
import { InformationModelService } from './information-model-service';

export interface UIComponent extends ControlValueAccessor {

  model: ComponentModel;
  color: string;
  value: any;
  disabled: boolean;
  data: { [keys: string]: any };

  exoChange: EventEmitter<{ key: string, value: any }>;
}

export abstract class UIComponentBase implements UIComponent {

  _model: ComponentModel;
  _color: string;
  _value: any = {};
  _disabled: boolean = false;
  _onChanged: Function;
  _onTouched: Function;
  _data: { [keys: string]: any };

  @Output() exoChange: EventEmitter<{ key: string, value: any }> = new EventEmitter<{ key: string, value: any }>();

  constructor(
    private ims: InformationModelService,
    name: string,
    ngControl: NgControl
  ) {
    // If the user passed a ngControl we need to set the valueAccessor
    if (ngControl) {
      ngControl.valueAccessor = this;
    }
  }

  @Input()
  set color(newColor: string) {
    if (newColor) {
      this._color = newColor;
    }
  }

  get color(): string {
    return this._color;
  }

  @Input()
  set model(model: ComponentModel) {
    if (!isEqual(model, this._model)) {
      this._model = model;
      this.digest(this._model, this._value);
    }
  }

  get model(): ComponentModel {
    return this._model;
  }

  @Input()
  set data(val: { [keys: string]: any }) {
    if (val) {
      this._data = val;
    }
  }

  get data(): { [keys: string]: any } {
    return this._data;
  }

  @Input()
  set value(val: any) {
    this.onChange(val);
  }

  get value(): any {
    return this._value;
  }

  writeValue(val: any) {
    if (val !== this._value) {
      this._value = val;
      this.digest(this._model, this._value);
    }
  }

  onChange(val: any) {
    if (val !== this._value) {
      this._value = val;
      this._onChanged && this._onChanged(val);
      this._onTouched && this._onTouched();
      this.digest(this._model, this._value);
    }
  }

  @Input()
  set disabled(val: boolean) {
    this.setDisabledState(val);
  }

  get disabled(): boolean {
    return this._disabled;
  }

  setDisabledState(isDisabled: boolean) {
    this._disabled = isDisabled;
  }

  registerOnChange(fn: Function) {
    this._onChanged = fn;
  }

  registerOnTouched(fn: Function) {
    this._onTouched = fn;
  }

  private digest(model: ComponentModel, currentValueState: any) {
    if (model.models && model.models.length > 0) {
      model.models.forEach((unitModel: ControlItemModel, index) => {
        if (unitModel.key) {
          let key = unitModel.key;
          let v = unitModel.values;
          let r = this.ims.processRules(unitModel.dependency, currentValueState, key);
          if (r) {
            v = r.values;
          }
          this.processLayout(model, v, key, index, unitModel, currentValueState.range);
          this.processUIState(currentValueState, key, index, unitModel);
          let disableRules = unitModel.disable;
          let disableState = this.ims.processRules(disableRules, currentValueState, key);
          this.processDisableState(disableState, key, index, unitModel);
        }
      });
    }
  }

  protected abstract processLayout(model: ComponentModel, values: Array<ValueItem> | UIOptions, key: string, index: number, unitModel: ControlItemModel, range?: any);

  protected abstract processUIState(currentValueState: any, key: string, index: number, model: ControlItemModel);

  protected abstract processDisableState(disableState, key: string, index: number, model: ControlItemModel);
}
