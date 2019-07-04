export const baseGroup = {
  name: 'a group name',
  devices: ['a device id'],
  properties: {
    bla: 'blub'
  }
};

export const baseDevice = {
  device: 'a device id',
  connected: 1,
  deviceState: 'idle',
  profile: {
    esh: {
      class: '123',
      eshVersion: '4.0.0',
      deviceId: '1',
      brand: 'ACCompany1',
      model: 'AC001',
    },
    module: {
      firmwareVersion: '1.0.0',
      macAddress: 'AC123',
      localIp: '192.168.0.13',
      ssid: 'BRX13',
    },
    cert: {
      fingerprint: {
        sha1: 'DE28F4A4FFE5B92FA3C503D1A349A7F9962A8212'
      },
      validity: {
        notBefore: '5/21/02',
        notAfter: '5/21/22'
      }
    }
  },
  calendar: [
    {
      name: 'name test',
      start: '12:24',
      end: '13:24',
      days: [1, 2, 3, 4, 5, 6, 7],
      active: 1,
      active_until: 1477377969,
      esh: {
        H00: 1
      }
    },
  ],
  status: {
    H00: 0,
  },
  fields: [
    'H00', 'H01', 'H02', 'H03',
    'H04', 'H05', 'H0E', 'H0F',
    'H10', 'H11', 'H14', 'H17',
    'H20', 'H21', 'H28', 'H29'
  ],
  owner: 'testing@exosite.com',
  role: 'owner',
  users: [
    { email: 'testing@exosite.com', role: 'owner' },
  ],
  properties: {
    somePorperty: 'abc',
  }
};

export const baseAccount = {
  account: 'testing@exosite.com',
  token: 'a token',
  isOAuth: false,
  authProvider: 'auth-provider-none',
  isLoggedIn: true,
  pTokenBundle: {
    token: 'abc',
  },
};

export const baseFirmwareList = [
  {
    name: 'MC4wLjF8MC4wLjJ8NWRmZTMwYzlhNDA5ZDU5YjQ4OTMwMTQ1NjllNDk0MTg5NWUyMDFlMA',
    previousVersion: '1.1.0',
    sha1: '5dfe30c9a409d59b4893014569e4941895e201e0',
    model: 'MHV-100',
    size: 302364,
    url: 'https://smarthome.apps.exosite.io/fw/content/MC4wLjF8MC4wLjJ8NWRmZTMwYzlhNDA5ZDU5YjQ4OTMwMTQ1NjllNDk0MTg5NWUyMDFlMA',
    version: '1.2.0'
  },
  {
    name: 'MC4wLjF8MC4wLjJ8NWRmZTMwYzlhNDA5ZDU5YjQ4OTMwMTQ1NjllNDk0MTg5NWUyMDFlMA',
    previousVersion: '0.9.0',
    sha1: '5dfe30c9a409d59b4893014569e4941895e201e0',
    model: 'MHV-100',
    size: 302364,
    url: 'https://smarthome.apps.exosite.io/fw/content/MC4wLjF8MC4wLjJ8NWRmZTMwYzlhNDA5ZDU5YjQ4OTMwMTQ1NjllNDk0MTg5NWUyMDFlMA',
    version: '1.0.0'
  },
  {
    name: 'MC4wLjF8MC4wLjJ8NWRmZTMwYzlhNDA5ZDU5YjQ4OTMwMTQ1NjllNDk0MTg5NWUyMDFlMA',
    previousVersion: '1.0.0',
    sha1: '5dfe30c9a409d59b4893014569e4941895e201e0',
    model: 'MHV-100',
    size: 302364,
    url: 'https://smarthome.apps.exosite.io/fw/content/MC4wLjF8MC4wLjJ8NWRmZTMwYzlhNDA5ZDU5YjQ4OTMwMTQ1NjllNDk0MTg5NWUyMDFlMA',
    version: '1.1.0'
  },
];

export const cloudConfigObject = {
  app_name: "myProduct",
  app_url_scheme: "myProduct://",
  apple_store: "https://itunes.apple.com/us/app/exosite-excite/id1090866808",
  company_address: "275 Market St, Suite 535, Minneapolis, MN 55405",
  company_contact: "1-612-353-2161",
  company_name: "My Company",
  company_url: "https://mycompany.com",
  debug: false,
  google_play: "https://play.google.com/store/apps/details?id=com.exosite.excite",
  migration: 0.1,
  o_auth_expires_in: 0,
  primary_color: "#00BAFF",
  product_name: "My Product",
  welcome_email_body: "Thanks for creating a {{product_name}} account. With the {{app_name}} app, you can control your smart AC from anywhere and set schedules to fit your daily routine.",
  welcome_email_headline: "Welcome to {{product_name}}!",
  welcome_email_subject: "Welcome to {{product_name}}!",
  welcome_web_body: "With the {{app_name}} app, you can control your smart AC from anywhere and set schedules to fit your daily routine. If you haven’t yet, make sure to download the {{app_name}} app on any device you wish to use.",
  welcome_web_headline: "Welcome to {{product_name}}!",
  timestamp: 1523966401,
};

export const baseSchedule = {
  name: 'name test',
  start: '12:24',
  end: '13:24',
  days: [1, 2, 3, 4, 5, 6, 7],
  active: 1,
  active_until: 1477377969,
  esh: {
    H00: 1
  }
};

export const testControllers = [
  {
    "type": "range",
    "title": "INFORMATION_MODEL.TEMPERATURE",
    "models": [
      {
        "key": "H03",
        "values": {
          "min": 16,
          "max": 32,
          "step": 1,
          "func": "tempCelsius"
        },
        "disable": [
          {
            "conditions": [
              {
                "key": "H00",
                "op": "eq",
                "target": 0
              }
            ]
          },
          {
            "conditions": [
              {
                "key": "H01",
                "op": "gte",
                "target": 2
              },
              {
                "key": "H01",
                "op": "lte",
                "target": 3
              }
            ]
          },
          {
            "conditions": [
              {
                "key": "H29",
                "op": "gt",
                "target": 0
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "type": "button-group",
    "title": "INFORMATION_MODEL.AC_MODE",
    "models": [
      {
        "key": "H01",
        "values": [
          {
            "value": 3,
            "text": "INFORMATION_MODEL.AUTO"
          },
          {
            "value": 0,
            "text": "INFORMATION_MODEL.COOL"
          },
          {
            "value": 4,
            "text": "INFORMATION_MODEL.HEAT"
          },
          {
            "value": 2,
            "text": "INFORMATION_MODEL.FAN"
          },
          {
            "value": 1,
            "text": "INFORMATION_MODEL.DEHUMIDIFIER"
          }
        ],
        "disable": [
          {
            "conditions": [
              {
                "key": "H00",
                "op": "eq",
                "target": 0
              }
            ]
          },
          {
            "conditions": [
              {
                "key": "H29",
                "op": "gt",
                "target": 0
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "type": "button-group",
    "title": "INFORMATION_MODEL.FAN_SPEED",
    "models": [
      {
        "key": "H02",
        "values": [
          {
            "value": 0,
            "text": "INFORMATION_MODEL.AUTO"
          },
          {
            "value": 1,
            "text": "INFORMATION_MODEL.SILENT"
          },
          {
            "value": 2,
            "text": "INFORMATION_MODEL.WEAK"
          },
          {
            "value": 3,
            "text": "INFORMATION_MODEL.LOW"
          },
          {
            "value": 4,
            "text": "INFORMATION_MODEL.HIGH"
          }
        ],
        "dependency": [
          {
            "conditions": [
              {
                "key": "H01",
                "op": "eq",
                "target": 1
              }
            ],
            "result": {
              "values": [
                {
                  "value": 1,
                  "text": "INFORMATION_MODEL.SILENT"
                },
                {
                  "value": 2,
                  "text": "INFORMATION_MODEL.WEAK"
                }
              ]
            }
          },
          {
            "conditions": [
              {
                "key": "H01",
                "op": "eq",
                "target": 2
              }
            ],
            "result": {
              "values": [
                {
                  "value": 1,
                  "text": "INFORMATION_MODEL.SILENT"
                },
                {
                  "value": 2,
                  "text": "INFORMATION_MODEL.WEAK"
                },
                {
                  "value": 3,
                  "text": "INFORMATION_MODEL.LOW"
                },
                {
                  "value": 4,
                  "text": "INFORMATION_MODEL.HIGH"
                }
              ]
            }
          },
          {
            "conditions": [
              {
                "key": "H01",
                "op": "eq",
                "target": 3
              }
            ],
            "result": {
              "values": [
                {
                  "value": 0,
                  "text": "INFORMATION_MODEL.AUTO"
                },
                {
                  "value": 1,
                  "text": "INFORMATION_MODEL.SILENT"
                },
                {
                  "value": 2,
                  "text": "INFORMATION_MODEL.WEAK"
                }
              ]
            }
          }
        ],
        "disable": [
          {
            "conditions": [
              {
                "key": "H00",
                "op": "eq",
                "target": 0
              }
            ]
          },
          {
            "conditions": [
              {
                "key": "H29",
                "op": "gt",
                "target": 0
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "type": "range-with-toggle",
    "title": "INFORMATION_MODEL.HORIZONTAL_SWING",
    "models": [
      {
        "key": "H11",
        "values": [
          {
            "value": 5,
            "text": "INFORMATION_MODEL.LEFT",
            "icon": "fan-left"
          },
          {
            "value": 4,
            "text": "INFORMATION_MODEL.LEFT_CENTER",
            "icon": "fan-lc"
          },
          {
            "value": 3,
            "text": "INFORMATION_MODEL.CENTER",
            "icon": "fan-center"
          },
          {
            "value": 2,
            "text": "INFORMATION_MODEL.RIGHT_CENTER",
            "icon": "fan-rc"
          },
          {
            "value": 1,
            "text": "INFORMATION_MODEL.RIGHT",
            "icon": "fan-right"
          }
        ],
        "disable": [
          {
            "conditions": [
              {
                "key": "H00",
                "op": "eq",
                "target": 0
              }
            ]
          },
          {
            "conditions": [
              {
                "key": "H29",
                "op": "gt",
                "target": 0
              }
            ]
          }
        ]
      },
      {
        "key": "H11",
        "values": [
          {
            "value": "*"
          },
          {
            "value": 0,
            "text": "INFORMATION_MODEL.AUTO",
            "icon": "fan-auto"
          }
        ],
        "default": 3,
        "disable": [
          {
            "conditions": [
              {
                "key": "H00",
                "op": "eq",
                "target": 0
              }
            ]
          },
          {
            "conditions": [
              {
                "key": "H29",
                "op": "gt",
                "target": 0
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "type": "toggle",
    "title": "INFORMATION_MODEL.VERTICAL_SWING",
    "models": [
      {
        "key": "H0E",
        "values": [
          {
            "value": 0,
            "text": "INFORMATION_MODEL.OFF"
          },
          {
            "value": 1,
            "text": "INFORMATION_MODEL.ON"
          }
        ],
        "disable": [
          {
            "conditions": [
              {
                "key": "H00",
                "op": "eq",
                "target": 0
              }
            ]
          },
          {
            "conditions": [
              {
                "key": "H29",
                "op": "gt",
                "target": 0
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "type": "button-group",
    "title": "INFORMATION_MODEL.MOISTURIZING",
    "models": [
      {
        "key": "H20",
        "values": [
          {
            "value": 0,
            "text": "INFORMATION_MODEL.OFF"
          },
          {
            "value": 1,
            "text": "INFORMATION_MODEL.LOW"
          },
          {
            "value": 2,
            "text": "INFORMATION_MODEL.HIGH"
          }
        ],
        "disable": [
          {
            "conditions": [
              {
                "key": "H00",
                "op": "eq",
                "target": 0
              }
            ]
          },
          {
            "conditions": [
              {
                "key": "H01",
                "op": "neq",
                "target": 0
              }
            ]
          },
          {
            "conditions": [
              {
                "key": "H29",
                "op": "gt",
                "target": 0
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "type": "toggle",
    "title": "INFORMATION_MODEL.ANTI_MOLD",
    "models": [
      {
        "key": "H17",
        "values": [
          {
            "value": 0,
            "text": "INFORMATION_MODEL.OFF"
          },
          {
            "value": 1,
            "text": "INFORMATION_MODEL.ON"
          }
        ],
        "disable": [
          {
            "conditions": [
              {
                "key": "H00",
                "op": "eq",
                "target": 0
              }
            ]
          },
          {
            "conditions": [
              {
                "key": "H01",
                "op": "neq",
                "target": 0
              }
            ]
          },
          {
            "conditions": [
              {
                "key": "H29",
                "op": "gt",
                "target": 0
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "type": "range",
    "title": "INFORMATION_MODEL.BRIGHTNESS",
    "models": [
      {
        "key": "H1F",
        "values": [
          {
            "value": 3,
            "text": "INFORMATION_MODEL.OFF",
            "icon": "light-full"
          },
          {
            "value": 2,
            "text": "33%",
            "icon": "light"
          },
          {
            "value": 1,
            "text": "66%",
            "icon": "light"
          },
          {
            "value": 0,
            "text": "100%",
            "icon": "light"
          }
        ],
        "disable": [
          {
            "conditions": [
              {
                "key": "H00",
                "op": "eq",
                "target": 0
              }
            ]
          },
          {
            "conditions": [
              {
                "key": "H29",
                "op": "gt",
                "target": 0
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "type": "toggle",
    "title": "INFORMATION_MODEL.SOUND",
    "models": [
      {
        "key": "H1E",
        "values": [
          {
            "value": 1,
            "text": "INFORMATION_MODEL.OFF"
          },
          {
            "value": 0,
            "text": "INFORMATION_MODEL.ON"
          }
        ],
        "disable": [
          {
            "conditions": [
              {
                "key": "H00",
                "op": "eq",
                "target": 0
              }
            ]
          },
          {
            "conditions": [
              {
                "key": "H29",
                "op": "gt",
                "target": 0
              }
            ]
          }
        ]
      }
    ]
  }
];