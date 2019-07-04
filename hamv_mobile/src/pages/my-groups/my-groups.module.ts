import { MyGroupsPage } from './my-groups';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DragulaModule } from 'ng2-dragula';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../components/components.module';
import { DirectivesModule } from '../../directives/directives.module';

@NgModule({
  declarations: [
    MyGroupsPage
  ],
  imports: [
    IonicPageModule.forChild(MyGroupsPage),
    DragulaModule,
    TranslateModule,
    ComponentsModule,
    DirectivesModule,
  ],
  entryComponents: [
    MyGroupsPage
  ]
})
export class MyGroupsPageModule { }