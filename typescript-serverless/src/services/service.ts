import { Listing, ListingWrite } from "@/types.generated";
import PostgresClient from "serverless-postgres";
import { getRepository } from "@/repositories/listings";
import { PriceRepo } from "@/repositories/prices";
import { TransactionSupport } from "@/libs/postgres";

export class ListingService extends TransactionSupport {
  constructor(private postgres: PostgresClient) {
    super();
  }

  getPostgresClient(): PostgresClient {
    return this.postgres;
  }

  async save(listing: ListingWrite): Promise<Listing> {
    const savedListing = await this.transaction(async () => {
      const savedListing = await getRepository(this.postgres).insertListing(
        listing
      );
      await new PriceRepo(this.postgres).insertPriceFor(savedListing.id, {
        price_eur: listing.latest_price_eur,
      });
      return savedListing;
    });

    return savedListing;
  }

  async update(
    listingId: number,
    listingWrite: ListingWrite
  ): Promise<Listing> {
    const savedListing = await this.transaction(async () => {
      const [prevListing, savedListing] = await getRepository(
        this.postgres
      ).updateListing(listingId, listingWrite);

      if (prevListing.latest_price_eur != savedListing.latest_price_eur)
        await new PriceRepo(this.postgres).insertPriceFor(savedListing.id, {
          price_eur: listingWrite.latest_price_eur,
        });
      return savedListing;
    });

    return savedListing;
  }
}
