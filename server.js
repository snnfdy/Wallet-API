const http = require ("http");
app = require("./app")
const port=3000;
const server = http.createServer(app);

server.listen(port)