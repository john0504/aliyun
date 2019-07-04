import { SmallListPage } from './small-list';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../../components/components.module';
import { DirectivesModule } from '../../../directives/directives.module';

@NgModule({
  declarations: [
    SmallListPage
  ],
  imports: [
    IonicPageModule.forChild(SmallListPage),
    TranslateModule,
    ComponentsModule,
    DirectivesModule,
  ]
})
export class SmallListPageModule { }
