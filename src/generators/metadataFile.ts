import { promises } from 'fs';
import { ParsedEdmxFile } from '../parseEdmxFile';

export async function generateMetadataFile(
  edmx: ParsedEdmxFile,
  outputDirectory: string
): Promise<void> {
  const outputLines = [];
  outputLines.push('export const metadata = {');
  for (const entityType of Object.values(edmx.entityTypes)) {
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

  await promises.writeFile(outputDirectory + '/metadata.ts', outputLines.join('\r\n'));
}
