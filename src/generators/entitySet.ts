import { Context } from '../context';
import { generateEntityRepresentation } from '../generators/entityRepresentation';
import { promises } from 'fs';
import { defaultOperations, setupDefaultsWhereMissing } from '../config.model';

export async function generateEntitySetConfig(
  context: Context,
  entitySetName: string,
  outputDirectory: string
): Promise<void> {
  const config = context.config.EntitySets[entitySetName];
  const entitySet = context.entitySets[entitySetName];
  if (!entitySet) {
    return console.error('No EntitySet ' + entitySetName);
  }

  const entityType = context.entityTypes[entitySet.$.EntityType];
  if (!entityType) {
    return console.error(`No EntityType ${entitySet.$.EntityType} for EntitySet ${entitySetName}`);
  }

  console.log('Generating EntitySet ' + entitySetName);
  try {
    const outputLines = ["import { ODataService } from '@pta-kyma/c4c-odata-access';\r\n"];
    if (!config.operations) {
      config.operations = defaultOperations(entityType);
    }

    setupDefaultsWhereMissing(entitySetName, entityType, config.operations);

    outputLines.push(`export const ${entitySet.$.Name} = {`);
    Object.entries(config.operations).forEach(([operationName, e]) => {
      const expand = e.expand && e.expand.length > 0 ? '&$expand=' + e.expand.join(',') : '';

      switch (e.type) {
        case 'query':
          outputLines.push(
            `${operationName}(service: ODataService, filter?: string): Promise<${e.entityName}[]> {`
          );
          outputLines.push("if (filter === undefined) filter = '$top=20'");

          outputLines.push(`const base = '${context.config.ODataService}/${entitySet.$.Name}';`);
          outputLines.push(
            `const select = '${
              e.onlySelectedProperties
                ? '$select=' + e.properties.concat(e.expand || []).join(',')
                : ''
            }';`
          );
          outputLines.push(`const expand = '${expand}';`);
          outputLines.push(`const query = base + '?' + select + expand + filter`);

          outputLines.push(`return service.query<${e.entityName}[]>(query);`);
          outputLines.push('},\r\n');
          break;

        case 'fetch':
          outputLines.push(
            `${operationName}(service: ODataService, objectID: string): Promise<${e.entityName}> {`
          );

          outputLines.push(
            `const base = "${context.config.ODataService}/${entitySet.$.Name}('" + objectID + "')";`
          );
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

    Object.entries(config.operations).forEach(([operationName, operation]) => {
      generateEntityRepresentation(outputLines, operation, operationName, entityType, context);
    });

    const outputFile = await promises.open(
      `${outputDirectory}/${context.config.ODataService}.${entitySetName}.ts`,
      'w'
    );
    await outputFile.writeFile(outputLines.join('\r\n'));
    await outputFile.close();
  } catch (err) {
    console.log(err);
  } finally {
  }
}
