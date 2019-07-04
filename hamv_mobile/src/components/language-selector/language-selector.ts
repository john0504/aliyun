import { Component } from '@angular/core';
import {
  ActionSheetController,
  AlertController,
  Config,
  ViewController,
} from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';

import { appLanguages } from '../../app/app.languages';

const USER_LANGUAGE = 'userLang';

@Component({
  selector: 'language-selector',
  templateUrl: 'language-selector.html'
})
export class LanguageSelectorComponent {

  currentLang;
  supportLangs: Array<any> = [];

  constructor(
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController,
    private config: Config,
    private storage: Storage,
    private translate: TranslateService,
    private viewCtrl: ViewController,
  ) {
    this.supportLangs = appLanguages;
    this.storage.get(USER_LANGUAGE)
      .then((value) => {
        if (value) {
          this.currentLang = value;
        } else {
          const defaultLang = this.supportLangs[0].value;
          const deviceLang = navigator.language.toLowerCase();
          const findLang = this.supportLangs.find(({ value }) => value.toLowerCase() === deviceLang);
          this.currentLang = findLang ? findLang.value : defaultLang;
        }
      });
  }

  private changeLanguage(value) {
    this.currentLang = value;
    this.translate.use(value).subscribe(() => this.storage.set(USER_LANGUAGE, value));
    this.translate.get('LANGUAGE.BACK').subscribe(backLabel => {
      this.config.set('ios', 'backButtonText', backLabel);
      const parentView = this.viewCtrl.enableBack();
      if (parentView) {
        this.viewCtrl.setBackButtonText(this.config.get('backButtonText'));
      }
    });
  }

  languageSelect() {
    if (this.supportLangs.length <= 6) {
      let actionSheet = this.actionSheetCtrl.create({
        title: this.translate.instant('LANGUAGE.CHOOSE_LANGUAGE'),
      });

      this.supportLangs.forEach((lang) => {
        const button = {
          text: lang.text,
          handler: () => this.changeLanguage(lang.value),
        };
        actionSheet.addButton(button);
      });

      actionSheet.addButton({
        text: this.translate.instant('LANGUAGE.CANCEL'),
        role: 'cancel',
      });

      actionSheet.present();
    } else {
      const inputArr = [];
      this.supportLangs.forEach((lang) => {
        inputArr.push({
          checked: lang.value === this.currentLang,
          label: lang.text,
          type: 'radio',
          value: lang.value,
        });
      });

      let alert = this.alertCtrl.create({
        title: this.translate.instant('LANGUAGE.CHOOSE_LANGUAGE'),
        inputs: inputArr,
        buttons: [
          {
            text: this.translate.instant('LANGUAGE.CANCEL'),
            role: 'cancel',
          },
          {
            text: this.translate.instant('LANGUAGE.OK'),
            handler: value => this.changeLanguage(value),
          },
        ],
      });

      alert.present();
    }
  }
}
