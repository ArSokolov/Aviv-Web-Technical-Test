import { afterAll, beforeAll } from "vitest";
import PostgresClient from "serverless-postgres";
import { readdir, readFile } from "fs/promises";
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";

export const suiteBodyWithDb = (
  suitBody: (getClient: () => PostgresClient) => void
) => {
  let container: StartedPostgreSqlContainer;
  let postgresClient: PostgresClient;

  beforeAll(async () => {
    container = await new PostgreSqlContainer().start();

    postgresClient = new PostgresClient({
      host: container.getHost(),
      port: container.getPort(),
      database: container.getDatabase(),
      user: container.getUsername(),
      password: container.getPassword(),
    });
    await postgresClient.connect();
    const projectRoot = "./..";
    const dbFolderPath = `${projectRoot}/db`;
    const sqlFileNames = await readdir(dbFolderPath);
    const sqlFiles = await Promise.all(
      sqlFileNames.map((file) => readFile(`${dbFolderPath}/${file}`, "utf8"))
    );
    await Promise.all(
      sqlFiles.map((sqlString) => postgresClient.query(sqlString))
    );
  });
  afterAll(async () => {
    await postgresClient.end();
    await container.stop();
  });

  suitBody(() => postgresClient);
};
