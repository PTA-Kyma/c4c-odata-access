import Axios, { AxiosInstance } from 'axios';
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

function createAuthorizationHeader(
  credentials: UsernamePasswordCredentials | BearerTokenCredentials
): string {
  switch (credentials.kind) {
    case 'bearer':
      return 'Bearer ' + credentials.token;
    case 'password':
      return (
        'Basic ' + Buffer.from(credentials.username + ':' + credentials.password).toString('base64')
      );
    default:
      throw new Error('Unrecognized credentials');
  }
}

export class C4CService implements ODataService {
  axios: AxiosInstance;

  debugLogger: (string) => void;

  constructor(credentials: UsernamePasswordCredentials | BearerTokenCredentials) {
    this.axios = Axios.create({
      baseURL: credentials.url,
      headers: {
        Authorization: createAuthorizationHeader(credentials),
        'X-CSRF-Token': 'fetch',
      },
    });
  }

  async ensureCsrfToken(text: string): Promise<any> {
    if (this.axios.defaults.headers['X-CSRF-Token'] === 'fetch') {
      this.debugLogger('No X-CSRF-Token!');
      await this.query(text);
      this.debugLogger('CSRF-Token received: ' + this.axios.defaults.headers['X-CSRF-Token']);
    }
  }

  async patch<T>(text: string, obj: T): Promise<any> {
    await this.ensureCsrfToken(text);

    const url = '/sap/c4c/odata/v1/' + text;
    if (this.debugLogger) this.debugLogger('Sending PATCH ' + url);
    const result = await this.axios.patch<ODataQueryResult<T>>(url, obj);
    return result.data;
  }

  async post<T>(text: string, obj: T): Promise<any> {
    await this.ensureCsrfToken(text);

    const url = '/sap/c4c/odata/v1/' + text;
    if (this.debugLogger) this.debugLogger('Sending POST ' + url);
    const result = await this.axios.post<ODataQueryResult<T>>(url, obj);
    return result.data;
  }

  async query<T>(text: string): Promise<T> {
    const url = '/sap/c4c/odata/v1/' + text;
    if (this.debugLogger) this.debugLogger('Querying ' + url);
    const result = await this.axios.get<ODataQueryResult<T>>(url);
    this.axios.defaults.headers['X-CSRF-Token'] = result.headers['X-CSRF-Token'];
    return result.data?.d?.results;
  }
}

interface ODataQueryResult<T> {
  d: { results: T };
}
