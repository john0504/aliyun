import { ProvisionFailurePage } from './provision-failure';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../components/components.module';
import { DirectivesModule } from '../../directives/directives.module';

@NgModule({
  declarations: [
    ProvisionFailurePage
  ],
  imports: [
    IonicPageModule.forChild(ProvisionFailurePage),
    TranslateModule,
    ComponentsModule,
    DirectivesModule,
  ],
  entryComponents: [
    ProvisionFailurePage
  ]
})
export class ProvisionFailurePageModule { }