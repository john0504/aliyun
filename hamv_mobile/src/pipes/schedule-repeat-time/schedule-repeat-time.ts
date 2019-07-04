import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
    name: 'scheduleRepeatTime'
})
export class ScheduleRepeatTime implements PipeTransform {
    constructor(
      private translate: TranslateService,
    ) {
    }

    public transform({ days, active_until }, args?: any[]): string {
        if (!days || days.length === 0 || (active_until > 0 && days.length === 1)) return '';
        if (days.length === 7) { return this.translate.instant('SCHEDULE_REPEAT_TIME.EVERY_DAY'); }
        let s: string = '';
        days.sort();
        if (days.length === 2 && days.every(day => day >= 6)) return this.translate.instant('SCHEDULE_REPEAT_TIME.WEEKENDS');
        if (days.length === 5 && days.every(day => day < 6)) return this.translate.instant('SCHEDULE_REPEAT_TIME.WEEKDAYS');
        days.forEach((current, index, array) => {
            current = +current;
            switch (current) {
                case 1:
                    s += this.translate.instant('SCHEDULE_REPEAT_TIME.MONDAY');
                    break;
                case 2:
                    s += this.translate.instant('SCHEDULE_REPEAT_TIME.TUESDAY');
                    break;
                case 3:
                    s += this.translate.instant('SCHEDULE_REPEAT_TIME.WEDNESDAY');
                    break;
                case 4:
                    s += this.translate.instant('SCHEDULE_REPEAT_TIME.THURSDAY');
                    break;
                case 5:
                    s += this.translate.instant('SCHEDULE_REPEAT_TIME.FRIDAY');
                    break;
                case 6:
                    s += this.translate.instant('SCHEDULE_REPEAT_TIME.SATURDAY');
                    break;
                case 7:
                    s += this.translate.instant('SCHEDULE_REPEAT_TIME.SUNDAY');
                    break;
            }
            if (current > 0 && current < 8 && index < array.length - 1) {
                s += ', ';
            }
        });
        return s;
    }
}
