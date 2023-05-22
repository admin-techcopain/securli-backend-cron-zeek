import "reflect-metadata";
import { DataSource } from "typeorm";

const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "ec2-54-86-81-23.compute-1.amazonaws.com",
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: true,
  logging: false,
  entities: ["src/entity/**/*.ts"],
  migrations: ["src/migrations/**/*.ts"],
  migrationsTableName: 'migrations',
  subscribers: ["src/subscriber/**/*.ts"]
});

export default AppDataSource;
