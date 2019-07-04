export const renderer2Mock = jasmine.createSpyObj('renderer2Mock', [
  'destroy',
  'createElement',
  'createComment',
  'createText',
  'destroyNode',
  'appendChild',
  'insertBefore',
  'removeChild',
  'selectRootElement',
  'parentNode',
  'nextSibling',
  'setAttribute',
  'removeAttribute',
  'addClass',
  'removeClass',
  'setStyle',
  'removeStyle',
  'setProperty',
  'setValue',
  'listen'
]);

export const rootRendererMock =  {
  renderComponent: () => {
      return renderer2Mock;
  }
};