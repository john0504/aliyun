import { HomeListPage } from './home-list';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../../components/components.module';
import { DirectivesModule } from '../../../directives/directives.module';

@NgModule({
  declarations: [
    HomeListPage
  ],
  imports: [
    IonicPageModule.forChild(HomeListPage),
    TranslateModule,
    ComponentsModule,
    DirectivesModule,
  ]
})
export class HomeListPageModule { }
