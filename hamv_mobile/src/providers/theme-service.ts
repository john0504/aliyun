import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  File,
  FileEntry,
} from '@ionic-native/file';

import {
  AppEngine,
  Logger,
} from 'app-engine';
import { normalizeURL } from 'ionic-angular';

import { appConfig } from '../app/app.config';

const configFilename = 'config.json';
const logoFilename = 'logo.png';
const navbarLogoFilename = 'logo_navbar.png';
// const templateFilename = 'theme-custom-template.css';
const themeFilename = 'theme-custom.css';

@Injectable()
export class ThemeService {
  private _config: any = Object.assign({
    timestamp: 0,
  }, appConfig.app.theme);
  private logoFile = {
    nativeURL: 'assets/img/logo.png',
  };
  private navbarLogoFile = {
    nativeURL: 'assets/img/logo_navbar.png',
  };
  private renderer;
  private retry: number = 1;
  private themeFile: FileEntry;

  constructor(
    private appEngine: AppEngine,
    private file: File,
    private http: HttpClient,
  ) {
  }

  get baseUrl() {
    return 'https://' + this.appEngine.getBaseUrl();
  }

  get config() {
    return this._config;
  }

  set config(value) {
    if (!value) value = {};
    if (value.timestamp < this._config.timestamp) return;
    this._config = {
      primaryColor: value.primary_color || appConfig.app.theme.primaryColor,
      productName: value.product_name || appConfig.app.theme.productName,
      wifiName: value.wifi_name || appConfig.app.theme.wifiName,
      timestamp: value.timestamp,
    };
  }

  get configEndpoint() {
    return this.baseUrl + '/api:1/theme';
  }

  get logoEndpoint() {
    return this.baseUrl + '/theme/' + logoFilename;
  }

  get logoUrl() {
    return normalizeURL(this.logoFile.nativeURL);
  }

  get navbarLogoEndpoint() {
    return this.baseUrl + '/theme/' + navbarLogoFilename;
  }

  get navbarLogoUrl() {
    return normalizeURL(this.navbarLogoFile.nativeURL);
  }

  get primaryColor() {
    return this.config.primaryColor;
  }

  get productName() {
    return this.config.productName;
  }

  get themeUrl() {
    return normalizeURL(this.themeFile.nativeURL);
  }

  get wifiName() {
    return this.config.wifiName;
  }

  public setup(renderer) {
    this.renderer = renderer;

    let promise = this.useLocal();

    // promise
    //   .then(() => this.checkCloud())
    //   .then(isNew => {
    //     if (isNew) {
    //       this.makeTheme();
    //       this.getImageFromCloud({
    //         endpoint: this.logoEndpoint,
    //         filename: logoFilename,
    //       })
    //         .then(fileEntry => this.updateLogoFile(fileEntry));
    //       this.getImageFromCloud({
    //         endpoint: this.navbarLogoEndpoint,
    //         filename: navbarLogoFilename,
    //       })
    //         .then(fileEntry => this.updateNavbarLogoFile(fileEntry));
    //     }
    //   });

    return promise;
  }

  private appendThemeInHeader() {
    const id = 'theme-custom';
    let dom = document.getElementById(id);
    if (dom) dom.remove();

    let link = this.renderer.createElement('link');
    this.renderer.setAttribute(link, 'id', id);
    this.renderer.setAttribute(link, 'rel', 'stylesheet');
    this.renderer.setAttribute(link, 'href', this.themeUrl);
    this.renderer.appendChild(document.querySelector('head'), link);
  }

  // private checkCloud() {
  //   return this.getConfigFromCloud()
  //     .then(config => {
  //       if (config.timestamp === this.config.timestamp) return false;
  //       this.config = config;
  //       return true;
  //     });
  // }

  // private copyFile(path, filename) {
  //   return this.file.checkFile(this.file.cacheDirectory, filename)
  //     .then(bool => {
  //       if (bool) {
  //         return this.file.removeFile(this.file.cacheDirectory, filename);
  //       }
  //     })
  //     .then(() => this.file.copyFile(
  //       path,
  //       filename,
  //       this.file.cacheDirectory,
  //       filename
  //     ));
  // }

  private getConfigFromCloud(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(this.configEndpoint, { responseType: 'text' })
        .toPromise()
        .then(jsonString => {
          this.setConfigToLocal(jsonString);
          resolve(JSON.parse(jsonString));
        })
        .catch(e => {
          let timeout = Math.pow(2, this.retry < 6 ? this.retry++ : 6) * 1000;
          setTimeout(() => this.getConfigFromCloud().then(resolve), timeout);
        });
    });
  }

  private getConfigFromLocal(): Promise<string> {
    return this.file.readAsText(this.file.cacheDirectory, configFilename)
      .then(jsonString => {
        this.config = JSON.parse(jsonString);
        return jsonString;
      });
  }

  // private getImageFromCloud(params): Promise<any> {
  //   return this.http.get(params.endpoint, { responseType: 'blob' })
  //     .toPromise()
  //     .then(blob => this.writeFile(params.filename, blob))
  //     .catch(e => this.copyFile(
  //       this.file.applicationDirectory + 'www/assets/img/',
  //       params.filename,
  //     ));
  // }

  private getFileFromLocal(filename): Promise<any> {
    return this.file.resolveDirectoryUrl(this.file.cacheDirectory)
      .then(directoryEntry => this.file.getFile(directoryEntry, filename, {}));
  }

  // private hexToRgb(hex: string): string {
  //   return hex
  //     .slice(1)
  //     .match(/.{1,2}/g)
  //     .map(hex => parseInt(hex, 16))
  //     .join();
  // }

  // private makeTheme(): Promise<any> {
  //   return this.file.readAsText(this.file.applicationDirectory + 'www/assets/css/', templateFilename)
  //     .then(template => {
  //       const primaryColor = this.hexToRgb(this.primaryColor);
  //       const style = template.replace(/\$primaryColor/g, primaryColor);
  //       return this.writeFile(themeFilename, style);
  //     })
  //     .then(fileEntry => this.updateThemeFile(fileEntry));
  // }

  private setConfigToLocal(jsonString): Promise<FileEntry> {
    return this.writeFile(configFilename, jsonString);
  }

  private updateLogoFile(fileEntry: FileEntry) {
    this.logoFile = fileEntry;
    this.logoFile.nativeURL += '?' + Date.now();
  }

  private updateNavbarLogoFile(fileEntry: FileEntry) {
    this.navbarLogoFile = fileEntry;
    this.navbarLogoFile.nativeURL += '?' + Date.now();
  }

  private updateThemeFile(fileEntry: FileEntry) {
    this.themeFile = fileEntry;
    this.themeFile.nativeURL += '?' + Date.now();
    this.appendThemeInHeader();
  }

  private useLocal() {
    return Promise.all([
      this.getConfigFromLocal()
        .then(() => this.getFileFromLocal(themeFilename))
        .then(fileEntry => this.updateThemeFile(fileEntry)),
      this.getFileFromLocal(logoFilename)
        .then(fileEntry => this.updateLogoFile(fileEntry)),
      this.getFileFromLocal(navbarLogoFilename)
        .then(fileEntry => this.updateNavbarLogoFile(fileEntry)),
    ])
      .catch(e => Logger.error);
  }

  private writeFile(filename, text) {
    return this.file.writeFile(
      this.file.cacheDirectory,
      filename,
      text,
      {
        replace: true,
      }
    );
  }
}
