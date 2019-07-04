import { Updatable } from '../updatable';

export interface GroupCore extends Updatable {
  controllers: Array<any>;
  deviceIds: Array<string>;
  group;
  groupId: string;
  groupName: string;
  status;

  send({ key, value });
  update(allDevices: any);
}
