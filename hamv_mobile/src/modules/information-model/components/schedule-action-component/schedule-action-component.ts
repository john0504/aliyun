import {
    Component,
    EventEmitter,
    forwardRef,
    Input,
    Output,
    ViewEncapsulation,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { ComponentModel } from '../../information-model';

@Component({
    selector: 'schedule-component',
    template: `<ng-content></ng-content>`,
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ScheduleActionComponent), multi: true }],
    encapsulation: ViewEncapsulation.None,
})
export class ScheduleActionComponent {

    _model: ComponentModel;

    @Output() exoChange: EventEmitter<{ key: string, value: any }> = new EventEmitter<{ key: string, value: any }>();

    constructor(
    ) {
    }

    @Input()
    set model(model: ComponentModel) {
        if (model) {
            this._model = model;
        }
    }

    get model(): ComponentModel {
        return this._model;
    }
}