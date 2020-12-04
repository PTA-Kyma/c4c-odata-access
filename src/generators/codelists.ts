import { promises } from 'fs';

import { ServiceGenerationContext } from '../generate';

export async function generateCodelists(context: ServiceGenerationContext): Promise<void> {
  const outputLines = [];
  outputLines.push('export const codelists = {');

  Object.entries(context.codeLists).forEach(([entityName, properties]) => {
    outputLines.push(` ${entityName}: {`);
    Object.entries(properties).forEach(([propertyName, codelist]) => {
      outputLines.push(`  '${propertyName}': '${context.baseUrl}/${codelist}', `);
    });
    outputLines.push(` },`);
  });

  outputLines.push('}');
  await promises.writeFile(context.targetFolderPath + '/codelists.ts', outputLines.join('\r\n'));
}
