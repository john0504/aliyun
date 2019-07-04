import { SmallGridPage } from './small-grid';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../../components/components.module';
import { DirectivesModule } from '../../../directives/directives.module';

@NgModule({
  declarations: [
    SmallGridPage
  ],
  imports: [
    IonicPageModule.forChild(SmallGridPage),
    TranslateModule,
    ComponentsModule,
    DirectivesModule,
  ]
})
export class SmallGridPageModule { }
