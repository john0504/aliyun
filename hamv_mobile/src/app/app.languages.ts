export interface language {
  text: string;
  value: string;
}

export const appLanguages: Array<language> = [
  { // We will use the first object value here as the default language
    text: 'English',
    value: 'en-US',
  },
  {
    text: '繁體中文',
    value: 'zh-TW',
  },
];
