export interface EdmxFile {
    'edmx:Edmx': {
        'edmx:DataServices': {
            Schema: EdmxSchema[];
        }[];
    };
}
export interface EdmxEntitySet {
    $: {
        Name: string;
        EntityType: string;
        'sap:creatable'?: 'true' | 'false';
        'sap:updatable'?: 'true' | 'false';
        'sap:deletable'?: 'true' | 'false';
        'sap:semantics'?: string;
        'sap:label'?: string;
    };
}
export interface EdmxEntityType {
    $: {
        Name: string;
        'c4c:parent-entity-type'?: string;
    };
    Key: [{
        PropertyRef: {
            $: {
                Name: string;
            };
        }[];
    }];
    Property: EdmxProperty[];
    NavigationProperty: EdmxNavigationProperty[];
    $$: {
        Namespace: string;
    };
}
export interface EdmxProperty {
    $: {
        Name: string;
        Type: string;
        Nullable: 'true' | 'false';
        MaxLength?: string;
        Precision?: string;
        Scale?: string;
        FixedLength?: 'true' | 'false';
        'm:FC_TargetPath': string;
        'sap:creatable': 'true' | 'false';
        'sap:updatable': 'true' | 'false';
        'sap:filterable': 'true' | 'false';
        'sap:text'?: string;
        'sap:label'?: string;
        'sap:semantics': 'fixed-values';
        'sap:display-format'?: string;
        'c4c:value-help'?: string;
        'c4c:context-property'?: string;
        'c4c:is-parent-internal-key'?: 'true' | 'false';
        'c4c:extension-field'?: 'true' | 'false';
    };
}
export interface EdmxNavigationProperty {
    $: {
        Name: string;
        Relationship: string;
        FromRole: string;
        ToRole: string;
    };
}
export interface EdmxSchema {
    $: {
        Namespace: string;
    };
    EntityContainer: EdmxEntityContainer[];
    EntityType: EdmxEntityType[];
    ComplexType: EdmxComplexType[];
    Association: EdmxAssociation[];
}
export interface EdmxEntityContainer {
    $: {
        'm:IsDefaultEntityContainer': 'true' | 'false';
    };
    EntitySet: EdmxEntitySet[];
    AssociationSet: EdmxAssociationSet[];
    FunctionImport: EdmxFunctionImport[];
}
export interface EdmxComplexType {
    $: {
        Name: string;
    };
    Property: EdmxProperty[];
}
export interface EdmxAssociation {
    $: {
        Name: string;
    };
    End: EdmxAssociationEnd[];
}
export interface EdmxAssociationSet {
    $: {
        Name: string;
        Association: string;
        'sap:creatable': 'true' | 'false';
        'sap:updatable': 'true' | 'false';
        'sap:deletable': 'true' | 'false';
    };
    End: EdmxAssociationSetEnd[];
}
export interface EdmxAssociationEnd {
    $: {
        Type: string;
        Multiplicity: '1' | '*';
        Role: string;
    };
}
export interface EdmxAssociationSetEnd {
    $: {
        EntitySet: string;
        Role: string;
    };
}
export interface EdmxFunctionImport {
    $: {
        Name: string;
        ReturnType: string;
        EntitySet: string;
        'm:HttpMethod': 'POST' | 'GET';
    };
    Parameter: EdmxFunctionImportParameter[];
}
export interface EdmxFunctionImportParameter {
    $: {
        Name: string;
        Type: string;
        Mode: 'In';
    };
}
//# sourceMappingURL=edmx.model.d.ts.map