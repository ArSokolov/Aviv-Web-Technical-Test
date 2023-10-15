import { describe, expect, it } from "vitest";
import { suiteBodyWithDb } from "../libs/testcontainers-postgres";
import { getRepository } from "@/repositories/listings";
import { ListingWrite } from "@/types.generated";

const listingWrite: Readonly<ListingWrite> = {
  bedrooms_count: 0,
  building_type: "APARTMENT",
  contact_phone_number: "",
  description: "",
  latest_price_eur: 0,
  name: "",
  postal_address: {
    city: "1",
    country: "2",
    postal_code: "3",
    street_address: "4",
  },
  rooms_count: 0,
  surface_area_m2: 0,
};
const updatedListing: Readonly<ListingWrite> = {
  ...listingWrite,
  description: "Another description",
};

describe("listing repo", () => {
  suiteBodyWithDb((postgresClient) => {
    it("saves listing with returning correct inserted fields", async () => {
      const repo = getRepository(postgresClient());

      const insertedListing = await repo.insertListing(listingWrite);

      expect(insertedListing).containSubset(listingWrite);
    });

    it("fetches previously saved listing", async () => {
      const repo = getRepository(postgresClient());
      const insertedListing = await repo.insertListing(listingWrite);

      const fetchedListing = await repo.getListing(insertedListing.id);

      expect(fetchedListing).containSubset(listingWrite);
    });

    it("updates previously saved listing returning previous version and new version", async () => {
      const repo = getRepository(postgresClient());
      const insertedListing = await repo.insertListing(listingWrite);

      const [prevListing, newListing] = await repo.updateListing(
        insertedListing.id,
        updatedListing
      );

      expect(prevListing).containSubset(listingWrite);
      expect(newListing).containSubset(updatedListing);
    });

    it("fails on updating non saved listing ", async () => {
      const repo = getRepository(postgresClient());

      await expect(() =>
        repo.updateListing(99999, updatedListing)
      ).rejects.toThrowError();
    });
  });
});
