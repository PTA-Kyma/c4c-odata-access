import { DebugLogger, ODataService } from './main';

export class CodelistService {
  constructor(private odataService: ODataService, private cache: CodelistCache = null) {}

  public getCodeList(codeListFullUrl: string, logger?: DebugLogger): Promise<CodelistEntry[]> {
    let entriesPromise: Promise<CodelistEntry[]> = null;
    if (this.cache) {
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

    if (this.cache) {
      this.cache[codeListFullUrl] = entriesPromise;
    }

    return entriesPromise;
  }
}

export interface CodelistEntry {
  Code: string;
  Description: string;
}

export interface CodelistCache {
  [name: string]: Promise<CodelistEntry[]>;
}
