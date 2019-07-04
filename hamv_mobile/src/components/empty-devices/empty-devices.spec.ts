import { HttpClientModule, HttpClient } from '@angular/common/http';
import { IonicModule } from 'ionic-angular';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';

import { createTranslateLoader } from '../../mocks/providers.mocks';
import { ThemeService } from '../../providers/theme-service';
import { EmptyDevicesComponent } from './empty-devices';

describe('Component: empty device item', () => {
  let component: EmptyDevicesComponent;
  let fixture: ComponentFixture<EmptyDevicesComponent>;

  beforeEach(() => {
    const themeService = jasmine.createSpyObj('ThemeService', ['logoUrl']);
    themeService.logoUrl = '';
    TestBed.configureTestingModule({
      declarations: [
        EmptyDevicesComponent,
      ],
      imports: [
        IonicModule.forRoot(EmptyDevicesComponent),
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
        { provide: ThemeService, useFactory: () => themeService },
      ]
    });

    fixture = TestBed.createComponent(EmptyDevicesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeDefined();
    expect(component instanceof EmptyDevicesComponent).toBeTruthy();
  });
});
