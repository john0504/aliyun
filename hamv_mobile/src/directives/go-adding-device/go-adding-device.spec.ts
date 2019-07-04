import { GoAddingDeviceService } from './../../providers/go-adding-device-service';
import { GoAddingDeviceDirective } from './go-adding-device';
import {
  Component,
  DebugElement,
} from '@angular/core';
import { By } from '@angular/platform-browser';
import {
  TestBed,
  getTestBed,
  ComponentFixture,
} from '@angular/core/testing';
import { NavControllerMock, PlatformMock } from 'ionic-mocks';
import { Platform, NavController } from 'ionic-angular';

@Component({
  template: '<button go-adding-device></button>'
})
class TestClickableComponent {

}

describe('Directive: Go adding device directive', () => {

  let fixture: ComponentFixture<TestClickableComponent>;
  let buttonEl: DebugElement;

  let navCtrl;
  let goService: GoAddingDeviceService;

  beforeEach(() => {
    navCtrl = NavControllerMock.instance();
    TestBed.configureTestingModule({
      declarations: [
        GoAddingDeviceDirective,
        TestClickableComponent,
      ],
      providers: [
        { provide: Platform, useFactory: () => PlatformMock.instance() },
        { provide: NavController, useFactory: () => navCtrl },
        GoAddingDeviceService,
      ],
    });

    const injector = getTestBed();
    goService = injector.get(GoAddingDeviceService);

    fixture = TestBed.createComponent(TestClickableComponent);
    buttonEl = fixture.debugElement.query(By.directive(GoAddingDeviceDirective));
  });

  it('click go adding device button', () => {
    const spy = spyOn(goService, 'goAddingDevicePage').and.callFake(() => { });

    buttonEl.triggerEventHandler('click', null);
    fixture.detectChanges();

    expect(spy).toHaveBeenCalledWith(navCtrl);
  });

});