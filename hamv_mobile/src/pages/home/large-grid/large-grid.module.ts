import { LargeGridPage } from './large-grid';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../../components/components.module';
import { DirectivesModule } from '../../../directives/directives.module';

@NgModule({
  declarations: [
    LargeGridPage
  ],
  imports: [
    IonicPageModule.forChild(LargeGridPage),
    TranslateModule,
    ComponentsModule,
    DirectivesModule,
  ]
})
export class LargeGridPageModule { }
