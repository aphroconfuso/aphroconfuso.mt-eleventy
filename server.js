"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });

const express_1 = __importDefault(require("express"));
const port = 3000;

const asyncHandler = (func) => (req, res, next) => {
    Promise.resolve(func(req, res, next))
        .catch(next);
};


const cmd = require('node-cmd');

const pingDatabase = () => "ah yeah!";

const Eleventy = require("@11ty/eleventy");

const rebuild = async () => {
	let inst = new Eleventy();
	await inst.init();
	await inst.write();
};


const app = express_1.default();

app.get('/', (req, res) => {
    res.send("HELLO WORLD");
});

app.get('/stats', (req, res) => {
    if (req.query.googleDocsId)
        return res.status(200).send(googleToStatistics(req.query.googleDocsId));
    res.status(403).send('Bad request');
});

app.get('/pings/database', asyncHandler(async (req, res) => {
    const response = await Promise.all([
        pingDatabase()
    ]);
    return res.send(response);
}));

app.get('/rebuild', asyncHandler(async (req, res) => {
    const response = await Promise.all([
        rebuild()
    ]);
    return res.send(response);
}));



app.use(function (req, res, next) {
    res.status(404).send('404: File Not Found');
});
app.listen(port, () => {
    console.info(`Server started at http://localhost:3000`);
});
