export declare type DebugLogger = (msg: string) => void;
export interface ODataService {
    query<T>(text: string, logger?: DebugLogger): Promise<T>;
    patch<T>(text: string, obj: T, logger?: DebugLogger): Promise<any>;
    post<T>(text: string, obj: T, logger?: DebugLogger): Promise<any>;
}
//# sourceMappingURL=odataService.d.ts.map