import "dotenv/config.js"
import "reflect-metadata"
import { DataSource } from "typeorm"

const isDev = process.env.NODE_ENV === "dev" || process.env.NODE_ENV === "development";

const dataSource = new DataSource({
    type: "sqlite",
    database: process.env.DATABASE ?? "videotextgenerator.db",
    entities: ["out/model/**/*.js"],
    migrations: ["out/migrations/**/*.js"],
    synchronize: isDev,
    logging: isDev,
    cache: true
});

export default dataSource;