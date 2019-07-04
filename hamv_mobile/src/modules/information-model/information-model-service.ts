import { Injectable } from '@angular/core';

import { Device } from 'app-engine';

import { Condition, ContainerModel, Rule } from './information-model';
import { ModelManagerService } from './model-manager-service';
import { functionMap } from './custom/predefined-functions';

export const OUTLIER: string = '*';

@Injectable()
export class InformationModelService {

    private functionMap: any;

    constructor(
        private mms: ModelManagerService,
    ) {
        this.functionMap = {};
        this.loadFunctionMap(functionMap);
    }

    private loadFunctionMap(json: any) {
        if (json) {
            this.functionMap = json;
        }
    }

    public getValueFunction(functionName: string) {
        return this.functionMap[functionName];
    }

    public getValueItemByFunction(functionName: string, value: any, defaultValue: any) {
      const func = this.getValueFunction(functionName);
      return func ? func(value) : defaultValue;
    }

    public getUIModelName(device: Device): string {
        return this.mms.getUIModelName(device);
    }

    public getUIModelFromName(modelName: string): ContainerModel {
        return this.mms.getUIModelFromName(modelName);
    }

    public getUIModel(device: Device): ContainerModel {
        return this.mms.getUIModel(device);
    }

    public getValueItemByRules(rules: Array<Rule>, selfKey: string, currentValue: any, defaultResult: any): any {
        if (!selfKey || currentValue === undefined) return defaultResult;
        let states = {};
        states[selfKey] = currentValue;
        let item = this.processRules(rules, states, selfKey, defaultResult);
        if (item) {
            item.value = currentValue;
        }
        return item ? item : defaultResult;
    }

    public processRules(rules: Array<Rule>, states: any, selfKey?: string, defaultResult?: any): any {
        if (!this.isValidRules(rules) || !states) {
            return this.returnDefault(defaultResult);
        }

        let rulesResult = rules
            .filter(({ conditions }) => conditions && Array.isArray(conditions))
            .reduce((r, { conditions, result }) => {
                if (r) return r;
                let match = this.processConditions(conditions, states, selfKey);

                return match ? (result || true) : false;
            }, false);

        return rulesResult ? rulesResult : this.returnDefault(defaultResult);
    }

    public isValidRules(rules: Array<Rule>) {
        return !!(rules || (Array.isArray(rules) && rules.length > 0));
    }

    public processConditions(conditions: Array<Condition>, states: any, selfKey?: string) {
        if (!this.isValidConditions(conditions) || !states) {
            return false;
        }

        return conditions.reduce((preCondition, condition) => {
            if (!preCondition) return false;

            if (condition.key && condition.key === OUTLIER) {
                condition.key = selfKey;
            }
            const key = condition.key || selfKey;
            if (key && states[key] !== undefined) {
                return this.convertToOperator(states[key], condition);
            }

            return false;
        }, true);
    }

    public isValidConditions(conditions: Array<Condition>) {
        return !!(conditions || (Array.isArray(conditions) && conditions.length > 0));
    }

    private convertToOperator(value, { op, target }) {
        switch (op) {
            case 'eq':
                return value === target;
            case 'neq':
                return value !== target;
            case 'gt':
                return value > target;
            case 'gte':
                return value >= target;
            case 'lt':
                return value < target;
            case 'lte':
                return value <= target;
            default:
                throw new Error('Please check if the op is correct.');
        }
    }

    private returnDefault(defaultResult?: any) {
        return defaultResult !== undefined ? defaultResult : false;
    }
}
