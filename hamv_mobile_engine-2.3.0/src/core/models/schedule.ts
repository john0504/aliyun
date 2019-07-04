export interface Schedule {
    name?: string;
    start: string;
    end: string;
    days: Array<number>;
    active: number;
    active_until: number;
    esh: Object; // map
}
