export class VersionManager {
    protected readonly dataKeyVersions: { [topic: string]: { [dataKey: string]: number } } = {};
    protected readonly knownEventIds: { [topic: string]: { [event: string]: Set<string> } } = {};

    constructor() { }

    addKnownEventUuid(topic: string, event: string, uuid: string): boolean {
        if (!this.knownEventIds[topic]) {
            this.knownEventIds[topic] = {};
        }
        if (!this.knownEventIds[topic][event]) {
            this.knownEventIds[topic][event] = new Set();
        }
        const knownSet = this.knownEventIds[topic][event];
        if (!knownSet.has(uuid)) {
            knownSet.add(uuid);
            return false;
        }
        console.log(`Recevied event ${topic}/e-${event}/${uuid} again. Not emitting.`);
        return true;
    }

    getNextDataKeyVersion(topic: string, dataKey: string): number {
        if (!this.dataKeyVersions[topic]) {
            this.dataKeyVersions[topic] = {};
        }
        if (!this.dataKeyVersions[topic][dataKey]) {
            this.dataKeyVersions[topic][dataKey] = 0;
        }
        return ++this.dataKeyVersions[topic][dataKey];
    }

    isDataKeyVersionNew(topic: string, dataKey: string, version: number): boolean {
        if (!this.dataKeyVersions[topic]) {
            this.dataKeyVersions[topic] = {};
        }
        const oldVersion = this.dataKeyVersions[topic][dataKey];
        this.dataKeyVersions[topic][dataKey] = version;
        const isNew = oldVersion === undefined ||
            oldVersion < version ||
            (oldVersion > (4294967295 - 5) && version < 5);
        if (!isNew) {
            console.log(`Recevied dataKey ${topic}/d-${dataKey}/${version} again. Not emitting.`);
        }
        return isNew;
    }
}