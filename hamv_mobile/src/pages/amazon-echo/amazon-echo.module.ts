import { AmazonEchoPage } from './amazon-echo';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../components/components.module';
import { DirectivesModule } from '../../directives/directives.module';

@NgModule({
  declarations: [
    AmazonEchoPage
  ],
  imports: [
    IonicPageModule.forChild(AmazonEchoPage),
    TranslateModule,
    ComponentsModule,
    DirectivesModule,
  ],
  entryComponents: [
    AmazonEchoPage
  ]
})
export class AmazonEchoPageModule { }