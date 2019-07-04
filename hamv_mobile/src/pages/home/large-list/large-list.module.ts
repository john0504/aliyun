import { LargeListPage } from './large-list';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../../components/components.module';
import { DirectivesModule } from '../../../directives/directives.module';

@NgModule({
  declarations: [
    LargeListPage
  ],
  imports: [
    IonicPageModule.forChild(LargeListPage),
    TranslateModule,
    ComponentsModule,
    DirectivesModule,
  ]
})
export class LargeListPageModule { }
