type LogLevel = "info" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  time: string;
  stack?: string;
}

function saveLog(entry: LogEntry) {
  const existingLogs = JSON.parse(localStorage.getItem("app_logs") || "[]");
  existingLogs.push(entry);
  localStorage.setItem("app_logs", JSON.stringify(existingLogs));
}

async function sendToBackend(entry: LogEntry) {
  await fetch("http://localhost:5000/api/log", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(entry),
  });
}

export const logger = {
  info: (message: string) => {
    const entry: LogEntry = {
      level: "info",
      message,
      time: new Date().toISOString(),
    };

    console.log(entry);

    saveLog(entry);
    sendToBackend(entry);   // ⭐ send to backend
  },

  error: (error: unknown) => {
    const entry: LogEntry = {
      level: "error",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      time: new Date().toISOString(),
    };

    console.error(entry);

    saveLog(entry);
    sendToBackend(entry);   // ⭐ send to backend
  },
};