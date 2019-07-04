import { Component, DoCheck, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

import { ScrollableTabsOptions } from './scrollable-tabs-options';

@Component({
  selector: 'scrollable-tabs',
  templateUrl: 'scrollable-tabs.html'
})
export class ScrollableTabs implements DoCheck {
  @Input('tabs') tabs: Array<ScrollableTabsOptions>;
  @Output() tabSelected: EventEmitter<any> = new EventEmitter();
  @ViewChild('scrollableTabs') scrollableTabs: ElementRef;
  _selectedTabIndex: number = 0;

  @Input()
  set selectedTabIndex(val: number) {
    const newIndex = Number(val);
    if (this._selectedTabIndex !== newIndex) {
      this._selectedTabIndex = newIndex;
      setTimeout(() => this.scrollToSelectedTab());
    }
  }

  get selectedTabIndex(): number {
    return this._selectedTabIndex;
  }

  ngDoCheck() {
    if (!this.tabs) { return; }

    if (!this.tabs[this._selectedTabIndex]) {
      this.selectTab(this.tabs[0]);
    }
  }

  selectTab(currentTab, index: number = 0) {
    this._selectedTabIndex = index;
    setTimeout(() => this.scrollToSelectedTab());
    this.tabSelected.emit({
      index,
      selected: currentTab,
    });
  }

  // Source from: https://github.com/SinoThomas/Ionic2-ScrollableTabs/blob/master/src/components/scrollable-tabs/scrollable-tabs.ts
  scrollToSelectedTab() {
    const tabs = this.scrollableTabs.nativeElement;
    const tabsWidth = tabs.clientWidth;
    const selectedTab = tabs.children[this._selectedTabIndex];
    const selectedTabWidth = selectedTab.clientWidth;
    const selectedTabLeftOffset = tabs.getElementsByTagName("li")[this._selectedTabIndex].offsetLeft;
    const selectedTabMid = selectedTabLeftOffset + (selectedTabWidth / 2);
    const newScrollLeft = selectedTabMid - (tabsWidth / 2);

    this.scrollXTo(newScrollLeft, 300);
  }

  scrollXTo(x: number, duration: number = 300): Promise<any> {
    // scroll animation loop w/ easing
    const tabbar = this.scrollableTabs.nativeElement;

    if (!tabbar) {
      // invalid element
      return Promise.resolve();
    }
    x = x || 0;

    const originalRaf = (window[window['Zone']['__symbol__']('requestAnimationFrame')] || window[window['Zone']['__symbol__']('webkitRequestAnimationFrame')]);
    const nativeRaf = originalRaf !== undefined ? originalRaf['bind'](window) : window.requestAnimationFrame.bind(window);
    const fromX = tabbar.scrollLeft;
    const maxAttempts = (duration / 16) + 100;

    return new Promise((resolve) => {
      let attempts = 0;
      let isPlaying: boolean;
      let startTime: number;

      // scroll loop
      function step() {
        attempts++;

        if (!tabbar || !isPlaying || attempts > maxAttempts) {
          isPlaying = false;
          resolve();
          return;
        }

        let time = Math.min(1, ((Date.now() - startTime) / duration));

        // where .5 would be 50% of time on a linear scale easedT gives a
        // fraction based on the easing method
        let easedT = (--time) * time * time + 1;

        if (fromX !== x) {
          tabbar.scrollLeft = Math.floor((easedT * (x - fromX)) + fromX);
        }

        if (easedT < 1) {
          nativeRaf(step);
        } else {
          // done
          resolve();
        }
      }

      // start scroll loop
      isPlaying = true;

      // chill out for a frame first
      nativeRaf(() => {
        startTime = Date.now();
        nativeRaf(step);
      });
    });
  }
}
