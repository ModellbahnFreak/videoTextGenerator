import { Equal, In, IsNull, Or, Repository } from "typeorm";
import dataSource from "../dataSource.js";
import { Client, ClientType } from "../model/Client.js";
import { DataKey } from "../model/DataKey.js";
import { Topic } from "../model/Topic.js";

export interface ClientRepository extends Repository<Client> {
    loginClient(token?: string): Promise<Client | undefined>;
    createServerClient(uuid: string): Promise<Client>;
    cleanup(): Promise<void>;
    createIfNotExists(topic: Omit<Client, "createdDataKeys">): Promise<Client>;
}

export const clientRepository: ClientRepository = dataSource.getRepository(Client).extend({
    async loginClient(token?: string): Promise<Client | undefined> {
        let client: Client | null = null;
        if (token) {
            let uuid = token;
            if (!token.match(/^[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$/)) {
                console.error("Token login not yet implemented");
                return undefined;
            }
            client = await this.findOneBy({
                uuid: uuid
            });
        } else {
            client = new Client();
        }
        if (!client) {
            return undefined;
        } else {
            const saved = await this.save(client);
            console.debug(`Logging in client ${saved?.uuid}`);
            return saved;
        }
    },
    async createServerClient(uuid: string): Promise<Client> {
        let client: Client | null = null;
        if (!uuid.match(/^[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$/)) {
            throw new Error("Not a valid uuid: " + uuid);
        }
        client = await this.findOneBy({
            uuid
        });
        if (client) {
            return client;
        }
        client = new Client(uuid);
        client.type = ClientType.SERVER;
        const saved = await this.save(client);
        return saved;
    },
    async cleanup(): Promise<void> {
        await this.manager.transaction(async manager => {
            const clientsWithoutConfig = (await manager.find(Client, {
                select: { uuid: true },
                where: {
                    type: ClientType.CLIENT,
                    config: Or(IsNull(), Equal({})),
                }
            })).map(c => c.uuid);

            const allUnusedClientIds = (await Promise.all(
                clientsWithoutConfig.map(async uuid => ({ uuid, dataKeys: await manager.countBy(DataKey, { createdBy: { uuid } }) }))
            ))
                .filter(c => c.dataKeys <= 0)
                .map(c => c.uuid);

            if (allUnusedClientIds.length > 0) {
                console.log(`Found ${allUnusedClientIds.length} propably not needed clients. Cleaning up:\n\t${allUnusedClientIds.join("\n\t")}`);
                await manager.delete(Client, allUnusedClientIds);
            }
            return;
        });
    },
    async createIfNotExists(client: Omit<Client, "createdDataKeys">): Promise<Client> {
        const existing = await this.findOneBy({
            uuid: client.uuid
        });
        if (existing) {
            return existing;
        }
        await this.createQueryBuilder()
            .insert()
            .values(client)
            .orUpdate(["uuid"])
            .execute();
        return await this.findOneByOrFail({
            uuid: client.uuid
        });
    }
} as ClientRepository);