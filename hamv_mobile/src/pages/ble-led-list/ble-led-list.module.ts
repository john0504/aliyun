import { BleLedListPage } from './ble-led-list';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../components/components.module';
import { DirectivesModule } from '../../directives/directives.module';

@NgModule({
  declarations: [
    BleLedListPage
  ],
  imports: [
    IonicPageModule.forChild(BleLedListPage),
    TranslateModule,
    ComponentsModule,
    DirectivesModule,
  ],
  entryComponents: [
    BleLedListPage
  ]
})
export class BleLedListPageModule { }