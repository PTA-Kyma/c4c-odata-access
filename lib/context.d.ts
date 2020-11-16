import { Config } from './config.model';
import { Association, EntitySet, EntityType } from './edmx.model';
export interface Context {
    entityTypes: {
        [name: string]: EntityType;
    };
    entitySets: {
        [name: string]: EntitySet;
    };
    associations: {
        [name: string]: Association;
    };
    config: Config;
}
//# sourceMappingURL=context.d.ts.map