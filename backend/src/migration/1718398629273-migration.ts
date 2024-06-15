import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1718398629273 implements MigrationInterface {
    name = 'Migration1718398629273'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "topic" ("idOrName" varchar PRIMARY KEY NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "data_key" ("key" varchar NOT NULL, "value" text, "topicIdOrName" varchar NOT NULL, "version" integer NOT NULL, "subversion" integer NOT NULL, "createdByUuid" varchar NOT NULL, PRIMARY KEY ("key", "topicIdOrName"))`);
        await queryRunner.query(`CREATE TABLE "topic_permission" ("topicIdOrName" varchar NOT NULL, "clientUuid" varchar NOT NULL, "access" integer NOT NULL, PRIMARY KEY ("topicIdOrName", "clientUuid"))`);
        await queryRunner.query(`CREATE TABLE "client" ("uuid" varchar PRIMARY KEY NOT NULL, "config" text, "type" varchar NOT NULL, "uuidLoginAllowed" boolean NOT NULL, "defaultAccess" integer NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "temporary_data_key" ("key" varchar NOT NULL, "value" text, "topicIdOrName" varchar NOT NULL, "version" integer NOT NULL, "subversion" integer NOT NULL, "createdByUuid" varchar NOT NULL, CONSTRAINT "FK_fcdd9c2da59975378be538b36a3" FOREIGN KEY ("topicIdOrName") REFERENCES "topic" ("idOrName") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_1cdad5527326a407f52093e6f34" FOREIGN KEY ("createdByUuid") REFERENCES "client" ("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION, PRIMARY KEY ("key", "topicIdOrName"))`);
        await queryRunner.query(`INSERT INTO "temporary_data_key"("key", "value", "topicIdOrName", "version", "subversion", "createdByUuid") SELECT "key", "value", "topicIdOrName", "version", "subversion", "createdByUuid" FROM "data_key"`);
        await queryRunner.query(`DROP TABLE "data_key"`);
        await queryRunner.query(`ALTER TABLE "temporary_data_key" RENAME TO "data_key"`);
        await queryRunner.query(`CREATE TABLE "temporary_topic_permission" ("topicIdOrName" varchar NOT NULL, "clientUuid" varchar NOT NULL, "access" integer NOT NULL, CONSTRAINT "FK_a653e3df3b45252b499219caed8" FOREIGN KEY ("topicIdOrName") REFERENCES "topic" ("idOrName") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_eed282329723feaf99c8cb69b07" FOREIGN KEY ("clientUuid") REFERENCES "client" ("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION, PRIMARY KEY ("topicIdOrName", "clientUuid"))`);
        await queryRunner.query(`INSERT INTO "temporary_topic_permission"("topicIdOrName", "clientUuid", "access") SELECT "topicIdOrName", "clientUuid", "access" FROM "topic_permission"`);
        await queryRunner.query(`DROP TABLE "topic_permission"`);
        await queryRunner.query(`ALTER TABLE "temporary_topic_permission" RENAME TO "topic_permission"`);
        await queryRunner.query(`CREATE TABLE "query-result-cache" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "identifier" varchar, "time" bigint NOT NULL, "duration" integer NOT NULL, "query" text NOT NULL, "result" text NOT NULL)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "query-result-cache"`);
        await queryRunner.query(`ALTER TABLE "topic_permission" RENAME TO "temporary_topic_permission"`);
        await queryRunner.query(`CREATE TABLE "topic_permission" ("topicIdOrName" varchar NOT NULL, "clientUuid" varchar NOT NULL, "access" integer NOT NULL, PRIMARY KEY ("topicIdOrName", "clientUuid"))`);
        await queryRunner.query(`INSERT INTO "topic_permission"("topicIdOrName", "clientUuid", "access") SELECT "topicIdOrName", "clientUuid", "access" FROM "temporary_topic_permission"`);
        await queryRunner.query(`DROP TABLE "temporary_topic_permission"`);
        await queryRunner.query(`ALTER TABLE "data_key" RENAME TO "temporary_data_key"`);
        await queryRunner.query(`CREATE TABLE "data_key" ("key" varchar NOT NULL, "value" text, "topicIdOrName" varchar NOT NULL, "version" integer NOT NULL, "subversion" integer NOT NULL, "createdByUuid" varchar NOT NULL, PRIMARY KEY ("key", "topicIdOrName"))`);
        await queryRunner.query(`INSERT INTO "data_key"("key", "value", "topicIdOrName", "version", "subversion", "createdByUuid") SELECT "key", "value", "topicIdOrName", "version", "subversion", "createdByUuid" FROM "temporary_data_key"`);
        await queryRunner.query(`DROP TABLE "temporary_data_key"`);
        await queryRunner.query(`DROP TABLE "client"`);
        await queryRunner.query(`DROP TABLE "topic_permission"`);
        await queryRunner.query(`DROP TABLE "data_key"`);
        await queryRunner.query(`DROP TABLE "topic"`);
    }

}
