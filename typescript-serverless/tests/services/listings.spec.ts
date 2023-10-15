import { describe, expect, it } from "vitest";
import { suiteBodyWithDb } from "../libs/testcontainers-postgres";
import { ListingWrite } from "@/types.generated";
import { ListingService } from "@/services/service";
import { PriceRepo } from "@/repositories/prices";

const listingWrite: Readonly<ListingWrite> = {
  bedrooms_count: 0,
  building_type: "APARTMENT",
  contact_phone_number: "",
  description: "",
  latest_price_eur: 100,
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

const updatedListingWithPrice: Readonly<ListingWrite> = {
  ...listingWrite,
  latest_price_eur: 333,
};

describe("listing service", () => {
  suiteBodyWithDb((postgresClient) => {
    it("saves listing with returning correct fields", async () => {
      const listingService = new ListingService(postgresClient());

      const savedListing = await listingService.save(listingWrite);

      expect(savedListing).containSubset(listingWrite);
    });

    it("updates listing with returning correct fields", async () => {
      const listingService = new ListingService(postgresClient());
      const savedListing = await listingService.save(listingWrite);

      const listingUpdateResult = await listingService.update(
        savedListing.id,
        updatedListing
      );

      expect(listingUpdateResult).containSubset(updatedListing);
    });

    // TODO: currently checking 2 layers (service and repo), refactor to only testing and using only one layer
    it("updated price saved to price repo", async () => {
      const listingService = new ListingService(postgresClient());
      const savedListing = await listingService.save(listingWrite);
      await listingService.update(savedListing.id, updatedListingWithPrice);
      const priceRepo = new PriceRepo(postgresClient());

      const prices = await priceRepo.getPricesFor(savedListing.id);

      expect(prices.map((prices) => prices.price_eur)).toEqual([
        listingWrite.latest_price_eur,
        updatedListingWithPrice.latest_price_eur,
      ]);
    });

    it("updated listing with same price doesn't produce double price record in PriceRepo", async () => {
      const listingService = new ListingService(postgresClient());
      const savedListing = await listingService.save(listingWrite);
      await listingService.update(savedListing.id, updatedListing);
      const priceRepo = new PriceRepo(postgresClient());

      const prices = await priceRepo.getPricesFor(savedListing.id);

      expect(prices.map((prices) => prices.price_eur)).toEqual([
        listingWrite.latest_price_eur,
      ]);
    });
  });
});
