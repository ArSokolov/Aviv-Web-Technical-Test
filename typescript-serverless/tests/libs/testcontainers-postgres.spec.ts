import { describe, expect, it } from "vitest";
import { suiteBodyWithDb } from "./testcontainers-postgres";

describe("testcontainers postgres", () => {
  suiteBodyWithDb((postgresClient) =>
    it("connects and executes test query", async () => {
      await postgresClient().connect();
      const result = await postgresClient().query("SELECT 1");
      expect(result.rows[0]).toEqual({ "?column?": 1 });
    })
  );
});
