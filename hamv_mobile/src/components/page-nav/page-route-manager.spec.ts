import { PageRouteManager } from './page-route-manager';
import { PageInterface } from '../../app/app.routes';

describe('Service: Page Route Manager', () => {

  let instance: PageRouteManager;

  const example: { [key: string]: PageInterface } = {
    'HomePage': {
      target: 'PopitListPage',
      paramKeys: []
    },
    'AmazonEchoPage': {
      target: 'AmazonEchoPage',
      paramKeys: []
    },
    'AppStartPage': {
      target: 'AppStartPage',
      paramKeys: []
    },
    'DeviceCreatePage': {
      target: 'DeviceCreatePage',
      paramKeys: []
    },
  };

  beforeEach(() => {
    instance = new PageRouteManager();
  });

  it('set and get config', () => {
    instance.config = example;

    expect(instance.config).toEqual(example);
  });

  it('get page', () => {
    instance.config = example;

    expect(instance.getPage('HomePage')).toEqual('PopitListPage');
    expect(instance.getPage('AmazonEchoPage')).toEqual('AmazonEchoPage');
    expect(instance.getPage('ABCPage')).toEqual('ABCPage');
  });
});