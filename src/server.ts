import * as dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./app";
import redis from "./redis";
dotenv.config();

const port = process.env.PORT || 3001;
if (!process.env.MONGO_URL) {
  throw new Error("MONGO_URL must be defined");
}
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Connected to MongoDB"));

redis.on('connect', () => {
  console.log('Redis is connecting...');
});

redis.on('ready', () => {
  console.log('Redis connection is ready to use.');
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redis.on('close', () => {
  console.log('Redis connection closed.');
});

redis.on('reconnecting', () => {
  console.log('Redis is reconnecting...');
});

redis.on('end', () => {
  console.log('Redis connection has ended.');
});

redis.on('warning', (warning) => {
  console.warn('Redis warning:', warning);
});


app.listen(port);
