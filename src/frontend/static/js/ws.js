let ws;

function startTask() {
    let input = document.getElementById("numberInput").value;
    if (input.trim() === "") {
        alert("Введите число!");
        return;
    }

    // Alert при уже активном WebSocket
    if (ws && ws.readyState !== WebSocket.CLOSED) {
        alert("У вас уже есть активный WebSocket!");
        return;
    }

    ws = new WebSocket("ws://127.0.0.1:8881/ws");

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
function getStatus() {
    fetch("http://127.0.0.1:8881/getStatus")
        .then(response => response.json())
        .then(data => {
            alert("Ответ от сервера: " + data.status);
            console.log("Ответ от сервера:", data.status);
        })
        .catch(error => console.error("Ошибка:", error));
}

function getNumber() {
    fetch("http://127.0.0.1:8881/getNumber")
        .then(response => response.json())
        .then(data => {
            alert("Ответ от сервера: " + data.number);
            console.log("Ответ от сервера:", data.number);
        })
        .catch(error => console.error("Ошибка:", error));
}

function updateNumber(){
    if(ws){
        const number = document.getElementById("numberInput").value;
        fetch("http://127.0.0.1:8881/updateNumber", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ number: Number(number) })
        })
        .then(response => response.json())
        .then(data => {
            alert("Ответ от сервера: " + data.message);
            console.log("Ответ от сервера:", data.message);
        })
        .catch(error => console.error("Ошибка:", error));
    }
}
