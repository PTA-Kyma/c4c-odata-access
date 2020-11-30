import { promises } from 'fs';
import { logger } from '../generate';
import { defaultOperations, EntitySetConfig, setupDefaultsWhereMissing } from '../config.model';
import { generateEntityRepresentation } from '../generators/entityRepresentation';
import { ParsedEdmxFile } from '../parseEdmxFile';

export async function generateEntitySet(
  edmx: ParsedEdmxFile,
  entitySetName: string,
  entitySetConfig: EntitySetConfig,
  outputDirectory: string,
  serviceUrl: string
): Promise<void> {
  const entitySet = edmx.entitySets[entitySetName];
  if (!entitySet) {
    logger.error('No EntitySet ' + entitySetName);
    return;
  }

  const entityType = edmx.entityTypes[entitySet.$.EntityType];
  if (!entityType) {
    logger.error(`No EntityType ${entitySet.$.EntityType} for EntitySet ${entitySetName}`);
    return;
  }

  logger.info('Generating EntitySet ' + entitySetName);
  try {
    const outputLines = ["import { ODataService } from '@pta-kyma/c4c-odata-access';\r\n"];
    if (!entitySetConfig.operations) {
      entitySetConfig.operations = defaultOperations(entityType);
    }

    setupDefaultsWhereMissing(entitySetName, entityType, entitySetConfig.operations);

    outputLines.push(`export const ${entitySet.$.Name} = {`);
    Object.entries(entitySetConfig.operations).forEach(([operationName, e]) => {
      const expand = e.expand && e.expand.length > 0 ? '&$expand=' + e.expand.join(',') : '';

      switch (e.type) {
        case 'query':
          outputLines.push(
            `${operationName}(service: ODataService, filter?: string): Promise<${e.entityName}[]> {`
          );
          outputLines.push("if (filter === undefined) filter = '$top=20'");

          outputLines.push(`const base = '${serviceUrl}/${entitySetName}';`);
          outputLines.push(
            `const select = '${
              e.onlySelectedProperties
                ? '$select=' + e.properties.concat(e.expand || []).join(',')
                : ''
            }';`
          );
          outputLines.push(`const expand = '${expand}';`);
          outputLines.push(`const query = base + '?' + select + expand + '&' + filter`);

          outputLines.push(`return service.query<${e.entityName}[]>(query);`);
          outputLines.push('},\r\n');
          break;

        case 'fetch':
          outputLines.push(
            `${operationName}(service: ODataService, objectID: string): Promise<${e.entityName}> {`
          );

          outputLines.push(`const base = "${serviceUrl}/${entitySet.$.Name}('" + objectID + "')";`);
          outputLines.push(
            `const select = '${
              e.onlySelectedProperties
                ? '$select=' + e.properties.concat(e.expand || []).join(',')
                : ''
            }';`
          );
          outputLines.push(`const expand = '${expand}';`);

          outputLines.push(`const query = base + '?' + select + expand;`);
          outputLines.push(`return service.query<${e.entityName}>(query);`);
          outputLines.push('},\r\n');
          break;
        default:
          throw new Error('Not supported operation ' + e.type);
      }
    });

    outputLines.push('}\r\n');

    Object.entries(entitySetConfig.operations).forEach(([operationName, operation]) => {
      generateEntityRepresentation(outputLines, operation, operationName, entityType, edmx);
    });

    const outputFile = await promises.open(`${outputDirectory}/${entitySetName}.ts`, 'w');
    await outputFile.writeFile(outputLines.join('\r\n'));
    await outputFile.close();
  } catch (err) {
    logger.error(`Failed to process  ${entitySetName}: ${err.message}`);
  } finally {
  }
}
