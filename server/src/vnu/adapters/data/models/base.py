from dataclasses import dataclass
from decimal import Decimal

from sqlalchemy.orm.decl_api import DeclarativeBase


class Base(DeclarativeBase):
    ...


@dataclass
class Point:
    latitude: Decimal
    longitude: Decimal
    
    def map_to_column(self) -> str:
        return f"POINT({self.longitude} {self.latitude})"
    
    @classmethod
    def from_model_row(cls, row: str) -> "Point":
        # if not row.startswith("POINT(") or not row.endswith(")"):
        #     raise ValueError(f"Invalid POINT format: {row}")
        coords = row[len("POINT("):-1]
        longitude, latitude = coords.strip().split(" ")
        return cls(Decimal(latitude), Decimal(longitude))
