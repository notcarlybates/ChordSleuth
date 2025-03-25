from enum import Enum

from fastapi import fastapi
from pydantic import BaseModel

app = FastAPI()

class Category(Enum):
    TOOLS  = "tools"
    CONSUMABLES = "consumables"

class Item(BaseModel):
    name: str
    price: float
    count: int
    id: int
    category: Category

# FING Algorithm Here


@app.get('/')
def index() -> dict[int, dict[int, dict['fret': fret] dict['note': note]]]:
    return {"items": items}