import { promises } from 'fs';
import { CodeLists, logger, ServiceGenerationContext } from '../generate';
import {
  defaultOperations,
  EntitySetConfig,
  setupDefaultsWhereMissing,
  TypescriptOperationConfig,
} from '../config.model';
import { generateEntityRepresentation } from '../generators/entityRepresentation';
import { ParsedEdmxFile } from '../parseEdmxFile';
import { EdmxEntitySet, EdmxEntityType } from '../edmx.model';

export async function generateEntitySet(
  context: ServiceGenerationContext,
  entitySetName: string,
  entitySetConfig: EntitySetConfig
): Promise<void> {
  const entitySet = context.edmx.entitySets[entitySetName];
  if (!entitySet) {
    logger.error('No EntitySet ' + entitySetName);
    return;
  }

  const entityType = context.edmx.entityTypes[entitySet.$.EntityType];
  if (!entityType) {
    logger.error(`No EntityType ${entitySet.$.EntityType} for EntitySet ${entitySetName}`);
    return;
  }

  logger.info('Generating EntitySet: ' + entitySetName);
  try {
    const outputLines = [
      "import { ODataService } from '@pta-kyma/c4c-odata-access';",
      "import { DebugLogger } from '@pta-kyma/c4c-odata-access/lib/odataService';",
      '',
    ];
    if (!entitySetConfig.operations) {
      entitySetConfig.operations = defaultOperations(entityType);
    }

    logger.info(
      '  operations: ' +
        Object.entries(entitySetConfig.operations)
          .map(([name, op]) => `${name} (${op.type})`)
          .join(', ')
    );

    setupDefaultsWhereMissing(entitySetName, entityType, entitySetConfig.operations);

    outputLines.push(`export const ${entitySet.$.Name} = {`);
    Object.entries(entitySetConfig.operations).forEach(([operationName, e]) => {
      const expand = e.expand && e.expand.length > 0 ? '&$expand=' + e.expand.join(',') : '';

      switch (e.type) {
        case 'query':
          outputLines.push(`
   ${operationName}(service: ODataService, filter?: string, logger?: DebugLogger): Promise<${
            e.entityName
          }[]> {
    if (filter === undefined) {
        filter = '$top=20';
    }

    const base = '${context.baseUrl}/${entitySetName}';
    const select = '${
      e.onlySelectedProperties ? '$select=' + e.properties.concat(e.expand || []).join(',') : ''
    }';

    const expand = '${expand}';
    const query = base + '?' + select + expand + '&' + filter;
   
    return service.query<${e.entityName}[]>(query, logger);
  },
`);
          break;

        case 'fetch':
          outputLines.push(`
   ${operationName}(service: ODataService, objectID: string, logger?: DebugLogger): Promise<${
            e.entityName
          }> {
    const base = "${context.baseUrl}/${entitySet.$.Name}('" + objectID + "')";
    const select = '${
      e.onlySelectedProperties ? '$select=' + e.properties.concat(e.expand || []).join(',') : ''
    }';
    const expand = '${expand}';
    const query = base + '?' + select + expand;

    return service.query<${e.entityName}>(query, logger);
  },
`);
          break;

        case 'create':
          generateCreate(outputLines, operationName, context, e, entitySet);

          break;

        case 'update':
          generateUpdate(outputLines, operationName, context, e, entitySet);
          break;
        
        case 'delete':
          generateDelete(outputLines, operationName, context, e, entitySet);
          break;

        default:
          throw new Error('Not supported operation ' + e.type);
      }
    });

    outputLines.push('}\r\n');

    Object.entries(entitySetConfig.operations).forEach(([operationName, operation]) => {
      generateEntityRepresentation(outputLines, operation, operationName, entityType, context.edmx);
    });

    const outputFile = await promises.open(`${context.targetFolderPath}/${entitySetName}.ts`, 'w');
    await outputFile.writeFile(outputLines.join('\r\n'));
    await outputFile.close();
  } catch (err) {
    logger.error(`Failed to process  ${entitySetName}: ${err.message}`);
  } finally {
  }
}

function generateCreate(
  outputLines: string[],
  operationName: string,
  context: ServiceGenerationContext,
  e: TypescriptOperationConfig,
  entitySet: EdmxEntitySet
): void {
  outputLines.push(`
  public ${operationName}(service: ODataService, obj: ${e.entityName}, logger?: DebugLogger): Promise<any> {   
    const url = "${context.baseUrl}/${entitySet.$.Name}";    
    return service.post<${e.entityName}>(url, obj, logger);
  },
`);

  const codeLists: { [propertyName: string]: string } = {};
  context.codeLists[e.entityName] = codeLists;
  const entityType = context.edmx.entityTypes[entitySet.$.EntityType];
  entityType.Property.filter(
    (p) =>
      p.$['sap:creatable'] === 'true' &&
      p.$['c4c:value-help'] &&
      (!e.properties || e.properties.includes(p.$.Name))
  ).forEach((p) => {
    codeLists[p.$.Name] = p.$['c4c:value-help'];
  });
}

function generateUpdate(
  outputLines: string[],
  operationName: string,
  context: ServiceGenerationContext,
  e: TypescriptOperationConfig,
  entitySet: EdmxEntitySet
): void {
  outputLines.push(`
  public ${operationName}(service: ODataService, objectID: string, obj: ${e.entityName}, logger?: DebugLogger): Promise<any> {   
    const url = "${context.baseUrl}/${entitySet.$.Name}('" + objectID + "')";    
    return service.patch<${e.entityName}>(url, obj, logger);
  },
`);

  const codeLists: { [propertyName: string]: string } = {};
  context.codeLists[e.entityName] = codeLists;
  const entityType = context.edmx.entityTypes[entitySet.$.EntityType];
  entityType.Property.filter(
    (p) =>
      p.$['sap:updatable'] === 'true' &&
      p.$['c4c:value-help'] &&
      (!e.properties || e.properties.includes(p.$.Name))
  ).forEach((p) => {
    codeLists[p.$.Name] = p.$['c4c:value-help'];
  });
}

function generateDelete(
  outputLines: string[],
  operationName: string,
  context: ServiceGenerationContext,
  e: TypescriptOperationConfig,
  entitySet: EdmxEntitySet
): void {
  outputLines.push(`
   public ${operationName}(service: ODataService, objectID: string, logger?: DebugLogger): Promise<any> {   
    const url = "${context.baseUrl}/${entitySet.$.Name}('" + objectID + "')";    
    return service.delete(url, logger);
  },
`);

  const codeLists: { [propertyName: string]: string } = {};
  context.codeLists[e.entityName] = codeLists;
  const entityType = context.edmx.entityTypes[entitySet.$.EntityType];
  entityType.Property.filter(
    (p) =>
      p.$['sap:updatable'] === 'true' &&
      p.$['c4c:value-help'] &&
      (!e.properties || e.properties.includes(p.$.Name))
  ).forEach((p) => {
    codeLists[p.$.Name] = p.$['c4c:value-help'];
  });
}
