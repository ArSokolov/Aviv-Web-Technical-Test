import re
from datetime import datetime


class Listing:
    room_regex = re.compile(r"(?P<type>Appartement|Studio)( (?P<rooms>\d+) pièces)?")
    area_regex = re.compile(r"(?P<area>\d+) m²")

    def __init__(
        self,
        id: int,
        place_id: int,
        room_count: int,
        area: int,
        price: int,
        seen_at: datetime,
    ):
        self.id = id
        self.place_id = place_id
        self.room_count = room_count
        self.area = area
        self.price = price
        self.seen_at = seen_at

    @staticmethod
    def from_data(data: dict, place_id: int, seen_at: datetime) -> "Listing":
        """
        Instantiate Listing Entity from Dictionary data.

        Args:
            - data -- dict that contains all returned API data
            - place_id -- int that refers to the place of the listing
            - seen_at -- datetime related to the imported listing

        Returns:
            - Listing - Built Listing entities after data extraction
        """
        title = (
            data["title"]
            .replace("\u00a0", " ")
            .replace("\u00e8", "è")
            .replace("\u00b2", "²")
        )
        listing = Listing(
            int(data["listing_id"]),
            place_id,
            Listing.__extract_rooms_from_string(title),
            Listing.__extract_area_from_string(title),
            Listing.__extract_price_from_string(data["price"]),
            seen_at,
        )

        return listing

    @staticmethod
    def __extract_rooms_from_string(title: str) -> int:
        """
        Parse title string to retrieve the number of rooms.

        Set default value to 0 if the title does not match the regex
        If the title contains 'Studio', that means 1 room
        If the title contains 'Appartement', we extract the number of rooms just after

        Examples :
            - Appartement 2 pièces - 29 m² -> 2
            - Studio - 6 m² -> 1
            - 12 m2 -> 0
            - Appartement - 29m2 -> 0

        Args:
            - title -- string that contains rooms data

        Returns:
            - rooms - The extracted rooms value from title
        """
        nb_rooms = 0

        matches = Listing.room_regex.search(title)
        if matches:
            if matches.group("type") == "Studio":
                nb_rooms = 1
            elif matches.group("rooms") is not None:
                nb_rooms = int(matches.group("rooms"))
        return nb_rooms

    @staticmethod
    def __extract_area_from_string(title: str) -> int:
        """
        Parse title string to retrieve area.

        Set default value to 0 if the title does not match the regex

        Examples :
            - Appartement 2 pièces - 29 m² -> 29
            - Studio - 6 m² -> 6
            - Appartement 3 pièces -> 0

        Args:
            - title -- string that contains area data

        Returns:
            - area - The extracted area value from title
        """
        area = 0

        matches = Listing.area_regex.search(title)

        if matches:
            area = int(matches.group("area"))

        return area

    @staticmethod
    def __extract_price_from_string(price_str: str) -> int:
        """
        Parse price to extract the integer value.

        Examples :
            - 1 670 000 € -> 1670000
            - Wrong value -> 0

        Args:
            - price_str -- un-formatted string that contains price

        Returns:
            - price - The formatted integer price
        """
        try:
            price = int("".join([s for s in price_str if s.isdigit()]))
        except Exception:
            price = 0

        return price
