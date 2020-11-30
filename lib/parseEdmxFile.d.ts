import { EdmxAssociation, EdmxEntitySet, EdmxEntityType, EdmxFile } from './edmx.model';
export interface ParsedEdmxFile {
    entityTypes: {
        [name: string]: EdmxEntityType;
    };
    entitySets: {
        [name: string]: EdmxEntitySet;
    };
    associations: {
        [name: string]: EdmxAssociation;
    };
}
export declare function parseEdmxFile(edmxFile: EdmxFile): ParsedEdmxFile;
//# sourceMappingURL=parseEdmxFile.d.ts.map