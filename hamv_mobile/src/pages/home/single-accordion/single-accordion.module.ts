import { SingleAccordionPage } from './single-accordion';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../../components/components.module';
import { DirectivesModule } from '../../../directives/directives.module';

@NgModule({
  declarations: [
    SingleAccordionPage
  ],
  imports: [
    IonicPageModule.forChild(SingleAccordionPage),
    TranslateModule,
    ComponentsModule,
    DirectivesModule,
  ]
})
export class SingleAccordionPageModule { }
