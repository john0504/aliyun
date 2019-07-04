import { GroupDetailPage } from "./group-detail";

import { NgModule } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { IonicPageModule } from "ionic-angular";

import { ComponentsModule } from "../../components/components.module";
import { DirectivesModule } from "../../directives/directives.module";
import { InformationModelModule } from "../../modules/information-model";

@NgModule({
  declarations: [GroupDetailPage],
  imports: [
    IonicPageModule.forChild(GroupDetailPage),
    TranslateModule,
    ComponentsModule,
    DirectivesModule,
    InformationModelModule
  ],
  entryComponents: [GroupDetailPage]
})
export class GroupDetailPageModule {}
