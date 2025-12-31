import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import cors from "cors"; 
import bodyParser from "body-parser";
import { chatRouter } from "./api/routes/chat";
import { env } from "./infra/env";

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",                 
    "https://ai-chat-1-6iza.onrender.com" 
  ],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(bodyParser.json());

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.use("/chat", chatRouter);

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});