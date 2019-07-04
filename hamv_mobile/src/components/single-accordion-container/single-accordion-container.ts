import 'intersection-observer';
import { AlertController, NavController, } from 'ionic-angular';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { Component, ElementRef, HostListener, Input, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { StateStore } from 'app-engine';
import { Subscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';

import { debounceImmediate } from '../../app/app.extends';
import { DeviceCore } from '../../item-models/device/device-core';
import { DeviceCoreInjector } from '../../item-models/device/device-core-injector';
import { ViewStateService } from '../../providers/view-state-service';

const options = {
  root: null,
  rootMargin: "100px 0px 100px 0px",
  thresholds: [0],
};

const observer: IntersectionObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach((entry: IntersectionObserverEntry) => {
    entry.target['intersectionCallback'] && entry.target['intersectionCallback'](entry.intersectionRatio);
  });
}, options);

@Component({
  selector: 'single-accordion-container',
  templateUrl: 'single-accordion-container.html'
})
export class SingleAccordionContainerComponent implements OnInit, OnDestroy {

  private subs: Array<Subscription>;
  private account$: Observable<any>;
  private devices$: Observable<any>;

  _deviceSn: any;
  deviceCore: DeviceCore;
  account: Account;
  isOwner: boolean = false;
  viewState: any;

  constructor(
    private alertCtrl: AlertController,
    private dcInjector: DeviceCoreInjector,
    private elementRef: ElementRef,
    private stateStore: StateStore,
    private translate: TranslateService,
    public navCtrl: NavController,
    public viewStateService: ViewStateService,
  ) {
    this.subs = [];
    this.viewState = {
      showDetails: false,
    };
    this.account$ = this.stateStore.account$;
    this.devices$ = this.stateStore.devices$;
    this.deviceCore = this.dcInjector.create();
  }

  @HostListener('window:model-loaded', ['$event'])
  reload(event) {
    this.deviceCore && this.deviceCore.selfUpdate();
  }

  public ngOnInit(): void {
    observer.observe(this.elementRef.nativeElement);
    this.elementRef.nativeElement.intersectionCallback = go => {
      if (go <= 0) {
        this.stop();
      } else {
        this.start();
      }
    };
  }

  start() {
    this.subs.push(
      combineLatest(this.devices$, this.account$)
        .pipe(debounceImmediate(500))
        .subscribe(values => this.updateUi(values))
    );
  }

  private updateUi([devices, account]) {
    this.account = account;
    if (this._deviceSn && devices[this._deviceSn]) {
      this.deviceCore = this.dcInjector.bind(this.deviceCore, devices[this._deviceSn]);
      this.deviceCore.selfUpdate();
      this.isOwner = this.deviceCore.isOwner(account && account.account);
    }
  }

  public ngOnDestroy(): void {
    this.elementRef.nativeElement.intersectionCallback = undefined;
    observer.unobserve(this.elementRef.nativeElement);
    this.stop();
  }

  stop() {
    this.subs && this.subs.forEach((s) => {
      s.unsubscribe();
    });
    this.subs.length = 0;
  }

  @Input()
  get deviceSn(): any {
    return this._deviceSn;
  }

  set deviceSn(val: any) {
    this._deviceSn = val;
    this.viewState = Object.assign(this.viewState, this.viewStateService.getViewState(this._deviceSn));
  }

  showInfo() {
    const alertTitle = this.translate.instant('POPIT_CONTAINER.SHOW_INFO');
    const alertOK = this.translate.instant('POPIT_CONTAINER.OK');
    const alert = this.alertCtrl.create({
      title: alertTitle,
      buttons: [{ text: alertOK }],
    });
    alert.present();
  }

  toggleDetails() {
    this.viewState.showDetails = !this.viewState.showDetails;
    this.viewStateService.setViewState(this._deviceSn, this.viewState);
  }

  openSettings() {
    this.navCtrl.push('DeviceSettingsPage', { deviceSn: this._deviceSn });
  }

  openSharing() {
    this.navCtrl.push('DeviceSharingPage', { deviceSn: this._deviceSn });
  }

  openSchedule() {
    this.navCtrl.push('ScheduleListPage', { deviceSn: this._deviceSn });
  }
}
