import { EdmxEntityType } from '../edmx.model';
import { TypescriptOperationConfig } from '../config.model';
import { ParsedEdmxFile } from '../parseEdmxFile';
export declare function generateEntityRepresentation(outputLines: string[], operation: TypescriptOperationConfig, operationName: string, entityType: EdmxEntityType, edmx: ParsedEdmxFile): void;
export declare function getPropertyType(xmlType: string): string;
//# sourceMappingURL=entityRepresentation.d.ts.map