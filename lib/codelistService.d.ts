import { ODataService } from './main';
export declare class CodelistService {
    private odataService;
    private useCache;
    private cache;
    constructor(odataService: ODataService, useCache?: boolean);
    getCodeList(codeListFullUrl: string): Promise<CodelistEntry[]>;
}
export interface CodelistEntry {
    Code: string;
    Description: string;
}
//# sourceMappingURL=codelistService.d.ts.map