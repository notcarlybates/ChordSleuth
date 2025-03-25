from enum import Enum
from guitar import Guitar
from chordInterpreter import Chord

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

items = []

@app.get('/')
def root():
    return {"Hello": "World"}


@app.post("/items")
def create_items(item: str):
    items.append(item)
    return items