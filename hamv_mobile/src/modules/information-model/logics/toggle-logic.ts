import { EventEmitter } from '@angular/core';
import { LogicBase } from './logic-base';
import {
    ControlItemModel,
    InformationModelService,
    OUTLIER,
    UIOptions,
    ValueItem,
} from '../../information-model';

export class ToggleLogic extends LogicBase<ToggleLogicState> {

    public state: ToggleLogicState;

    private _defaultValueItem: ValueItem = {
        value: OUTLIER,
        text: '--'
    };

    constructor(
        _ims: InformationModelService,
        _exoChange: EventEmitter<{ key: string, value: any }>,
    ) {
        super(_ims, _exoChange);

        this.state = {
            key: '',
            falseValueItem: this._defaultValueItem,
            trueValueItem: this._defaultValueItem,
            default: undefined,
            currentState: false,
            currentValueItem: this._defaultValueItem,
            disableState: false,
        };
    }

    public processLayout(values: Array<ValueItem> | UIOptions, key: string, unitModel: ControlItemModel): ToggleLogicState {
        this.state.key = key;
        this.state.default = unitModel.default;

        if (values instanceof Array) {
          let f = values[0];
          let t = values[values.length - 1];
          this.state.falseValueItem = f ? f : this._defaultValueItem;
          this.state.trueValueItem = t ? t : this._defaultValueItem;
        } else {
            const vs: UIOptions = values as UIOptions;
            if (vs.func) {
                const min = Math.min(vs.min, vs.max);
                this.state.falseValueItem = this.ims.getValueItemByFunction(vs.func, min, this._defaultValueItem);

                const max = Math.max(vs.min, vs.max);
                this.state.trueValueItem = this.ims.getValueItemByFunction(vs.func, max, this._defaultValueItem);
            } else if (vs.rules && this.ims.isValidRules(vs.rules)) {
                const min = Math.min(vs.min, vs.max);
                this.state.falseValueItem = this.ims.getValueItemByRules(vs.rules, key, min, this._defaultValueItem);

                const max = Math.max(vs.min, vs.max);
                this.state.trueValueItem = this.ims.getValueItemByRules(vs.rules, key, max, this._defaultValueItem);
            }
        }

        return this.state;
    }

    public processUIState(currentValueState: any, key: string, model: ControlItemModel): ToggleLogicState {
        let v = currentValueState ? currentValueState[key] : undefined;
        if (this.state.trueValueItem.value === OUTLIER) {
            this.state.currentState = v !== this.state.falseValueItem.value;
        } else if (this.state.falseValueItem.value === OUTLIER) {
            this.state.currentState = v === this.state.trueValueItem.value;
        } else {
            this.state.currentState = v === this.state.trueValueItem.value;
        }
        this.state.currentValueItem = this.state.currentState ? this.state.trueValueItem : this.state.falseValueItem;

        return this.state;
    }

    public processDisableState(disableState, key: string, model: ControlItemModel): ToggleLogicState {
        this.state.disableState = disableState;
        return this.state;
    }

    public sendValue(val: any): ToggleLogicState {
        this.state.currentState = val;
        this.state.currentValueItem = val ? this.state.trueValueItem : this.state.falseValueItem;

        let out = val ? this.state.trueValueItem.value : this.state.falseValueItem.value;
        if (out === OUTLIER) {
            out = this.state.default;
        }
        if (out !== undefined) {
            this.exoChange.emit({ key: this.state.key, value: out });
        }
        return this.state;
    }
}

export interface ToggleLogicState {
    key: string;

    falseValueItem: ValueItem;
    trueValueItem: ValueItem;
    default: number;

    currentState: boolean;
    currentValueItem: ValueItem;
    disableState: boolean;
}
