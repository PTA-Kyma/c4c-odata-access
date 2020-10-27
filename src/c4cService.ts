import Axios, { AxiosInstance } from 'axios';
import { ODataService } from './odataService';

export interface Credentials {
  url: string;
  username: string;
  password: string;
}

export class C4CService implements ODataService {
  axios: AxiosInstance;

  constructor(credentials: Credentials) {
    this.axios = Axios.create({
      baseURL: credentials.url,
      headers: {
        Authorization:
          'Basic ' +
          Buffer.from(credentials.username + ':' + credentials.password).toString('base64'),
      },
    });
  }

  async query<T>(text: string): Promise<T> {
    const result = await this.axios.get<ODataQueryResult<T>>('/sap/c4c/odata/v1/' + text);
    return result.data?.d?.results;
  }
}

interface ODataQueryResult<T> {
  d: { results: T };
}
