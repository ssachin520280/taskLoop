import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { agentTaskSchema } from "@taskloop/shared";
import { evaluateTask } from "./evaluator";
import { executeTask } from "./orchestrator";

const port = Number(process.env.AGENT_PORT ?? 8787);

async function readJson(request: IncomingMessage) {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function sendJson(response: ServerResponse, statusCode: number, body: unknown) {
  response.writeHead(statusCode, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
}

const server = createServer(async (request, response) => {
  if (request.method === "GET" && request.url === "/health") {
    sendJson(response, 200, { ok: true, service: "taskloop-agent" });
    return;
  }

  if (request.method === "POST" && request.url === "/evaluate") {
    try {
      const task = agentTaskSchema.parse(await readJson(request));
      const evaluation = evaluateTask(task);
      const execution = await executeTask(task, evaluation);

      sendJson(response, 200, { evaluation, execution });
    } catch (error) {
      sendJson(response, 400, {
        error: error instanceof Error ? error.message : "Invalid request"
      });
    }
    return;
  }

  sendJson(response, 404, { error: "Not found" });
});

server.listen(port, () => {
  console.log(`TaskLoop agent listening on http://localhost:${port}`);
});
