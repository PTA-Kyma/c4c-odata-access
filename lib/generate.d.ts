import winston from 'winston';
import { ParsedEdmxFile } from './parseEdmxFile';
export declare const logger: winston.Logger;
export interface ServiceGenerationContext {
    edmx: ParsedEdmxFile;
    targetFolderPath: string;
    baseUrl: string;
    codeLists: CodeLists;
}
export interface CodeLists {
    [entityModelName: string]: {
        [propertyName: string]: string;
    };
}
//# sourceMappingURL=generate.d.ts.map