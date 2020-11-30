import { AxiosInstance } from 'axios';
import { ODataService } from './odataService';
export interface UsernamePasswordCredentials {
    kind: 'password';
    url: string;
    username: string;
    password: string;
}
export interface BearerTokenCredentials {
    kind: 'bearer';
    url: string;
    token: string;
}
export declare class C4CService implements ODataService {
    axios: AxiosInstance;
    debugLogger: (string: any) => void;
    constructor(credentials: UsernamePasswordCredentials | BearerTokenCredentials);
    ensureCsrfToken(): Promise<any>;
    patch<T>(text: string, obj: T): Promise<any>;
    post<T>(text: string, obj: T): Promise<any>;
    query<T>(text: string): Promise<T>;
}
//# sourceMappingURL=c4cService.d.ts.map