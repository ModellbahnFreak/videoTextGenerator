import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1716672974979 implements MigrationInterface {
    name = 'Migration1716672974979'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "topic" ("idOrName" varchar PRIMARY KEY NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "client" ("uuid" varchar PRIMARY KEY NOT NULL, "config" text, "type" varchar NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "data_key" ("key" varchar NOT NULL, "value" text, "topicIdOrName" varchar NOT NULL, "version" integer NOT NULL, "createdByUuid" varchar, PRIMARY KEY ("key", "topicIdOrName"))`);
        await queryRunner.query(`CREATE TABLE "temporary_data_key" ("key" varchar NOT NULL, "value" text, "topicIdOrName" varchar NOT NULL, "version" integer NOT NULL, "createdByUuid" varchar, CONSTRAINT "FK_fcdd9c2da59975378be538b36a3" FOREIGN KEY ("topicIdOrName") REFERENCES "topic" ("idOrName") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_1cdad5527326a407f52093e6f34" FOREIGN KEY ("createdByUuid") REFERENCES "client" ("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION, PRIMARY KEY ("key", "topicIdOrName"))`);
        await queryRunner.query(`INSERT INTO "temporary_data_key"("key", "value", "topicIdOrName", "version", "createdByUuid") SELECT "key", "value", "topicIdOrName", "version", "createdByUuid" FROM "data_key"`);
        await queryRunner.query(`DROP TABLE "data_key"`);
        await queryRunner.query(`ALTER TABLE "temporary_data_key" RENAME TO "data_key"`);
        await queryRunner.query(`CREATE TABLE "query-result-cache" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "identifier" varchar, "time" bigint NOT NULL, "duration" integer NOT NULL, "query" text NOT NULL, "result" text NOT NULL)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "query-result-cache"`);
        await queryRunner.query(`ALTER TABLE "data_key" RENAME TO "temporary_data_key"`);
        await queryRunner.query(`CREATE TABLE "data_key" ("key" varchar NOT NULL, "value" text, "topicIdOrName" varchar NOT NULL, "version" integer NOT NULL, "createdByUuid" varchar, PRIMARY KEY ("key", "topicIdOrName"))`);
        await queryRunner.query(`INSERT INTO "data_key"("key", "value", "topicIdOrName", "version", "createdByUuid") SELECT "key", "value", "topicIdOrName", "version", "createdByUuid" FROM "temporary_data_key"`);
        await queryRunner.query(`DROP TABLE "temporary_data_key"`);
        await queryRunner.query(`DROP TABLE "data_key"`);
        await queryRunner.query(`DROP TABLE "client"`);
        await queryRunner.query(`DROP TABLE "topic"`);
    }

}
