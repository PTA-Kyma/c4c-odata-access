import { EdmxEntityType } from './edmx.model';
export interface Config {
    generateTmpEdmxFile: boolean;
    services: {
        [ODataService: string]: ODataServiceConfig;
    };
}
export interface ODataServiceConfig {
    baseUrl: string;
    entitySets: {
        [name: string]: EntitySetConfig;
    };
}
export interface EntitySetConfig {
    operations?: {
        [name: string]: TypescriptOperationConfig;
    };
}
export interface TypescriptOperationConfig {
    onlySelectedProperties: boolean;
    entityName: string;
    type: 'query' | 'create' | 'update' | 'fetch';
    properties?: string[];
    expand?: string[];
}
export declare function defaultOperations(entityType: EdmxEntityType): {
    [name: string]: TypescriptOperationConfig;
};
export declare function setupDefaultsWhereMissing(entitySetName: string, entityType: EdmxEntityType, operations: {
    [name: string]: TypescriptOperationConfig;
}): void;
//# sourceMappingURL=config.model.d.ts.map