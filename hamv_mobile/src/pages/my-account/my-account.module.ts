import { MyAccountPage } from './my-account';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DragulaModule } from 'ng2-dragula';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../components/components.module';
import { DirectivesModule } from '../../directives/directives.module';

@NgModule({
  declarations: [
    MyAccountPage,
  ],
  imports: [
    IonicPageModule.forChild(MyAccountPage),
    DragulaModule,
    TranslateModule,
    ComponentsModule,
    DirectivesModule,
  ]
})
export class MyAccountPageModule {}
