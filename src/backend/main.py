from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio

app = FastAPI()

# Добавление разрешённых источников
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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


class NumberInput(BaseModel):
    number: int

@app.put("/updateNumber")
async def updateNumber(data: NumberInput):
    task.number = data.number
    return {"message": "Число обновлено", "number": task.number}