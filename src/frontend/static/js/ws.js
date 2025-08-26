let ws;
const API_URL = window._env_.API_URL;
const WS_URL = window._env_.WS_URL
console.log("Backend API:", API_URL);

// ====== WebSocket ======
function startTask() {
    let input = document.getElementById("numberInput").value;
    if (input.trim() === "") {
        alert("Введите число!");
        return;
    }

    if (ws && ws.readyState !== WebSocket.CLOSED) {
        alert("У вас уже есть активный WebSocket!");
        return;
    }
    console.log("ws API:", WS_URL);
    ws = new WebSocket(WS_URL);
    ws.onopen = () => {
        console.log("WebSocket подключен");
        ws.send(JSON.stringify({ action: "start", number: Number(input) }));
    };

    ws.onmessage = (event) => {
        document.getElementById("result").innerText = "Результат: " + event.data;
    };

    ws.onerror = (error) => console.error("Ошибка WebSocket:", error);
    ws.onclose = () => console.log("WebSocket отключен");
}

function stopTask() {
    if (ws) {
        ws.send(JSON.stringify({ action: "stop" }));
        ws.close();
        document.getElementById("result").innerText = "Результат: - (Остановлено)";
    }
}

// ====== REST (старые endpoints) ======
function getStatus() {
    fetch(API_URL + "/getStatus")
        .then(response => response.json())
        .then(data => {
            alert("Ответ от сервера: " + data.status);
            console.log("Ответ от сервера:", data.status);
        })
        .catch(error => console.error("Ошибка:", error));
}

function getNumber() {
    fetch(API_URL + "/getNumber")
        .then(response => response.json())
        .then(data => {
            alert("Ответ от сервера: " + data.number);
            console.log("Ответ от сервера:", data.number);
        })
        .catch(error => console.error("Ошибка:", error));
}

// ====== CRUD для БД ======
async function createItem() {
    const name = document.getElementById('itemName').value;
    const res = await fetch(`${API_URL}/items/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    });
    const data = await res.json();
    document.getElementById('dbResult').innerText = JSON.stringify(data);
}

async function getItems() {
    const res = await fetch(`${API_URL}/items/`);
    const data = await res.json();
    document.getElementById('dbResult').innerText = JSON.stringify(data);
}

async function updateItem() {
    const id = document.getElementById('itemId').value;
    const name = document.getElementById('itemName').value;
    const res = await fetch(`${API_URL}/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    });
    const data = await res.json();
    document.getElementById('dbResult').innerText = JSON.stringify(data);
}

async function deleteItem() {
    const id = document.getElementById('itemId').value;
    const res = await fetch(`${API_URL}/items/${id}`, { method: 'DELETE' });
    const data = await res.json();
    document.getElementById('dbResult').innerText = JSON.stringify(data);
}