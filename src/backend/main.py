from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import asyncio

app = FastAPI()

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
