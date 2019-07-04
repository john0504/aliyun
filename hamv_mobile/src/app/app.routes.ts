export interface PageInterface {
  target: string;
  paramKeys?: Array<string>;
}

export const appPageConfig: { [key: string]: PageInterface } = {
  'HomePage': {
    target: 'HomeListPage',
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
  'DeviceDetailPage': {
    target: 'DeviceDetailPage',
    paramKeys: ['deviceSn']
  },
  'DeviceHistoryPage': {
    target: 'DeviceHistoryPage',
    paramKeys: ['deviceSn']
  },
  'DeviceSettingsPage': {
    target: 'DeviceSettingsPage',
    paramKeys: ['device']
  },
  'DeviceSharingPage': {
    target: 'DeviceSharingPage',
    paramKeys: ['deviceSn']
  },
  'ForgotPasswordPage': {
    target: 'ForgotPasswordPage',
    paramKeys: []
  },
  'GoogleHomePage': {
    target: 'GoogleHomePage',
    paramKeys: []
  },
  'GroupDetailPage': {
    target: 'GroupDetailPage',
    paramKeys: ['groupId']
  },
  'IftttPage': {
    target: 'IftttPage',
    paramKeys: []
  },
  'LoginPage': {
    target: 'LoginPage',
    paramKeys: []
  },
  'MyGroupsPage': {
    target: 'MyGroupsPage',
    paramKeys: []
  },
  'ProvisionDonePage': {
    target: 'ProvisionDonePage',
    paramKeys: ['deviceSn']
  },
  'ProvisionFailurePage': {
    target: 'ProvisionFailurePage',
    paramKeys: ['deviceSn']
  },
  'ProvisionLoadingPage': {
    target: 'ProvisionLoadingPage',
    paramKeys: ['wifiAp', 'method']
  },
  'ScheduleEditPage': {
    target: 'ScheduleEditPage',
    paramKeys: ['device', 'index']
  },
  'ScheduleListPage': {
    target: 'ScheduleListPage',
    paramKeys: ['deviceSn']
  },
  'SettingsPage': {
    target: 'SettingsPage', paramKeys: []
  },
  'SignupPage': {
    target: 'SignupPage',
    paramKeys: []
  },
  'SsidConfirmPage': {
    target: 'SsidConfirmPage',
    paramKeys: []
  }
};
