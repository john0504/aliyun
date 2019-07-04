import { ViewStateService } from './view-state-service';

describe('View State Service', () => {

  let viewStateService = null;

  beforeEach(() => {
    viewStateService = new ViewStateService();
  });

  it('Save data', () => {

    const obj = { abc: '123', };
    viewStateService.setViewState('KEY', obj);

    expect(viewStateService.getViewState('KEY')).toEqual(obj);
  });

  it('Clear data', () => {

    const obj = { abc: '123', };
    viewStateService.setViewState('KEY', obj);
    expect(viewStateService.getViewState('KEY')).toEqual(obj);

    viewStateService.clearAll();
    expect(viewStateService.getViewState('KEY')).toEqual(undefined);
  });

});
