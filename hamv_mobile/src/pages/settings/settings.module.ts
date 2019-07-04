import { SettingsPage } from './settings';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../components/components.module';
import { DirectivesModule } from '../../directives/directives.module';

@NgModule({
  declarations: [
    SettingsPage
  ],
  imports: [
    IonicPageModule.forChild(SettingsPage),
    TranslateModule,
    ComponentsModule,
    DirectivesModule,
  ],
  entryComponents: [
    SettingsPage
  ]
})
export class SettingsPageModule { }
