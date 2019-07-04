import { GoogleHomePage } from './google-home';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../components/components.module';
import { DirectivesModule } from '../../directives/directives.module';

@NgModule({
  declarations: [
    GoogleHomePage
  ],
  imports: [
    IonicPageModule.forChild(GoogleHomePage),
    TranslateModule,
    ComponentsModule,
    DirectivesModule,
  ],
  entryComponents: [
    GoogleHomePage
  ]
})
export class GoogleHomePageModule { }
