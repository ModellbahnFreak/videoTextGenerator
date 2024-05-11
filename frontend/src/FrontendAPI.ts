import type { APIBase, DataKey } from "@videotextgenerator/api";

export class FrontendAPI implements APIBase {
    constructor(protected readonly pluginUuid: string) {

    }

    getDataKey<T>(keyName: string, pluginUuid?: string | undefined): Promise<DataKey<unknown>> {
        console.log("API called", keyName, pluginUuid ?? this.pluginUuid);
    }
}