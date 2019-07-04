import { BroadcastPage } from './broadcast';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../components/components.module';
import { DirectivesModule } from '../../directives/directives.module';

@NgModule({
  declarations: [
    BroadcastPage
  ],
  imports: [
    IonicPageModule.forChild(BroadcastPage),
    TranslateModule,
    ComponentsModule,
    DirectivesModule,
  ],
  entryComponents: [
    BroadcastPage
  ]
})
export class BroadcastPageModule { }