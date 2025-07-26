from sqlalchemy.orm import scoped_session

from listingapi.adapters.sql_alchemy_listing_repository import mappers, models
from listingapi.domain import entities, ports
from listingapi.domain.entities import exceptions


class SqlAlchemyListingRepository(ports.ListingRepository):
    def __init__(self, db_session: scoped_session):
        self.db_session = db_session

    def init(self) -> None:
        models.Base.metadata.create_all(self.db_session.get_bind())

    def create(self, listing: entities.ListingEntity) -> dict:
        listing_model = mappers.ListingMapper.from_entity_to_model(listing)
        self.db_session.add(listing_model)
        self.db_session.commit()
        data = mappers.ListingMapper.from_model_to_dict(listing_model)
        return data

    def get_all(self) -> list[dict]:
        listing_models = self.db_session.query(models.ListingModel).all()
        listings = [
            mappers.ListingMapper.from_model_to_dict(listing)
            for listing in listing_models
        ]
        return listings

    def update(self, listing_id: int, listing: entities.ListingEntity) -> dict:
        existing_listing = self.db_session.get(models.ListingModel, listing_id)
        if existing_listing is None:
            raise exceptions.ListingNotFound
        # update the existing record instead of deleting it in order to keep
        # the original creation date
        listing_model = mappers.ListingMapper.from_entity_to_model(listing)
        existing_listing.name = listing_model.name
        existing_listing.street_address = listing_model.street_address
        existing_listing.postal_code = listing_model.postal_code
        existing_listing.city = listing_model.city
        existing_listing.country = listing_model.country
        existing_listing.description = listing_model.description
        existing_listing.building_type = listing_model.building_type
        existing_listing.price = listing_model.price
        existing_listing.surface_area_m2 = listing_model.surface_area_m2
        existing_listing.rooms_count = listing_model.rooms_count
        existing_listing.bedrooms_count = listing_model.bedrooms_count
        existing_listing.contact_phone_number = listing_model.contact_phone_number
        self.db_session.commit()

        listing_dict = mappers.ListingMapper.from_model_to_dict(existing_listing)
        return listing_dict
