import {
  Component,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ViewController } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { Group, StateStore } from 'app-engine';

import { ViewStateService } from '../../providers/view-state-service';
import { debounceImmediate } from '../../app/app.extends';
import { GroupCoreInjector } from '../../item-models/group/group-core-injector';
import { GroupCore } from '../../item-models/group/group-core';

@Component({
  selector: 'group-control-panel',
  templateUrl: 'group-control-panel.html'
})
export class GroupControlPanelComponent implements OnInit, OnDestroy {

  private lifeCycleSubs: Array<Subscription>;
  private subs: Array<Subscription>;
  private devices$: Observable<any>;

  viewState: any;

  _group: Group;
  groupCore: GroupCore;

  constructor(
    private groupInjector: GroupCoreInjector,
    private stateStore: StateStore,
    private viewCtrl: ViewController,
    private viewStateService: ViewStateService,
  ) {
    this.lifeCycleSubs = [];
    this.subs = [];

    this.viewState = {
      showControls: false,
      showControlsIcon: 'arrow-dropdown-circle',
    };

    this.devices$ = this.stateStore.devices$;
    this.groupCore = this.groupInjector.create();
  }

  @HostListener('window:model-loaded', ['$event'])
  reload(event) {
    this.groupCore && this.groupCore.selfUpdate();
  }

  @Input()
  set group(val: Group) {
    this._group = val;
    this.groupCore && this.groupCore.selfUpdate();

    this.viewState = this.viewStateService.getViewState(this.getViewStateName()) || this.viewState;
  }

  get group(): Group {
    return this._group;
  }

  @Input()
  set expand(val: boolean) {
    const content = this.viewStateService.getViewState(this.getViewStateName());
    if (!content) {
      this.setExpand(val);
    }
  }

  get expand(): boolean {
    return this.viewState.showControls;
  }

  public ngOnInit(): void {
    this.lifeCycleSubs.push(this.viewCtrl.willEnter.subscribe(() => this.doSubscribe()));
    this.lifeCycleSubs.push(this.viewCtrl.didLeave.subscribe(() => this.doUnsubscribe()));
    this.doSubscribe();
  }

  public ngOnDestroy(): void {
    this.doUnsubscribe();
    this.lifeCycleSubs && this.lifeCycleSubs.forEach((s) => {
      s.unsubscribe();
    });
    this.lifeCycleSubs.length = 0;
  }

  private doSubscribe() {
    this.subs.push(
      this.devices$
        .pipe(debounceImmediate(500))
        .subscribe(latestValues => this.processValues(latestValues))
    );
  }

  private doUnsubscribe() {
    this.subs && this.subs.forEach((s) => {
      s.unsubscribe();
    });
    this.subs.length = 0;
  }

  toggleControls() {
    this.setExpand(!this.expand);
    this.viewStateService.setViewState(this.getViewStateName(), this.viewState);
  }

  private setExpand(val: boolean) {
    this.viewState.showControls = val;
    if (val) {
      this.viewState.showControlsIcon = 'arrow-dropup-circle';
    } else {
      this.viewState.showControlsIcon = 'arrow-dropdown-circle';
    }
  }

  private processValues(devices) {
    if (this._group) {
      this.groupCore = this.groupInjector.bind(this.groupCore, this._group, devices);
    }
  }

  private getViewStateName(): string {
    const gName = this._group && this._group.name;
    return `${gName || ''}-group-control`;
  }
}
