import { Context } from '../context';
import { EntityType } from '../edmx.model';
import { TypescriptOperationConfig } from '../config.model';
export declare function generateEntityRepresentation(outputLines: string[], operation: TypescriptOperationConfig, operationName: string, entityType: EntityType, context: Context): void;
export declare function getPropertyType(xmlType: string): string;
//# sourceMappingURL=entityRepresentation.d.ts.map