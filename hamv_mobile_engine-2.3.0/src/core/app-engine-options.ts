export interface AppEngineOptions {
    // murano
    solutionId?: string;
    baseUrl?: string;

    // google related
    webClientId?: string;
    googleScopes?: string;

    // Dnssd
    brand?: string;
    model?: string;

    useHttp?: boolean;
}
