import { DebugLogger, ODataService } from './main';

export class CodelistService {
  private cache: { [name: string]: Promise<CodelistEntry[]> } = {};
  constructor(private odataService: ODataService, private useCache: boolean = true) {}

  public getCodeList(codeListFullUrl: string, logger?: DebugLogger): Promise<CodelistEntry[]> {
    let entriesPromise: Promise<CodelistEntry[]> = null;
    if (this.useCache) {
      entriesPromise = this.cache[codeListFullUrl];
      if (entriesPromise) {
        return entriesPromise;
      }
    }

    entriesPromise = this.odataService
      .query<CodelistEntry[]>(`${codeListFullUrl}?$select=Code,Description`, logger)
      // filter out metadata
      .then((list) =>
        (list || []).map((ce) => ({ Code: ce.Code, Description: ce.Description } as CodelistEntry))
      );

    if (this.useCache) {
      this.cache[codeListFullUrl] = entriesPromise;
    }

    return entriesPromise;
  }
}

export interface CodelistEntry {
  Code: string;
  Description: string;
}
