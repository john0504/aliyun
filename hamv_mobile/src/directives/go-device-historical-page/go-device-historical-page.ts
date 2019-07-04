import { StateStore } from 'app-engine';
import { Directive, Input, Renderer2, TemplateRef, ViewContainerRef } from '@angular/core';
import { NavController } from 'ionic-angular';
import { isEmpty } from 'lodash';
import { Observable } from 'rxjs/Observable';

import { debounceImmediate } from '../../app/app.extends';
import { InformationModelService } from '../../modules/information-model';

@Directive({
  selector: '[go-device-historical]',
})
export class GoDeviceHistoricalPageDirective {
  private devices;
  private devices$: Observable<any>;
  private deviceSn: string;

  alreadyExists: Boolean = false;

  constructor(
    private ims: InformationModelService,
    private navCtrl: NavController,
    private stateStore: StateStore,
    private renderer: Renderer2,
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {
    this.devices$ = this.stateStore.devices$;
    this.devices$
      .pipe(debounceImmediate(500))
      .subscribe((devices) => {
        this.devices = devices;
        this.checkElementShows();
      });
  }

  @Input('go-device-historical') set sn(deviceSn: string) {
    this.deviceSn = deviceSn;
    this.checkElementShows();
  }

  private checkElementShows() {
    if (this.show() && !this.alreadyExists) {
      this.alreadyExists = true;
      this.viewContainer.createEmbeddedView(this.templateRef);

      const el = this.templateRef.elementRef.nativeElement.nextElementSibling;
      this.renderer.listen(el, 'click', () => this.pushPage());
    } else if (!this.show()) {
      this.alreadyExists = false;
      this.viewContainer.clear();
    }
  }

  private validateDevice(devices) {
    return !!(!isEmpty(this.deviceSn) && this.deviceSn && devices && devices[this.deviceSn]);
  }

  show() {
    const isValidDevice = this.validateDevice(this.devices);
    if (!isValidDevice) return false;

    const device = this.devices[this.deviceSn];
    const im = this.ims.getUIModel(device);

    return !!(im && im.chartComponents && Object.keys(im.chartComponents).length > 0);
  }

  pushPage() {
    this.navCtrl.push('DeviceHistoryPage', { deviceSn: this.deviceSn });
  }
}
