const redis = require("redis");

const client = redis.createClient({
  socket: {
    port: 6379,
    host: "127.0.0.1",
  },
});

client.connect();

client.on("connect", () => {
  console.log("client connected to redis");
});

client.on("error", (error) => {
  console.log("error ", error.message);
});

client.on("ready", () => {
  console.log("client connected to redis and ready to use");
});

client.on("end", () => {
  console.log("client disconnected from redis");
});

process.on("SIGINT", () => {
  console.log("redis quitting");
  client.quit();
});

module.exports = client;
