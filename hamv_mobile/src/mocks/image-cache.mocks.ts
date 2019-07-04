import { Observable } from 'rxjs';
import { of } from 'rxjs/observable/of';

export class ImageCacheServiceMock {
  getImagePath(url: string): Observable<any> { return of('cache-image/a-image-file-path'); }
  isHttpUrl(url: string): boolean { return true; }
}