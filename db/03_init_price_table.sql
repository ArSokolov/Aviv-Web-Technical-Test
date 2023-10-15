CREATE TABLE IF NOT EXISTS public.price
(
    id           serial primary key,
    listing_id   int              not null,
    price        double precision not null,
    created_date timestamp not null
);

CREATE INDEX price_listing_id_idx ON price (listing_id);

-- TODO: foreign key for listing id
