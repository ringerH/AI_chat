import dotenv from 'dotenv';
dotenv.config();

import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import { chatRouter } from "./api/routes/chat";
import { env } from "./infra/env";


const app = express();
app.use(bodyParser.json());

app.use("/chat", chatRouter);

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});
