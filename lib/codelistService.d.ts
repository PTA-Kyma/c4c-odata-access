import { DebugLogger, ODataService } from './main';
export declare class CodelistService {
    private odataService;
    private cache;
    constructor(odataService: ODataService, cache?: CodelistCache);
    getCodeList(codeListFullUrl: string, logger?: DebugLogger): Promise<CodelistEntry[]>;
}
export interface CodelistEntry {
    Code: string;
    Description: string;
}
export interface CodelistCache {
    [name: string]: Promise<CodelistEntry[]>;
}
//# sourceMappingURL=codelistService.d.ts.map