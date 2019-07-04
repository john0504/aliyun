import { PopitListPage } from './popit-list';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../../components/components.module';
import { DirectivesModule } from '../../../directives/directives.module';

@NgModule({
  declarations: [
    PopitListPage
  ],
  imports: [
    IonicPageModule.forChild(PopitListPage),
    TranslateModule,
    ComponentsModule,
    DirectivesModule,
  ]
})
export class PopitListPageModule { }
