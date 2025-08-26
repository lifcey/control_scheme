from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

import os
import asyncio

#базы данных
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from . import models, schemas, crud, database

app = FastAPI()

# Добавление разрешённых источников
origins = os.getenv("ALLOW_ORIGINS", "").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#region Изначальное приложение(база)
class IncrementTask:
    def __init__(self):
        self.number = None
        self.running = False

    async def start(self, websocket: WebSocket, number: int):
        self.number = number
        self.running = True
        await websocket.send_text(str(self.number))

        while self.running:
            await asyncio.sleep(1)
            self.number += 2
            await websocket.send_text(str(self.number))

    def stop(self):
        self.running = False

task = IncrementTask()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            action = data.get("action")

            if action == "start":
                number = data.get("number", 0)
                await task.start(websocket, number)
            elif action == "stop":
                task.stop()
                break
    except WebSocketDisconnect:
        task.stop()

@app.get("/getStatus")
async def get_status():
    return {"status": task.running}

@app.get("/getNumber")
async def getNumber():
    return {"number": task.number}

@app.get("/health")
def health():
    return {"status": "ok"}
#endregion

#region БАЗА ДАННЫХ
models.Base.metadata.create_all(bind=database.engine)

# Dependency
get_db = database.get_db

@app.post("/items/", response_model=schemas.Item)
def create_item(item: schemas.ItemCreate, db: Session = Depends(get_db)):
    return crud.create_item(db=db, item=item)

@app.get("/items/", response_model=list[schemas.Item])
def read_items(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return crud.get_items(db=db, skip=skip, limit=limit)

@app.get("/items/{item_id}", response_model=schemas.Item)
def read_item(item_id: int, db: Session = Depends(get_db)):
    db_item = crud.get_item(db, item_id)
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return db_item

@app.put("/items/{item_id}", response_model=schemas.Item)
def update_item(item_id: int, item: schemas.ItemCreate, db: Session = Depends(get_db)):
    db_item = crud.update_item(db, item_id, item)
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return db_item

@app.delete("/items/{item_id}")
def delete_item(item_id: int, db: Session = Depends(get_db)):
    db_item = crud.delete_item(db, item_id)
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"ok": True}
#endregion