"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var http_1 = require("http");
var socket_io_1 = require("socket.io");
var vite_1 = require("vite");
var path_1 = require("path");
function startServer() {
    return __awaiter(this, void 0, void 0, function () {
        var app, httpServer, io, PORT, leaderboard, vite, distPath_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    app = (0, express_1.default)();
                    httpServer = (0, http_1.createServer)(app);
                    io = new socket_io_1.Server(httpServer, {
                        cors: {
                            origin: "*",
                        },
                    });
                    PORT = 3000;
                    leaderboard = [];
                    io.on("connection", function (socket) {
                        console.log("A user connected:", socket.id);
                        socket.on("join_game", function (_a) {
                            var nickname = _a.nickname;
                            socket.data.nickname = nickname;
                            socket.emit("leaderboard_update", leaderboard);
                        });
                        socket.on("submit_score", function (_a) {
                            var name = _a.name, score = _a.score;
                            leaderboard.push({ name: name, score: score });
                            leaderboard.sort(function (a, b) { return b.score - a.score; });
                            leaderboard = leaderboard.slice(0, 10); // Top 10
                            io.emit("leaderboard_update", leaderboard);
                        });
                        // Multiplayer PK logic
                        socket.on("find_match", function () {
                            var rooms = io.sockets.adapter.rooms;
                            var joined = false;
                            for (var _i = 0, rooms_1 = rooms; _i < rooms_1.length; _i++) {
                                var _a = rooms_1[_i], roomName = _a[0], room = _a[1];
                                if (roomName.startsWith("pk_") && room.size === 1) {
                                    socket.join(roomName);
                                    io.to(roomName).emit("match_found", { room: roomName });
                                    joined = true;
                                    break;
                                }
                            }
                            if (!joined) {
                                var newRoom = "pk_".concat(socket.id);
                                socket.join(newRoom);
                                socket.emit("waiting_for_opponent");
                            }
                        });
                        socket.on("game_state_sync", function (_a) {
                            var room = _a.room, state = _a.state;
                            socket.to(room).emit("opponent_state", state);
                        });
                        socket.on("game_over", function (_a) {
                            var room = _a.room;
                            socket.to(room).emit("opponent_game_over");
                        });
                        socket.on("disconnect", function () {
                            console.log("User disconnected:", socket.id);
                        });
                    });
                    if (!(process.env.NODE_ENV !== "production")) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, vite_1.createServer)({
                            server: { middlewareMode: true },
                            appType: "spa",
                        })];
                case 1:
                    vite = _a.sent();
                    app.use(vite.middlewares);
                    return [3 /*break*/, 3];
                case 2:
                    distPath_1 = path_1.default.join(process.cwd(), "dist");
                    app.use(express_1.default.static(distPath_1));
                    app.get("*", function (req, res) {
                        res.sendFile(path_1.default.join(distPath_1, "index.html"));
                    });
                    _a.label = 3;
                case 3:
                    httpServer.listen(PORT, "0.0.0.0", function () {
                        console.log("Server running on http://localhost:".concat(PORT));
                    });
                    return [2 /*return*/];
            }
        });
    });
}
startServer();
