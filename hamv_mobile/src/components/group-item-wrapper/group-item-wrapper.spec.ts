import { TestBed, ComponentFixture } from '@angular/core/testing';
import { IonicModule } from 'ionic-angular';
import { DynamicModule } from 'ng-dynamic-component';
import { MockComponent } from 'ng-mocks';

import { GroupItemWrapperComponent } from './group-item-wrapper';

describe('Component: device item wrapper', () => {
  let component: GroupItemWrapperComponent;
  let fixture: ComponentFixture<GroupItemWrapperComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        GroupItemWrapperComponent,
      ],
      imports: [
        IonicModule.forRoot(GroupItemWrapperComponent),
        DynamicModule.withComponents([]),
      ],
    });

    fixture = TestBed.createComponent(GroupItemWrapperComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeDefined();
    expect(component instanceof GroupItemWrapperComponent).toBeTruthy();
  });

  it('set data', () => {
    component.groupComponent = undefined;
    component.data = undefined;
    expect(component._groupComponent).toBeFalsy();
    expect(component._data).toBeFalsy();

    component.groupComponent = undefined;
    component.data = {
      extraData: {},
      deviceComponent: { fakeComponent: true },
      group: { fakeGroup: true }
    };
    expect(component._groupComponent).toBeUndefined();
    expect(component._data).toEqual({
      extraData: {},
      deviceComponent: { fakeComponent: true },
      group: { fakeGroup: true }
    });

    component.groupComponent = { fakeComponent: true };
    component.data = {
      extraData: undefined,
      deviceComponent: undefined,
      group: undefined
    };
    expect(component._groupComponent).toEqual({ fakeComponent: true });
    expect(component._data).toEqual({
      extraData: undefined,
      deviceComponent: undefined,
      group: undefined
    });

    component.groupComponent = { fakeGroupComponent: true };
    component.data = {
      extraData: undefined,
      deviceComponent: { fakeDeviceComponent: true },
      group: { fakeGroup: true }
    };
    expect(component._groupComponent).toEqual({ fakeGroupComponent: true });
    expect(component._data).toEqual({
      extraData: undefined,
      deviceComponent: { fakeDeviceComponent: true },
      group: { fakeGroup: true }
    });
  });
});
