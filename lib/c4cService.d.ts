import { DebugLogger, ODataService } from './odataService';
export interface UsernamePasswordCredentials {
    kind: 'password';
    url: string;
    username: string;
    password: string;
}
export interface PseudoBearerTokenCredentials {
    kind: 'pseudobearer';
    url: string;
    token: string;
}
export declare class C4CService implements ODataService {
    private readonly axios;
    private csrfToken;
    baseUrl: string;
    constructor(credentials: UsernamePasswordCredentials | PseudoBearerTokenCredentials);
    ensureCsrfToken(text: string, logger?: DebugLogger): Promise<any>;
    patch<T>(text: string, obj: T, logger?: DebugLogger): Promise<any>;
    post<T>(text: string, obj: T, logger?: DebugLogger): Promise<any>;
    query<T>(text: string, logger?: DebugLogger): Promise<T>;
    delete(text: string, logger?: DebugLogger): Promise<any>;
}
//# sourceMappingURL=c4cService.d.ts.map