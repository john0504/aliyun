import { Injectable } from '@angular/core';

import { Device } from 'app-engine';

@Injectable()
export class ModelDispatchHelper {

    constructor(
    ) {
    }

    public getUIModelViaCustomLogic(device: Device): string {
        // If there is any custom logic needs to be extended, please re-write this function.
        return null;
    }
}
