export interface ODataService {
    query<T>(text: string): Promise<T>;
    patch<T>(text: string, obj: T): Promise<any>;
    post<T>(text: string, obj: T): Promise<any>;
}
//# sourceMappingURL=odataService.d.ts.map