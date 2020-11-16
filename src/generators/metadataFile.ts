import { Context } from '../context';
import { promises } from 'fs';

export async function generateMetadataFile(
  context: Context,
  outputDirectory: string
): Promise<void> {
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
