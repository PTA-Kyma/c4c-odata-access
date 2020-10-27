import { EntityType } from './edmx.model';
export interface Config {
    ODataService: string;
    Namespace: string;
    EntitySets?: {
        [name: string]: EntitySetConfig;
    };
}
export interface EntitySetConfig {
    operations?: {
        [name: string]: TypescriptOperationConfig;
    };
}
export interface TypescriptOperationConfig {
    entityName: string;
    type: 'query' | 'create' | 'update' | 'fetch';
    properties: string[];
    expand?: string[];
}
export declare function defaultOperations(entityType: EntityType): {
    [name: string]: TypescriptOperationConfig;
};
export declare function setupDefaultsWhereMissing(entitySetName: string, entityType: EntityType, operations: {
    [name: string]: TypescriptOperationConfig;
}): void;
