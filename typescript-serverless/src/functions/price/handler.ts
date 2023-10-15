import { functionHandler } from "@/libs/function";
import { Price } from "@/types.generated";
import { PriceRepo } from "@/repositories/prices";

export const getListingPrices = functionHandler<Price[]>(
  async (event, context) => {
    const listingId = parseInt(event.pathParameters.id);

    const prices = await new PriceRepo(context.postgres).getPricesFor(
      listingId
    );

    return { statusCode: 200, response: prices };
  }
);
