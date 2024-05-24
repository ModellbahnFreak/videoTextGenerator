import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1716516132263 implements MigrationInterface {
    name = 'Migration1716516132263'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "topic" ("idOrName" varchar PRIMARY KEY NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "client" ("uuid" varchar PRIMARY KEY NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "data_key" ("key" varchar NOT NULL, "value" text, "topicIdOrName" varchar NOT NULL, "version" integer NOT NULL, "createdByUuid" varchar, PRIMARY KEY ("key", "topicIdOrName"))`);
        await queryRunner.query(`CREATE TABLE "client_topic_subscriptions_topic" ("clientUuid" varchar NOT NULL, "topicIdOrName" varchar NOT NULL, PRIMARY KEY ("clientUuid", "topicIdOrName"))`);
        await queryRunner.query(`CREATE INDEX "IDX_813ec9574b9c7292b63d2431fd" ON "client_topic_subscriptions_topic" ("clientUuid") `);
        await queryRunner.query(`CREATE INDEX "IDX_6f1f32a1ee0164f0da0ab9f5b9" ON "client_topic_subscriptions_topic" ("topicIdOrName") `);
        await queryRunner.query(`CREATE TABLE "temporary_data_key" ("key" varchar NOT NULL, "value" text, "topicIdOrName" varchar NOT NULL, "version" integer NOT NULL, "createdByUuid" varchar, CONSTRAINT "FK_fcdd9c2da59975378be538b36a3" FOREIGN KEY ("topicIdOrName") REFERENCES "topic" ("idOrName") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_1cdad5527326a407f52093e6f34" FOREIGN KEY ("createdByUuid") REFERENCES "client" ("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION, PRIMARY KEY ("key", "topicIdOrName"))`);
        await queryRunner.query(`INSERT INTO "temporary_data_key"("key", "value", "topicIdOrName", "version", "createdByUuid") SELECT "key", "value", "topicIdOrName", "version", "createdByUuid" FROM "data_key"`);
        await queryRunner.query(`DROP TABLE "data_key"`);
        await queryRunner.query(`ALTER TABLE "temporary_data_key" RENAME TO "data_key"`);
        await queryRunner.query(`DROP INDEX "IDX_813ec9574b9c7292b63d2431fd"`);
        await queryRunner.query(`DROP INDEX "IDX_6f1f32a1ee0164f0da0ab9f5b9"`);
        await queryRunner.query(`CREATE TABLE "temporary_client_topic_subscriptions_topic" ("clientUuid" varchar NOT NULL, "topicIdOrName" varchar NOT NULL, CONSTRAINT "FK_813ec9574b9c7292b63d2431fd7" FOREIGN KEY ("clientUuid") REFERENCES "client" ("uuid") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_6f1f32a1ee0164f0da0ab9f5b96" FOREIGN KEY ("topicIdOrName") REFERENCES "topic" ("idOrName") ON DELETE CASCADE ON UPDATE CASCADE, PRIMARY KEY ("clientUuid", "topicIdOrName"))`);
        await queryRunner.query(`INSERT INTO "temporary_client_topic_subscriptions_topic"("clientUuid", "topicIdOrName") SELECT "clientUuid", "topicIdOrName" FROM "client_topic_subscriptions_topic"`);
        await queryRunner.query(`DROP TABLE "client_topic_subscriptions_topic"`);
        await queryRunner.query(`ALTER TABLE "temporary_client_topic_subscriptions_topic" RENAME TO "client_topic_subscriptions_topic"`);
        await queryRunner.query(`CREATE INDEX "IDX_813ec9574b9c7292b63d2431fd" ON "client_topic_subscriptions_topic" ("clientUuid") `);
        await queryRunner.query(`CREATE INDEX "IDX_6f1f32a1ee0164f0da0ab9f5b9" ON "client_topic_subscriptions_topic" ("topicIdOrName") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_6f1f32a1ee0164f0da0ab9f5b9"`);
        await queryRunner.query(`DROP INDEX "IDX_813ec9574b9c7292b63d2431fd"`);
        await queryRunner.query(`ALTER TABLE "client_topic_subscriptions_topic" RENAME TO "temporary_client_topic_subscriptions_topic"`);
        await queryRunner.query(`CREATE TABLE "client_topic_subscriptions_topic" ("clientUuid" varchar NOT NULL, "topicIdOrName" varchar NOT NULL, PRIMARY KEY ("clientUuid", "topicIdOrName"))`);
        await queryRunner.query(`INSERT INTO "client_topic_subscriptions_topic"("clientUuid", "topicIdOrName") SELECT "clientUuid", "topicIdOrName" FROM "temporary_client_topic_subscriptions_topic"`);
        await queryRunner.query(`DROP TABLE "temporary_client_topic_subscriptions_topic"`);
        await queryRunner.query(`CREATE INDEX "IDX_6f1f32a1ee0164f0da0ab9f5b9" ON "client_topic_subscriptions_topic" ("topicIdOrName") `);
        await queryRunner.query(`CREATE INDEX "IDX_813ec9574b9c7292b63d2431fd" ON "client_topic_subscriptions_topic" ("clientUuid") `);
        await queryRunner.query(`ALTER TABLE "data_key" RENAME TO "temporary_data_key"`);
        await queryRunner.query(`CREATE TABLE "data_key" ("key" varchar NOT NULL, "value" text, "topicIdOrName" varchar NOT NULL, "version" integer NOT NULL, "createdByUuid" varchar, PRIMARY KEY ("key", "topicIdOrName"))`);
        await queryRunner.query(`INSERT INTO "data_key"("key", "value", "topicIdOrName", "version", "createdByUuid") SELECT "key", "value", "topicIdOrName", "version", "createdByUuid" FROM "temporary_data_key"`);
        await queryRunner.query(`DROP TABLE "temporary_data_key"`);
        await queryRunner.query(`DROP INDEX "IDX_6f1f32a1ee0164f0da0ab9f5b9"`);
        await queryRunner.query(`DROP INDEX "IDX_813ec9574b9c7292b63d2431fd"`);
        await queryRunner.query(`DROP TABLE "client_topic_subscriptions_topic"`);
        await queryRunner.query(`DROP TABLE "data_key"`);
        await queryRunner.query(`DROP TABLE "client"`);
        await queryRunner.query(`DROP TABLE "topic"`);
    }

}
