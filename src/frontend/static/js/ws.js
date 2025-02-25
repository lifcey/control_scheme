let ws;

function startTask() {
    let input = document.getElementById("numberInput").value;
    if (input.trim() === "") {
        alert("Введите число!");
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
