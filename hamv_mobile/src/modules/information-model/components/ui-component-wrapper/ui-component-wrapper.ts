import {
  AfterViewInit,
  Component,
  ComponentFactory,
  ComponentFactoryResolver,
  ComponentRef,
  EventEmitter,
  forwardRef,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  Type,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ModuleLoader } from 'ionic-angular/util/module-loader';
import { Subscription } from 'rxjs/Subscription';

import { UIComponent } from '../../component-base';
import { ComponentModel } from '../../information-model';
import { ComponentProvider } from '../../component-provider';

@Component({
  selector: 'ui-component',
  template: `<ng-template #dynamicContainer></ng-template>`,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UIComponentWrapper), multi: true }],
  encapsulation: ViewEncapsulation.None,
})
export class UIComponentWrapper implements UIComponent, AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('dynamicContainer', { read: ViewContainerRef }) public dynamicContainer: ViewContainerRef;

  private initialized: boolean = false;
  _type: Type<any>;
  private _componentRef: ComponentRef<any> = null;

  exoSub: Subscription;

  _model: ComponentModel;
  _color: string;
  _value: any;
  _disabled: boolean = false;
  _onChanged: Function;
  _onTouched: Function;
  _data: { [keys: string]: any };

  @Output() exoChange: EventEmitter<{ key: string, value: any }> = new EventEmitter<{ key: string, value: any }>();

  constructor(
    private componentProvider: ComponentProvider,
    private moduleLoader: ModuleLoader,
  ) {
  }

  digest(model: ComponentModel) {
    this._type = this.componentProvider.getComponent(model.type);

    this.updateComponent();
  }

  private updateComponent() {
    if (!this.initialized || !this._type) {
      return;
    }
    this.dynamicContainer.clear();
    this._componentRef = null;
    this.exoSub && this.exoSub.unsubscribe();

    try {
      const elInjector = this.dynamicContainer.parentInjector;

      let cfr = this.moduleLoader.getComponentFactoryResolver(this._type);
      if (!cfr) {
        cfr = elInjector.get(ComponentFactoryResolver);
      }
      let factory: ComponentFactory<any> = cfr.resolveComponentFactory(this._type);
      this._componentRef = this.dynamicContainer.createComponent<any>(factory, this.dynamicContainer.length, elInjector);
      this._componentRef.instance.model = this._model;
      this._componentRef.instance.color = this._color;
      if (this._value) this._componentRef.instance.value = this._value;
      this._componentRef.instance.disabled = this._disabled;
      this.exoSub = this._componentRef.instance.exoChange.subscribe((val) => { this.exoChange.emit(val); });
      this._componentRef.instance.registerOnChange(this._onChanged);
      this._componentRef.instance.registerOnTouched(this._onTouched);
      this._componentRef.instance.data = this._data;

      this._componentRef.changeDetectorRef.detectChanges();
    } catch (e) {
      console.error('createComponent -> ', e);
    }
  }

  ngAfterViewInit() {
    this.initialized = true;
    this.updateComponent();
  }

  ngOnChanges() {
    this.updateComponent();
  }

  ngOnDestroy() {
    this.exoSub && this.exoSub.unsubscribe();
    if (this._componentRef) {
      this._componentRef.destroy();
    }
  }

  @Input()
  set color(newColor: string) {
    if (newColor) {
      this._color = newColor;
      if (this._componentRef) {
        this._componentRef.instance.color = newColor;
      }
    }
  }

  get color(): string {
    return this._componentRef ? this._componentRef.instance.color : this._color;
  }

  @Input()
  set model(model: ComponentModel) {
    if (model) {
      this._model = model;
      this.digest(model);
      if (this._componentRef) {
        this._componentRef.instance.model = model;
      }
    }
  }

  get model(): ComponentModel {
    return this._componentRef ? this._componentRef.instance.model : this._model;
  }

  @Input()
  set data(val: { [keys: string]: any }) {
    if (val) {
      this._data = val;
      if (this._componentRef) {
        this._componentRef.instance._data = val;
      }
    }
  }

  get data(): { [keys: string]: any } {
    return this._componentRef ? this._componentRef.instance.data : this._data;
  }

  @Input()
  set value(val: any) {
    if (val) {
      this._value = val;
      if (this._componentRef) {
        this._componentRef.instance.value = val;
      }
    }
  }

  get value(): any {
    return this._componentRef ? this._componentRef.instance.value : this._value;
  }

  writeValue(val: any) {
    if (val) {
      this._value = val;
      if (this._componentRef) {
        this._componentRef.instance.writeValue(val);
      }
    }
  }

  @Input()
  set disabled(val: boolean) {
    this.setDisabledState(val);
  }

  get disabled(): boolean {
    return this._componentRef ? this._componentRef.instance.disabled : this._disabled;
  }

  setDisabledState(isDisabled: boolean) {
    this._disabled = isDisabled;
    if (this._componentRef) {
      this._componentRef.instance.setDisabledState(isDisabled);
    }
  }

  registerOnChange(fn: Function) {
    this._onChanged = fn;
    if (this._componentRef) {
      this._componentRef.instance.registerOnChange(fn);
    }
  }

  registerOnTouched(fn: Function) {
    this._onTouched = fn;
    if (this._componentRef) {
      this._componentRef.instance.registerOnTouched(fn);
    }
  }
}
