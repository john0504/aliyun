import { EventEmitter, Output } from '@angular/core';
import { ILogic } from './i-logic';
import {
    ControlItemModel,
    InformationModelService,
    UIOptions,
    ValueItem,
} from '../../information-model';

export abstract class LogicBase<T> implements ILogic<T> {

    public ims: InformationModelService;
    @Output() public exoChange: EventEmitter<{ key: string, value: any }>;

    constructor(
        _ims: InformationModelService,
        _exoChange: EventEmitter<{ key: string, value: any }>,
    ) {
        this.exoChange = _exoChange;
        this.ims = _ims;
    }

    public abstract processLayout(values: Array<ValueItem> | UIOptions, key: string, unitModel: ControlItemModel): T;

    public abstract processUIState(currentValueState: any, key: string, model: ControlItemModel): T;

    public abstract processDisableState(disableState, key: string, model: ControlItemModel): T;

    public abstract sendValue(val: any): T;
}