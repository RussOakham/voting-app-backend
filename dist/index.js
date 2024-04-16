"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const config_1 = __importDefault(require("config"));
const http_1 = require("http");
const logger_1 = require("./utils/logger");
const server_1 = __importDefault(require("./utils/server"));
const socket_1 = require("./utils/socket");
const { logger } = logger_1.pino;
const port = config_1.default.get('port');
const app = (0, server_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = socket_1.io.init(httpServer);
io.on('connection', (socket) => {
    logger.info(`[socket]: Socket connected ${socket.id}`);
    socket.on('disconnect', () => {
        logger.info(`[socket]: Socket disconnected ${socket.id}`);
    });
});
httpServer.listen(port, () => {
    logger.info(`[server]: Server is running at http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map