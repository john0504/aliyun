import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as echarts from 'echarts';

@Injectable()
export class EchartsService {

  constructor(
    private http: HttpClient,
  ) { }

  public init() {
    this.http.get('./assets/scripts/echarts-theme.json')
      .subscribe(themeObj => echarts.registerTheme('echartsTheme', themeObj));
  }
}