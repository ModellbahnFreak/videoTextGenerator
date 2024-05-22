import { Repository } from "typeorm";
import dataSource from "../dataSource.js";
import { Client } from "../model/Client.js";

export interface ClientRepository extends Repository<Client> {
    loginClient(token?: string): Promise<Client | undefined>;
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
        console.debug(`Logging in client ${client?.uuid}`);
        if (!client) {
            return undefined;
        } else {
            return this.save(client);
        }
    }
} as ClientRepository);