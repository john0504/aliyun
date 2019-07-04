import { Subject } from 'rxjs/Subject';

export class NetworkMock {

  type = 'wifi';
  downlinkMax = 42;

  private disConnSubject;
  private connSubject;
  private onChangeSubject;

  constructor() {
    this.connSubject = new Subject();
    this.disConnSubject = new Subject();
    this.onChangeSubject = new Subject();
  }

  onConnect() { return this.connSubject; }

  onDisconnect() { return this.disConnSubject; }

  onChange() { return this.onChangeSubject; }

  setConnected() {
    this.connSubject.next();
    this.onChangeSubject.next();
  }

  setDisconnected() {
    this.disConnSubject.next();
    this.onChangeSubject.next();
  }

  destory() {
    this.connSubject.unsubscribe();
    this.disConnSubject.unsubscribe();
    this.onChangeSubject.unsubscribe();
  }
}
