import http from "k6/http";
import { sleep, check } from "k6";

export const options = {
  stages: [
    { duration: "10s", target: 10 },  // ramp up
    { duration: "30s", target: 10 },  // steady
    { duration: "10s", target: 0 }    // ramp down
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],   // <1% errors
    http_req_duration: ["p(95)<1000"] // 95% < 1s
  }
};

export default function () {
  const payload = JSON.stringify({
    message: "load test message",
    clientMessageId: `${__VU}-${__ITER}`
  });

  const res = http.post(
    "http://localhost:3000/chat/message",
    payload,
    { headers: { "Content-Type": "application/json" } }
  );

  check(res, {
    "status is 200": (r) => r.status === 200,
    "sessionId returned": (r) => !!r.json("sessionId")
  });

  sleep(1);
}
