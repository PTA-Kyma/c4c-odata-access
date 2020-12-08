import { AxiosInstance } from 'axios';
import { ODataService } from './odataService';
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
    axios: AxiosInstance;
    csrfToken: string;
    constructor(credentials: UsernamePasswordCredentials | PseudoBearerTokenCredentials);
    ensureCsrfToken(text: string, logger?: (string: any) => void): Promise<any>;
    patch<T>(text: string, obj: T, logger?: (string: any) => void): Promise<any>;
    post<T>(text: string, obj: T, logger?: (string: any) => void): Promise<any>;
    query<T>(text: string, logger?: (string: any) => void): Promise<T>;
}
//# sourceMappingURL=c4cService.d.ts.map