import { NgModule, ModuleWithProviders } from '@angular/core';

import { ComponentProvider } from './component-provider';
import { InformationModelService } from './information-model-service';
import { ModelDispatchHelper } from './custom/model-dispatch-helper';
import { ModelManagerService } from './model-manager-service';

import { ScheduleActionComponent } from './components/schedule-action-component/schedule-action-component';
import { UIComponentWrapper } from './components/ui-component-wrapper/ui-component-wrapper';

import { ValueReplacerPipe } from './pipes/value-replacer/value-replacer';

@NgModule({
  declarations: [
    ScheduleActionComponent,
    UIComponentWrapper,
    ValueReplacerPipe,
  ],
  exports: [
    ScheduleActionComponent,
    UIComponentWrapper,
    ValueReplacerPipe,
  ]
})
export class InformationModelModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: InformationModelModule,
      providers: [
        ComponentProvider,
        InformationModelService,
        ModelDispatchHelper,
        ModelManagerService,
      ]
    };
  }
}
