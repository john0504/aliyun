import { BluetoothListPage } from './bluetooth-list';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../components/components.module';
import { DirectivesModule } from '../../directives/directives.module';

@NgModule({
  declarations: [
    BluetoothListPage
  ],
  imports: [
    IonicPageModule.forChild(BluetoothListPage),
    TranslateModule,
    ComponentsModule,
    DirectivesModule,
  ],
  entryComponents: [
    BluetoothListPage
  ]
})
export class BluetoothListPageModule { }