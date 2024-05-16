import "dotenv/config.js"
import "reflect-metadata"
import { DataSource } from "typeorm"

const dataSource = new DataSource({
    type: "sqlite",
    database: process.env.DATABASE ?? "videotextgenerator.db",
    entities: ["src/model/**/*.js"],
    migrations: ["src/migrations/**/*.js"]
});

export default dataSource;