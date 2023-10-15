import { describe, expect, it } from "vitest";
import { suiteBodyWithDb } from "../libs/testcontainers-postgres";
import { PriceWrite } from "@/types.generated";
import { PriceRepo } from "@/repositories/prices";

const priceWrite: Readonly<PriceWrite> = {
  price_eur: 100,
};
const priceWrite2: Readonly<PriceWrite> = {
  price_eur: 150,
};

function newListingId() {
  return Math.floor(Math.random() * 1000000);
}

describe("price repo", () => {
  suiteBodyWithDb((postgresClient) => {
    it("saves price with returning correct inserted fields", async () => {
      const repo = new PriceRepo(postgresClient());
      const listingId = newListingId();

      const insertedPrice = await repo.insertPriceFor(listingId, priceWrite);

      expect(insertedPrice.price_eur).equal(priceWrite.price_eur);
    });

    it("second saved price with returning correct inserted fields", async () => {
      const repo = new PriceRepo(postgresClient());
      const listingId = newListingId();
      await repo.insertPriceFor(listingId, priceWrite);

      const insertedPrice2 = await repo.insertPriceFor(listingId, priceWrite2);

      expect(insertedPrice2.price_eur).equal(priceWrite2.price_eur);
    });

    it("getPricesFor fetches saved single price", async () => {
      const repo = new PriceRepo(postgresClient());
      const listingId = newListingId();
      await repo.insertPriceFor(listingId, priceWrite);

      const fetchedPrices = await repo.getPricesFor(listingId);

      expect(fetchedPrices.map((price) => price.price_eur)).toEqual([
        priceWrite.price_eur,
      ]);
    });

    it("getPricesFor fetches saved prices", async () => {
      const repo = new PriceRepo(postgresClient());
      const listingId = newListingId();
      await repo.insertPriceFor(listingId, priceWrite);
      await repo.insertPriceFor(listingId, priceWrite2);

      const fetchedPrices = await repo.getPricesFor(listingId);

      expect(fetchedPrices.map((price) => price.price_eur)).toEqual([
        priceWrite.price_eur,
        priceWrite2.price_eur,
      ]);
    });
  });
});
