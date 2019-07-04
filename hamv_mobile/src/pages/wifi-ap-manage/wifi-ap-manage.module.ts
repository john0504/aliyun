import { WifiApManagePage } from './wifi-ap-manage';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '../../../node_modules/@ngx-translate/core';
import { ComponentsModule } from '../../components/components.module';
import { DirectivesModule } from '../../directives/directives.module';

@NgModule({
  declarations: [
    WifiApManagePage,
  ],
  imports: [
    IonicPageModule.forChild(WifiApManagePage),
    TranslateModule,
    ComponentsModule,
    DirectivesModule,
  ],
})
export class WifiApManagePageModule { }
