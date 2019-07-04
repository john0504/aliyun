import { MediumListPage } from './medium-list';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../../components/components.module';
import { DirectivesModule } from '../../../directives/directives.module';

@NgModule({
  declarations: [
    MediumListPage
  ],
  imports: [
    IonicPageModule.forChild(MediumListPage),
    TranslateModule,
    ComponentsModule,
    DirectivesModule,
  ]
})
export class MediumListPageModule { }
