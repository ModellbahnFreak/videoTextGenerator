import "dotenv/config.js"
import "reflect-metadata"
import { DataSource } from "typeorm"

const dataSource = new DataSource({
    type: "sqlite",
    database: process.env.DATABASE ?? "videotextgenerator.db",
    entities: ["out/model/**/*.js"],
    migrations: ["out/migrations/**/*.js"],
    synchronize: process.env.NODE_ENV === "dev" || process.env.NODE_ENV === "development"
});

export default dataSource;