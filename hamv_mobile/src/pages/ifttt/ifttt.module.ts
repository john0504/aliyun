import { IftttPage } from './ifttt';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../components/components.module';
import { DirectivesModule } from '../../directives/directives.module';

@NgModule({
  declarations: [
    IftttPage
  ],
  imports: [
    IonicPageModule.forChild(IftttPage),
    TranslateModule,
    ComponentsModule,
    DirectivesModule,
  ],
  entryComponents: [
    IftttPage
  ]
})
export class AmazonEchoPageModule { }