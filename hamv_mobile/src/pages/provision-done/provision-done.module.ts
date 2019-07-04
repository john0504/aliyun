import { ProvisionDonePage } from './provision-done';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../components/components.module';
import { DirectivesModule } from '../../directives/directives.module';

@NgModule({
  declarations: [
    ProvisionDonePage
  ],
  imports: [
    IonicPageModule.forChild(ProvisionDonePage),
    TranslateModule,
    ComponentsModule,
    DirectivesModule,
  ],
  entryComponents: [
    ProvisionDonePage
  ]
})
export class ProvisionDonePageModule { }