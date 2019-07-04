import { EventEmitter } from '@angular/core';
import {
    ControlItemModel,
    UIOptions,
    ValueItem,
} from '../information-model';

export interface ILogic<T> {

    exoChange: EventEmitter<{ key: string, value: any }>;

    processLayout(values: Array<ValueItem> | UIOptions, key: string, unitModel: ControlItemModel): T;

    processUIState(currentValueState: any, key: string, model: ControlItemModel): T;

    processDisableState(disableState, key: string, model: ControlItemModel): T;

    sendValue(val: any): T;
}