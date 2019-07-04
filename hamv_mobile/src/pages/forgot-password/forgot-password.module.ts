import { ForgotPasswordPage } from './forgot-password';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../components/components.module';
import { DirectivesModule } from '../../directives/directives.module';

@NgModule({
  declarations: [
    ForgotPasswordPage
  ],
  imports: [
    IonicPageModule.forChild(ForgotPasswordPage),
    TranslateModule,
    ComponentsModule,
    DirectivesModule,
  ],
  entryComponents: [
    ForgotPasswordPage
  ]
})
export class ForgotPasswordPageModule { }