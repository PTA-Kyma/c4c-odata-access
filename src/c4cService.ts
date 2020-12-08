import Axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import axiosCookieJarSupport from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
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

function createAuthorizationHeader(
  credentials: UsernamePasswordCredentials | PseudoBearerTokenCredentials
): string {
  switch (credentials.kind) {
    case 'pseudobearer':
      return 'Basic ' + credentials.token;
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
  csrfToken: string;

  constructor(credentials: UsernamePasswordCredentials | PseudoBearerTokenCredentials) {
    const jar = new CookieJar();
    this.axios = Axios.create({
      baseURL: credentials.url,
      headers: {
        Authorization: createAuthorizationHeader(credentials),
        Connection: 'keep-alive',
      },
      withCredentials: true,
      jar,
    });

    axiosCookieJarSupport(this.axios);
  }

  async ensureCsrfToken(text: string, logger?: (string) => void): Promise<any> {
    if (!this.csrfToken) {
      if (logger) {
        logger('No X-CSRF-Token! Performing query...');
      }
      await this.query(text);
    }
  }

  async patch<T>(text: string, obj: T, logger?: (string) => void): Promise<any> {
    await this.ensureCsrfToken(text, logger);

    const url = '/sap/c4c/odata/v1/' + text;
    if (logger) {
      logger('Sending PATCH ' + url);
    }

    const result = await this.axios.patch<ODataQueryResult<T>>(url, obj, {
      headers: { 'X-CSRF-Token': this.csrfToken },
      withCredentials: true,
    });

    if (logger) {
      logger(`PATCH returned status ${result.status} ${result.statusText}`);
    }

    return result.data;
  }

  async post<T>(text: string, obj: T, logger?: (string) => void): Promise<any> {
    await this.ensureCsrfToken(text, logger);

    const url = '/sap/c4c/odata/v1/' + text;
    if (logger) {
      logger('Sending POST ' + url);
    }
    const result = await this.axios.post<ODataQueryResult<T>>(url, obj, {
      headers: { 'X-CSRF-Token': this.csrfToken },
      withCredentials: true,
    });

    if (logger) {
      logger(`POST returned status ${result.status} ${result.statusText}`);
    }

    return result.data;
  }

  async query<T>(text: string, logger?: (string) => void): Promise<T> {
    const url = '/sap/c4c/odata/v1/' + text;
    if (logger) {
      logger('Querying ' + url);
    }

    const options: AxiosRequestConfig = { headers: {}, withCredentials: true };
    if (!this.csrfToken) {
      options.headers['X-CSRF-Token'] = 'fetch';
    }

    const result = await this.axios.get<ODataQueryResult<T>>(url, options);

    if (logger) {
      logger(`Query returned status ${result.status} ${result.statusText}`);
    }

    const newCsrfToken = result.headers['x-csrf-token'];
    if (newCsrfToken) {
      this.csrfToken = newCsrfToken;
      if (logger) {
        logger('New CSRF Token: ' + this.csrfToken);
      }
    }
    return result.data?.d?.results;
  }
}

interface ODataQueryResult<T> {
  d: { results: T };
}
