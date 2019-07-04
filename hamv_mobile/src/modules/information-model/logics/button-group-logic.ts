import { EventEmitter } from '@angular/core';
import { LogicBase } from './logic-base';
import {
    ControlItemModel,
    InformationModelService,
    OUTLIER,
    UIOptions,
    ValueItem,
} from '../../information-model';

export class ButtonGroupLogic extends LogicBase<ButtonGroupLogicState> {

    public state: ButtonGroupLogicState;
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
            buttons: new Array<ValueItem>(),
            default: undefined,
            currentValueItem: this._defaultValueItem,
            disableState: false,
        };
    }

    public processLayout(values: Array<ValueItem> | UIOptions, key: string, unitModel: ControlItemModel, range?: any): ButtonGroupLogicState {

        this.state.key = key;
        this.state.default = unitModel.default;
        this.state.buttons.length = 0;

        if (values instanceof Array) {
            values.forEach((item) => {
              this.state.buttons.push(item);
            });
        } else {
            let vs: UIOptions = values as UIOptions;
            if (vs.min === undefined || vs.max === undefined) {
                throw new Error('The value of min or max is undefined.');
            }
            if (vs.min === vs.max) {
                throw new Error('The values of min and max are equal.');
            }
            let min = vs.min;
            let max = vs.max;
            let step = values.step !== 0 ? values.step : 1;
            if (vs.func) {
                let func = this.ims.getValueFunction(vs.func);
                for (let i = min; i <= max; i += step) {
                    let item = func(i);
                    this.state.buttons.push(item);
                }
            } else if (vs.rules && this.ims.isValidRules(vs.rules)) {
                for (let i = min; i <= max; i += step) {
                    let item = this.ims.getValueItemByRules(vs.rules, key, i, this._defaultValueItem);
                    this.state.buttons.push(item);
                }
            }
        }
        if (range) {
            var keyNum = Number("0x" + key.substring(1, 3));
            if (keyNum >= 0x50) {
              return this.state;
            }
            keyNum = keyNum | 0x80;
            let key2 = "H" + keyNum.toString(16).toUpperCase();
            range.forEach(element => {
                if (element[key]) {
                    let value: number = element[key];
                    let buttons = [];
                    let index = 0;
                    do {
                        if (value % 2 == 1) {
                            if (this.state.buttons[index]) {
                                buttons.push(this.state.buttons[index]);
                            }
                        }
                        index++;
                        value = value >> 1;
                    } while (value);
                    this.state.buttons = buttons;
                } else if (element[key2]) {
                    let value: number = element[key2];
                    let buttons = [];
                    let index = 0;
                    do {
                        if (value % 2 == 1) {
                            if (this.state.buttons[index]) {
                                buttons.push(this.state.buttons[index]);
                            }
                        }
                        index++;
                        value = value >> 1;
                    } while (value);
                    this.state.buttons = buttons;
                }
            });
        }
        return this.state;
    }

    public processUIState(currentValueState: any, key: string, model: ControlItemModel): ButtonGroupLogicState {
        const val = currentValueState ? currentValueState[key] : undefined;
        this.state.currentValueItem = this.state.buttons.reduce((v, item) => {
            return item.value === val ? item : v;
        }, this._defaultValueItem);

        return this.state;
    }

    public processDisableState(disableState, key: string, model: ControlItemModel): ButtonGroupLogicState {
        this.state.disableState = disableState;
        return this.state;
    }

    public sendValue(val: any): ButtonGroupLogicState {
        this.state.currentValueItem = this.state.buttons.reduce((v, item) => {
            return item.value === val ? item : v;
        }, this._defaultValueItem);
        let out = this.state.currentValueItem.value;
        if (out === OUTLIER) {
            out = val;
        }
        if (out !== undefined) {
            this.exoChange.emit({ key: this.state.key, value: out });
        }
        return this.state;
    }
}

export interface ButtonGroupLogicState {
    key: string;

    buttons: Array<ValueItem>;
    default: number;

    currentValueItem: ValueItem;
    disableState: boolean;
}
