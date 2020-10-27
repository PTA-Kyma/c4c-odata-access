import { promises } from 'fs';
import path from 'path';
import { parseStringPromise } from 'xml2js';
import {
  Config,
  defaultOperations,
  setupDefaultsWhereMissing,
  TypescriptOperationConfig,
} from './config.model';
import { Association, EntitySet, EntityType, Schema } from './edmx.model';

interface Context {
  entityTypes: { [name: string]: EntityType };
  entitySets: { [name: string]: EntitySet };
  associations: { [name: string]: Association };
  config: Config;
}

const context: Context = {
  entitySets: {},
  entityTypes: {},
  config: { ODataService: '', Namespace: '' },
  associations: {},
};

let [_1, _2, sourceFilePath, outputDirectory] = process.argv;
if (!sourceFilePath || !outputDirectory) {
  throw new Error(
    'Missing parameters, use generate {source file} {output folder}\r\nExample: generate path/file.edmx path/src/folder'
  );
}

const projectPath = path.resolve('../..');

sourceFilePath = path.join(projectPath, sourceFilePath);
const configFilePath = sourceFilePath.replace('.edmx', '.json');
outputDirectory = path.join(projectPath, outputDirectory);
console.log(sourceFilePath, outputDirectory);

async function main() {
  try {
    context.config = JSON.parse(await promises.readFile(configFilePath, 'utf-8'));
  } catch (err) {
    console.error('Failed to read from ' + configFilePath);
    throw err;
  }

  if (!context.config.ODataService) {
    context.config.ODataService = 'c4codataapi';
  }

  if (!context.config.Namespace) {
    context.config.Namespace = 'c4codata';
  }

  const f = await promises.readFile(sourceFilePath, { encoding: 'utf-8' });
  const xml = await parseStringPromise(f);
  const schemas = xml['edmx:Edmx']['edmx:DataServices'][0].Schema as Schema[];

  schemas.forEach((schema) => {
    schema.EntityType.forEach((entityType) => {
      context.entityTypes[context.config.Namespace + '.' + entityType.$.Name] = entityType;
    });

    schema.EntityContainer.forEach((container) => {
      container.EntitySet.forEach((entitySet) => {
        context.entitySets[entitySet.$.Name] = entitySet;
      });
    });

    schema.Association.forEach((association) => {
      context.associations[context.config.Namespace + '.' + association.$.Name] = association;
    });
  });

  const tmp = path.join(projectPath, 'tmp');
  try {
    await promises.mkdir(tmp);
  } catch (err) {
    // maybe exists alreadyu
  }

  await promises.writeFile(
    tmp + '/entityTypes.json',
    JSON.stringify(context.entityTypes, null, '\t')
  );
  await promises.writeFile(
    tmp + '/entityCollections.json',
    JSON.stringify(context.entitySets, null, '\t')
  );

  if (!context.config.EntitySets) return;

  for (const name in context.config.EntitySets) {
    await generateEntitySetConfig(context, name);
  }

  await generateMetadataFile(context);
}

async function generateEntitySetConfig(context: Context, entitySetName: string): Promise<void> {
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
    const outputLines = ["import { ODataService } from './odataService';\r\n"];
    if (!config.operations) {
      config.operations = defaultOperations(entityType);
    }

    setupDefaultsWhereMissing(entitySetName, entityType, config.operations);
    outputLines.push(`import { ODataService } from 'c4c-odata-access';\r\n`);

    outputLines.push(`export const ${entitySet.$.Name} = {`);
    Object.entries(config.operations).forEach(([operationName, e]) => {
      const expand = e.expand && e.expand.length > 0 ? '$expand=' + e.expand.join(',') : '';

      switch (e.type) {
        case 'query':
          outputLines.push(
            `${operationName}(service: ODataService, filter?: string): Promise<${e.entityName}[]> {`
          );
          outputLines.push("if (filter === undefined) filter = '$top=20'");
          outputLines.push(
            `return service.query<${e.entityName}[]>('${context.config.ODataService}/${
              entitySet.$.Name
            }?$select=${e.properties.join(',')}${expand}&' + filter);`
          );
          outputLines.push('},\r\n');
          break;

        case 'fetch':
          outputLines.push(
            `${operationName}(service: ODataService, objectID: string): Promise<${e.entityName}> {`
          );
          outputLines.push(
            `const filter = "${context.config.ODataService}/${entitySet.$.Name}('" + objectID + "')?${expand}"`
          );
          outputLines.push(`return service.query<${e.entityName}>(filter);`);
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

async function generateMetadataFile(context: Context): Promise<void> {
  const outputLines = [];
  outputLines.push('export const metadata = {');
  for (const entityType of Object.values(context.entityTypes)) {
    outputLines.push(entityType.$.Name + ': {');
    outputLines.push('    Properties : {');
    entityType.Property.forEach((p) => {
      outputLines.push(`${p.$.Name}: '${p.$.Name}',`);
    });
    outputLines.push('},'); // end of Properties
    outputLines.push('    NavigationProperties : {');
    if (entityType.NavigationProperty) {
      entityType.NavigationProperty.forEach((p) => {
        outputLines.push(`${p.$.Name}: '${p.$.Name}',`);
      });
    }
    outputLines.push('}'); // end of NavigationProperties
    outputLines.push('},'); // end of EntityType
  }
  outputLines.push('}');

  await promises.writeFile(
    outputDirectory + '/' + context.config.ODataService + '.metadata.ts',
    outputLines.join('\r\n')
  );
}

export function getPropertyType(xmlType: string): string {
  switch (xmlType) {
    case 'Edm.Int32':
    case 'Edm.Int16':
      return 'number';
    case 'Edm.String':
    default:
      return 'string';
  }
}

function generateEntityRepresentation(
  outputLines: string[],
  operation: TypescriptOperationConfig,
  operationName: string,
  entityType: EntityType,
  context: Context
) {
  const expandedProperties: {
    name: string;
    type: string;
    singleOrArray: 'single' | 'array';
  }[] = [];

  if (operation.expand) {
    operation.expand.forEach((navigationPropertyName) => {
      const navigationProperty = entityType.NavigationProperty.find(
        (p) => p.$.Name === navigationPropertyName
      );
      if (!navigationProperty) {
        throw new Error(
          `NavigationProperty ${navigationPropertyName} on entity type ${entityType.$.Name} not found!`
        );
      }

      const childEntityTypeName = context.config.Namespace + '.' + navigationProperty.$.ToRole;
      const childEntityType = context.entityTypes[childEntityTypeName];
      if (!childEntityType) {
        throw new Error(
          `Target EntityType ${childEntityTypeName} not found for NavigationProperty ${navigationPropertyName} on entity type ${entityType.$.Name}`
        );
      }

      const childEntityName = `${entityType.$.Name}_${operationName}_${navigationProperty.$.ToRole}`;
      outputLines.push(`export interface ${childEntityName} {`);
      childEntityType.Property.forEach((property) => {
        const name = property.$.Name;
        const nullable = property.$.Nullable === 'true';
        const type = getPropertyType(property.$.Type);
        outputLines.push(`${name}${nullable ? '?' : ''}: ${type}`);
      });
      outputLines.push('}');

      const association = context.associations[navigationProperty.$.Relationship];
      if (!association) {
        throw new Error(`No association ${navigationProperty.$.Relationship}`);
      }
      const associationEnd = association.End.find((e) => e.$.Type === childEntityTypeName);
      if (!associationEnd) {
        throw new Error(`No association end with role ${childEntityTypeName}`);
      }

      expandedProperties.push({
        name: navigationPropertyName,
        type: childEntityName,
        singleOrArray: associationEnd.$.Multiplicity === '1' ? 'single' : 'array',
      });
    });

    console.log(entityType.NavigationProperty);
  }

  outputLines.push(`export interface ${operation.entityName} {`);
  operation.properties.forEach((p) => {
    const property = entityType.Property.find((p1) => p1.$.Name === p);
    if (!property) {
      throw new Error(`Unknown property ${p}`);
    }
    const name = property.$.Name;
    const nullable = property.$.Nullable === 'true';
    const type = getPropertyType(property.$.Type);
    outputLines.push(`${name}${nullable ? '?' : ''}: ${type}`);
  });
  expandedProperties.forEach(({ name, type, singleOrArray }) => {
    outputLines.push(`${name}: ${type}${singleOrArray === 'single' ? '' : '[]'};`);
  });
  outputLines.push(`}\r\n`);
}

main();
