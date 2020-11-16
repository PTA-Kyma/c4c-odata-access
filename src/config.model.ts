import { EntityType } from './edmx.model';

export interface Config {
  ODataService: string;
  Namespace: string;
  EntitySets?: { [name: string]: EntitySetConfig };
}

export interface EntitySetConfig {
  operations?: { [name: string]: TypescriptOperationConfig };
}

export interface TypescriptOperationConfig {
  onlySelectedProperties: boolean;
  entityName: string;
  type: 'query' | 'create' | 'update' | 'fetch';
  properties?: string[];
  expand?: string[];
}

export function defaultOperations(
  entityType: EntityType
): { [name: string]: TypescriptOperationConfig } {
  return {
    query: {
      entityName: entityType.$.Name + 'QueryModel',
      type: 'query',
      properties: entityType.Property.map((p) => p.$.Name),
      onlySelectedProperties:false
    },
    fetch: {
      entityName: entityType.$.Name,
      type: 'fetch',
      properties: entityType.Property.map((p) => p.$.Name),
      onlySelectedProperties:false
    },
  };
}

export function setupDefaultsWhereMissing(
  entitySetName: string,
  entityType: EntityType,
  operations: { [name: string]: TypescriptOperationConfig }
): void {
  Object.entries(operations).forEach(([name, o]) => {
    switch (o.type) {
      case null:
      case undefined:
        throw new Error('Missing operation type for entity ' + entitySetName);
    }

    if (!o.entityName) {
      o.entityName = `${entityType.$.Name}_${name}_Model`;
    }

    if (o.properties) {
      console.log('onlySelectedProperties')
      o.onlySelectedProperties = true;
    } else{
      switch (o.type) {
        case 'query':
        case 'fetch':
          o.properties = entityType.Property.map((p) => p.$.Name);
          break;
        default:
          throw new Error('Not implemented yet');
      }
    }
  });
}
