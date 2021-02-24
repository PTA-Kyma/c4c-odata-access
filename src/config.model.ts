import { EdmxEntityType } from './edmx.model';
import { logger } from './generate';

export interface Config {
  generateTmpEdmxFile: boolean;
  services: {
    [ODataService: string]: ODataServiceConfig;
  };
}

export interface ODataServiceConfig {
  baseUrl: string;
  entitySets: { [name: string]: EntitySetConfig };
}

export interface EntitySetConfig {
  operations?: { [name: string]: TypescriptOperationConfig };
}

export interface TypescriptOperationConfig {
  onlySelectedProperties: boolean;
  entityName: string;
  type: 'query' | 'create' | 'update' | 'fetch' | 'delete';
  properties?: string[];
  expand?: string[];
}

export function defaultOperations(
  entityType: EdmxEntityType
): { [name: string]: TypescriptOperationConfig } {
  return {
    query: {
      entityName: entityType.$.Name + 'QueryModel',
      type: 'query',
      // properties: entityType.Property.map((p) => p.$.Name),
      onlySelectedProperties: false,
    },
    fetch: {
      entityName: entityType.$.Name,
      type: 'fetch',
      // properties: entityType.Property.map((p) => p.$.Name),
      onlySelectedProperties: false,
    },
  };
}

export function setupDefaultsWhereMissing(
  entitySetName: string,
  entityType: EdmxEntityType,
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
      o.onlySelectedProperties = true;
    } else {
      switch (o.type) {
        case 'query':
        case 'fetch':
          o.properties = entityType.Property.map((p) => p.$.Name);
          break;
        case 'update':
          o.properties = entityType.Property.filter((p) => p.$['sap:updatable'] === 'true').map(
            (p) => p.$.Name
          );
          break;
        case 'create':
          o.properties = entityType.Property.filter((p) => p.$['sap:creatable'] === 'true').map(
            (p) => p.$.Name
          );
          break;
        case 'delete':
          // do nothing
          o.properties = [];
          break;
        default:
          throw new Error(
            `setupDefaultsWhereMissing: Setting defaults for ${o.type} operation '${name}' not implemented yet `
          );
      }
    }
  });
}
