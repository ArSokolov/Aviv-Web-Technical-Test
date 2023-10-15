import PostgresClient from "serverless-postgres";
import { Price, PriceWrite } from "@/types.generated";
import { extractVariables } from "@/libs/postgres";
import { EntityNotFound } from "@/libs/errors";

type PriceTableRow = {
  id?: number;
  listing_id: number;
  price: number;
  created_date: Date;
};

function tableRowToPrice(row: PriceTableRow): Price {
  return {
    price_eur: row.price,
    created_date: row.created_date.toISOString(),
  };
}

function priceToTableRow(
  listingId: number,
  priceWrite: PriceWrite,
  createdDate: Date
): PriceTableRow {
  return {
    listing_id: listingId,
    price: priceWrite.price_eur,
    created_date: createdDate,
  };
}

export class PriceRepo {
  constructor(private postgres: PostgresClient) {}

  async getPricesFor(listingId: number) {
    const queryString = `SELECT *
                         FROM price
                         WHERE listing_id = $1`;
    const queryValues = [listingId];

    const result = await this.postgres.query(queryString, queryValues);
    const prices: PriceTableRow[] = result.rows;

    if (!prices)
      throw new EntityNotFound(
        `Could not find prices for listingId=${listingId}`
      );

    return prices.map(tableRowToPrice);
  }

  async insertPriceFor(listingId: number, priceWrite: PriceWrite) {
    const tableRow = priceToTableRow(listingId, priceWrite, new Date());

    const {
      columns,
      variables,
      values: queryValues,
    } = extractVariables(tableRow);

    const queryString = `INSERT INTO price (${columns.join(",")})
                         VALUES (${variables})
                         RETURNING *    `;

    const result = await this.postgres.query(queryString, queryValues);

    return tableRowToPrice(result.rows[0]);
  }
}
