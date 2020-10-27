import { AxiosInstance } from 'axios';
import { ODataService } from './odataService';
export interface Credentials {
    url: string;
    username: string;
    password: string;
}
export declare class C4CService implements ODataService {
    axios: AxiosInstance;
    constructor(credentials: Credentials);
    query<T>(text: string): Promise<T>;
}
