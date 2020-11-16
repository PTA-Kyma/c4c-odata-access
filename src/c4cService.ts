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
      },
    });
  }

  async query<T>(text: string): Promise<T> {
    const url = '/sap/c4c/odata/v1/' + text;
    if (this.debugLogger) this.debugLogger('Querying ' + url);
    const result = await this.axios.get<ODataQueryResult<T>>(url);
    return result.data?.d?.results;
  }
}

interface ODataQueryResult<T> {
  d: { results: T };
}
