const intervalMs = Number(process.env.WORKER_HEARTBEAT_MS ?? 15000);

console.log("@metascope/worker bootstrap started");

setInterval(() => {
  console.log("@metascope/worker heartbeat");
}, intervalMs);
