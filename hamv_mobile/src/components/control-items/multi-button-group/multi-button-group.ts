import {
    Component,
    ElementRef,
    forwardRef,
    ViewEncapsulation
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { AppTasks } from 'app-engine';

import {
    ButtonGroupLogic,
    ButtonGroupLogicState,
    ComponentModel,
    ControlItemModel,
    InformationModelService,
    UIOptions,
    UIComponentBase,
    ValueItem
} from '../../../modules/information-model';

@Component({
    selector: 'multi-button-group',
    templateUrl: 'multi-button-group.html',
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => MultiButtonGroup), multi: true }],
    encapsulation: ViewEncapsulation.None,
})
export class MultiButtonGroup extends UIComponentBase {
    title: string;
    logic: ButtonGroupLogic;
    state: ButtonGroupLogicState;
    obj: any;
    currentValue: number;

    constructor(
        ims: InformationModelService,
        elementRef: ElementRef,
        appTasks: AppTasks,
    ) {
        super(ims, 'multi-button-group',  null);
        this.logic = new ButtonGroupLogic(ims, this.exoChange);
        this.state = this.logic.state;
    }

    protected processLayout(model: ComponentModel, values: Array<ValueItem> | UIOptions, key: string, index: number, unitModel: ControlItemModel, range?: any) {
        if (!values || !model || !unitModel || index !== 0) return;

        this.title = model.title;
        this.state = this.logic.processLayout(values, key, unitModel, range);
    }

    protected processUIState(currentValueState: any, key: string, index: number, model: ControlItemModel) {
        if (!key || index !== 0) return;
        this.state = this.logic.processUIState(currentValueState, key, model);
        this.currentValue = currentValueState[key];
    }

    protected processDisableState(disableState, key: string, index: number, model: ControlItemModel) {
        if (index !== 0) return;
        this.state = this.logic.processDisableState(disableState, key, model);
    }

    onButtonClicked(val: number) {
        if (this.model) {
            if (this.currentValue % (val * 2) >= val) {
                this.state = this.logic.sendValue(this.currentValue - val);
            } else {
                this.state = this.logic.sendValue(this.currentValue + val);
            }
        }
    }

    isClicked(val: number): boolean {
        if (this.currentValue % (val * 2) >= val) {
            return true;
        } else {
            return false;
        }
    }
}
