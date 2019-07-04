import { ProvisionLoadingPage } from './provision-loading';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../components/components.module';
import { DirectivesModule } from '../../directives/directives.module';

@NgModule({
  declarations: [
    ProvisionLoadingPage
  ],
  imports: [
    IonicPageModule.forChild(ProvisionLoadingPage),
    TranslateModule,
    ComponentsModule,
    DirectivesModule,
  ],
  entryComponents: [
    ProvisionLoadingPage
  ]
})
export class ProvisionLoadingPageModule { }