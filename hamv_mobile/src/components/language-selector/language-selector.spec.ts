import { HttpClientModule, HttpClient } from '@angular/common/http';
import { IonicModule, ActionSheetController, AlertController, Platform, ViewController } from 'ionic-angular';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { IonicStorageModule, Storage } from '@ionic/storage';
import { PlatformMock, ViewControllerMock, StorageMock, } from 'ionic-mocks';

import { LanguageSelectorComponent } from './language-selector';
import { createTranslateLoader } from '../../mocks/providers.mocks';
import {
  ActionSheetMock,
  ActionSheetControllerMock,
  AlertControllerMock,
  AlertMock,
} from '../../mocks/ionic-module.mocks';

describe('Component: language selector', () => {
  let component: LanguageSelectorComponent;
  let fixture: ComponentFixture<LanguageSelectorComponent>;

  let alertCtrl;
  let alert;
  let actionSheetCtrl;
  let actionSheet;
  let viewCtrl;

  beforeEach(() => {
    actionSheet = ActionSheetMock.instance();
    actionSheetCtrl = ActionSheetControllerMock.instance(actionSheet);
    alert = AlertMock.instance();
    alertCtrl = AlertControllerMock.instance(alert);
    viewCtrl = ViewControllerMock.instance();

    TestBed.configureTestingModule({
      declarations: [
        LanguageSelectorComponent,
      ],
      imports: [
        IonicModule.forRoot(LanguageSelectorComponent),
        IonicStorageModule.forRoot(),
        HttpClientModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: (createTranslateLoader),
            deps: [HttpClient]
          },
        }),
      ],
      providers: [
        { provide: ActionSheetController, useFactory: () => actionSheetCtrl },
        { provide: AlertController, useFactory: () => alertCtrl },
        { provide: Platform, useFactory: () => PlatformMock.instance() },
        { provide: ViewController, useFactory: () => viewCtrl },
      ]
    });

    fixture = TestBed.createComponent(LanguageSelectorComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeDefined();
    expect(component instanceof LanguageSelectorComponent).toBeTruthy();
  });

  describe('action sheet', () => {

    const languages = [
      {
        text: '繁體中文',
        value: 'zh-TW',
      },
      {
        text: 'English',
        value: 'en-US',
      },
    ];

    it('should use action sheet', () => {
      component.supportLangs = languages;
      fixture.detectChanges();
      component.languageSelect();

      expect(alertCtrl.create).not.toHaveBeenCalled();
      expect(actionSheetCtrl.create).toHaveBeenCalled();
    });

    it('select an option', () => {
      component.supportLangs = languages;
      fixture.detectChanges();
      component.languageSelect();

      actionSheet.triggerButtonHandler(0);
      expect(component.currentLang).toBeDefined();
      expect(component.currentLang).toEqual('zh-TW');
    });

    it('select an option - at top page', () => {
      viewCtrl.enableBack.and.returnValue(false);
      component.supportLangs = languages;
      fixture.detectChanges();
      component.languageSelect();

      actionSheet.triggerButtonHandler(0);
      expect(component.currentLang).toBeDefined();
      expect(component.currentLang).toEqual('zh-TW');

      return Promise.resolve()
        .then(() => expect(viewCtrl.setBackButtonText).not.toHaveBeenCalled());
    });

    it('select cancel option', () => {
      component.supportLangs = languages;
      fixture.detectChanges();
      component.languageSelect();

      actionSheet.triggerButtonHandler(2);
      expect(component.currentLang).toBeUndefined();
    });
  });

  describe('alert', () => {

    const languages = [
      {
        text: '繁體中文',
        value: 'zh-TW',
      },
      {
        text: 'English',
        value: 'en-US',
      },
      {
        text: '简体中文',
        value: 'zh-CN',
      },
      {
        text: '日本語',
        value: 'ja',
      },
      {
        text: 'Bahasa Malayu',
        value: 'ms-MY',
      },
      {
        text: 'Pусский язык',
        value: 'ru-RU',
      },
      {
        text: 'Français',
        value: 'fr-FR',
      },
    ];

    it('should use alert', () => {
      component.supportLangs = languages;

      fixture.detectChanges();
      component.languageSelect();

      expect(alertCtrl.create).toHaveBeenCalled();
      expect(actionSheetCtrl.create).not.toHaveBeenCalled();
    });

    it('simulate selecting an option', () => {
      component.supportLangs = languages;
      fixture.detectChanges();
      component.languageSelect();

      alert.triggerButtonHandler(1, 'zh-TW');
      expect(component.currentLang).toBeDefined();
      expect(component.currentLang).toEqual('zh-TW');
    });

    it('simulate selecting an option - at top page', () => {
      viewCtrl.enableBack.and.returnValue(false);
      component.supportLangs = languages;
      fixture.detectChanges();
      component.languageSelect();

      alert.triggerButtonHandler(1, 'zh-TW');
      expect(component.currentLang).toBeDefined();
      expect(component.currentLang).toEqual('zh-TW');

      return Promise.resolve()
        .then(() => expect(viewCtrl.setBackButtonText).not.toHaveBeenCalled());
    });

    it('click cancel', () => {
      component.supportLangs = languages;
      fixture.detectChanges();
      component.languageSelect();

      actionSheet.triggerButtonHandler(0);
      expect(component.currentLang).toBeUndefined();
    });
  });

});

describe('Component: language selector', () => {
  let component: LanguageSelectorComponent;
  let fixture: ComponentFixture<LanguageSelectorComponent>;

  let storage;

  it('first time initialize', () => {
    storage = StorageMock.instance('userLang', '');
    TestBed.configureTestingModule({
      declarations: [
        LanguageSelectorComponent,
      ],
      imports: [
        IonicModule.forRoot(LanguageSelectorComponent),
        IonicStorageModule.forRoot(),
        HttpClientModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: (createTranslateLoader),
            deps: [HttpClient]
          },
        }),
      ],
      providers: [
        { provide: ActionSheetController, useFactory: () => ActionSheetControllerMock.instance() },
        { provide: AlertController, useFactory: () => AlertControllerMock.instance() },
        { provide: Platform, useFactory: () => PlatformMock.instance() },
        { provide: ViewController, useFactory: () => ViewControllerMock.instance() },
        { provide: Storage, useFactory: () => storage },
      ]
    });

    fixture = TestBed.createComponent(LanguageSelectorComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();

    return Promise.resolve()
      .then(() => {
        expect(storage.get).toHaveBeenCalled();
        expect(component.currentLang).toBeDefined();
      });
  });

  it('second time initialize', () => {
    storage = StorageMock.instance('userLang', 'zh-TW');
    TestBed.configureTestingModule({
      declarations: [
        LanguageSelectorComponent,
      ],
      imports: [
        IonicModule.forRoot(LanguageSelectorComponent),
        IonicStorageModule.forRoot(),
        HttpClientModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: (createTranslateLoader),
            deps: [HttpClient]
          },
        }),
      ],
      providers: [
        { provide: ActionSheetController, useFactory: () => ActionSheetControllerMock.instance() },
        { provide: AlertController, useFactory: () => AlertControllerMock.instance() },
        { provide: Platform, useFactory: () => PlatformMock.instance() },
        { provide: ViewController, useFactory: () => ViewControllerMock.instance() },
        { provide: Storage, useFactory: () => storage },
      ]
    });

    fixture = TestBed.createComponent(LanguageSelectorComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();

    return Promise.resolve()
      .then(() => {
        expect(storage.get).toHaveBeenCalled();
        expect(component.currentLang).toBeDefined();
        expect(component.currentLang).toEqual('zh-TW');
      });
  });
});