import { Context } from './context';
import { generateEntitySetConfig } from './generators/entitySet';
import { generateMetadataFile } from './generators/metadataFile';
import { promises } from 'fs';
import { join, resolve } from 'path';
import { parseStringPromise } from 'xml2js';
import {
  Config,
  defaultOperations,
  setupDefaultsWhereMissing,
  TypescriptOperationConfig,
} from './config.model';
import { Association, EntitySet, EntityType, Schema } from './edmx.model';

let [_1, _2, sourceFilePath, outputDirectory] = process.argv;
if (!sourceFilePath || !outputDirectory) {
  throw new Error(
    'Missing parameters, use generate {source file} {output folder}\r\nExample: generate path/file.edmx path/src/folder'
  );
}

const projectPath = resolve('../../..');

sourceFilePath = join(projectPath, sourceFilePath);
const configFilePath = sourceFilePath.replace('.edmx', '.json');
outputDirectory = join(projectPath, outputDirectory);
console.log(sourceFilePath, outputDirectory);

export const context: Context = {
  entitySets: {},
  entityTypes: {},
  config: { ODataService: '', Namespace: '' },
  associations: {},
};

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

  const tmp = join(projectPath, 'tmp');
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
    await generateEntitySetConfig(context, name, outputDirectory);
  }

  await generateMetadataFile(context, outputDirectory);
}

main();
