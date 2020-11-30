import { promises } from 'fs';
import { dirname, join, resolve } from 'path';
import winston, { createLogger, format } from 'winston';
import { parseStringPromise } from 'xml2js';
import { Config, ODataServiceConfig } from './config.model';
import { EdmxFile } from './edmx.model';
import { generateCodelists } from './generators/codeLists';
import { generateEntitySet } from './generators/entitySet';
import { generateMetadataFile } from './generators/metadataFile';
import { parseEdmxFile, ParsedEdmxFile } from './parseEdmxFile';
const { combine, timestamp, label, prettyPrint, colorize } = format;

let [_1, _2, configFilePath, outputDirectory] = process.argv;
if (!configFilePath || !outputDirectory) {
  throw new Error(
    'Missing parameters, use generate {config file} {output folder}\r\nExample: generate path/file.edmx path/src/folder'
  );
}

configFilePath = resolve(configFilePath);
outputDirectory = resolve(outputDirectory);
const configFilePathBase = dirname(configFilePath);

export const logger = createLogger({
  level: 'debug',
  transports: [
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp(),
        format.printf((i) => `${i.level} ${i.message}`)
      ),
    }),
  ],
});

async function readConfig(): Promise<Config> {
  try {
    logger.info('Reading config from ' + configFilePath + '...');
    return JSON.parse(await promises.readFile(configFilePath, 'utf-8'));
  } catch (err) {
    logger.error('Failed to read from ' + configFilePath + ': ' + err.message);
    throw err;
  }
}

async function readEdmxFile(name: string): Promise<ParsedEdmxFile> {
  const edmxFilePath = join(configFilePathBase, name + '.edmx');
  try {
    logger.info(`Reading service ${name} definition from ${edmxFilePath}`);
    const f = await promises.readFile(edmxFilePath, { encoding: 'utf-8' });
    const xml = (await parseStringPromise(f)) as EdmxFile;
    return parseEdmxFile(xml);
  } catch (err) {
    logger.error(`Failed to read ${edmxFilePath}: ${err.message} ${err.stack}`);
    throw err;
  }
}

async function main() {
  logger.info(`================`);
  logger.info(`    START`);
  logger.info(`================`);
  const config = await readConfig();
  const services = Object.entries(config.services);
  logger.info(
    `Found ${services.length} services:${services
      .map(([serviceName, serviceConfig]) => serviceName)
      .join(', ')}`
  );

  try {
    logger.info(`Target directory: ${outputDirectory}`);
    await promises.mkdir(outputDirectory);
  } catch (err) {
    // maybe exists already
  }

  for (const [serviceName, serviceConfig] of services) {
    logger.info(`Processing ${serviceName}`);
    const targetFolderPath = join(outputDirectory, serviceName);
    try {
      await promises.mkdir(targetFolderPath);
    } catch (err) {
      // maybe exists already
    }

    try {
      const edmxFile = await readEdmxFile(serviceName);
      // await promises.writeFile(
      //   targetFolderPath + '/edmx.tmp.json',
      //   JSON.stringify(edmxFile, null, '\t')
      // );

      await processService(edmxFile, serviceConfig, targetFolderPath);
    } catch (err) {
      logger.error('Failed to process: ' + err.message);
      logger.error(err.stackTrace());
    }
  }

  logger.info(`================`);
  logger.info(`     STOP`);
  logger.info(`================`);
}

async function processService(
  edmx: ParsedEdmxFile,
  config: ODataServiceConfig,
  targetFolderPath: string
): Promise<void> {
  logger.info(`================`);
  logger.info(`Processing service ${config.baseUrl}`);
  logger.info(`================`);

  if (!config.entitySets) return;

  const context: ServiceGenerationContext = {
    edmx,
    targetFolderPath,
    baseUrl: config.baseUrl,
    codeLists: {},
  };

  for (const [entityName, entityConfig] of Object.entries(config.entitySets)) {
    await generateEntitySet(context, entityName, entityConfig);
  }

  await generateCodelists(context);
  await generateMetadataFile(edmx, targetFolderPath);
}

export interface ServiceGenerationContext {
  edmx: ParsedEdmxFile;
  targetFolderPath: string;
  baseUrl: string;
  codeLists: CodeLists;
}

export interface CodeLists {
  [entityModelName: string]: { [propertyName: string]: string };
}

(async function () {
  try {
    await main();
  } catch (err) {
    console.error('Failed to process!');
    console.error(err);
  }
})();
