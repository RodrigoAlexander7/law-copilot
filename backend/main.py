from fastapi import FastAPI
from pydantic import BaseModel


app = FastAPI()

class Item(BaseModel):
    name: str
    description: str

@app.get("/")
def read_root():
    return {"message": "Hello FastAPI + LangChain"}

@app.post("/items/")
def create_item(item: Item):
    return {"item": item}
