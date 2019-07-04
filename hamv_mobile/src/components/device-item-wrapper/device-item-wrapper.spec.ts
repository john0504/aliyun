import { TestBed, ComponentFixture } from '@angular/core/testing';
import { IonicModule } from 'ionic-angular';
import { DynamicModule } from 'ng-dynamic-component';
import { MockComponent } from 'ng-mocks';

import { DeviceItemWrapperComponent } from './device-item-wrapper';

describe('Component: device item wrapper', () => {
  let component: DeviceItemWrapperComponent;
  let fixture: ComponentFixture<DeviceItemWrapperComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        DeviceItemWrapperComponent,
      ],
      imports: [
        IonicModule.forRoot(DeviceItemWrapperComponent),
        DynamicModule.withComponents([]),
      ],
    });

    fixture = TestBed.createComponent(DeviceItemWrapperComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeDefined();
    expect(component instanceof DeviceItemWrapperComponent).toBeTruthy();
  });

  it('set data', () => {
    component.data = undefined;
    expect(component._deviceComponent).toBeFalsy();
    expect(component._data).toBeFalsy();

    component.data = {
      deviceSn: 'fakeSn'
    };
    expect(component._deviceComponent).toBeUndefined();
    expect(component._data).toEqual({ deviceSn: 'fakeSn' });

    component.deviceComponent = { fakeComponent: true };
    component.data = { deviceSn: undefined };
    expect(component._deviceComponent).toEqual({ fakeComponent: true });
    expect(component._data).toEqual({ deviceSn: undefined });

    component.deviceComponent = { fakeComponent: true };
    component.data = {
      deviceSn: 'fakeSn'
    };
    expect(component._deviceComponent).toEqual({ fakeComponent: true });
    expect(component._data).toEqual({ deviceSn: 'fakeSn' });
  });
});
