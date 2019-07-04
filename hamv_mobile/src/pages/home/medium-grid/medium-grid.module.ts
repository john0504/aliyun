import { MediumGridPage } from './medium-grid';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../../components/components.module';
import { DirectivesModule } from '../../../directives/directives.module';

@NgModule({
  declarations: [
    MediumGridPage
  ],
  imports: [
    IonicPageModule.forChild(MediumGridPage),
    TranslateModule,
    ComponentsModule,
    DirectivesModule,
  ]
})
export class MediumGridPageModule { }
