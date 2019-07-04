export class Util {

    public static getBackoffDelay(attempt: number, initTimeout: number = 500, maxTimeout: number = 300000): number {
        attempt = attempt < 0 ? 0 : attempt;
        initTimeout = initTimeout < 0 ? 500 : initTimeout;
        maxTimeout = maxTimeout < 0 ? 300000 : maxTimeout;

        let R = Math.random() + 1;
        let T = initTimeout;
        let F = 2;
        let N = attempt;
        let M = maxTimeout;

        return Math.floor(Math.min(R * T * Math.pow(F, N), M));
    }
}
