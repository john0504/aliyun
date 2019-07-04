import { browser, element, by } from 'protractor';

describe('MyApp', () => {

  beforeEach(() => {
    browser.get('/');
  });

  it('should have a title', () => {
    expect(browser.getTitle()).toEqual('Exosite Home Automation Micro-Vertical');
  });
});