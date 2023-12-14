const multer = require('multer');
const path = require('path');
const fs = require('fs');
const url = require('url');
const { makeid, checkForEmptyString } = require('./idGenerator')

function frontEndHandler(app, __dirname) {
    app.get('/', (req, res) => {
        fs.readFile((__dirname + "/pages/index.html"), (err, data) => {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        })
    });

    app.get('/fetch', async (req, res) => {
        const fs = require('fs').promises;
        try {
            const files = await fs.readdir("uploads");
            const total = [];
            const promises = files.map(async (id) => {
                try {
                    const data = await fs.readFile(__dirname + "/uploads/" + id + "/metadata.json");
                    const parsedData = JSON.parse(data);
                    parsedData.id = id;
                    total.push(parsedData);
                } catch (error) {
                    console.error('Corrupted video! Deleting...')
                    fs.rm(__dirname + "/uploads/" + id, { recursive: true, force: true })
                }
            });

            await Promise.all(promises);
            res.json({ success: true, data: total });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, error: 'Internal Server Error' });
        }
    });

    app.get('/vmetadata', (req, res) => {
        const queryData = url.parse(req.url, true).query;
        const id = queryData.v;

        fs.readFile((__dirname + "/uploads/" + id + "/metadata.json"), (err, data) => {
            res.end(data);
        })
    });

    app.get('/embed', (req, res) => {
        const queryData = url.parse(req.url, true).query;
        const id = queryData.v;

        fs.readFile(__dirname + "/uploads/" + id + "/metadata.json", (err, data) => {
            if (err) {
                console.error(err);
                return res.status(500).end('Internal Server Error');
            }
            try {
                const metadata = JSON.parse(data);
                const filePath = __dirname + metadata.path;
                const range = req.headers.range;

                fs.stat(filePath, (err, stats) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).end('Internal Server Error');
                    }

                    try {
                        const fileSize = stats.size;
                        const CHUNK_SIZE = 10 ** 6;
                        const start = Number(range.replace(/\D/g, ''));
                        const end = Math.min(start + CHUNK_SIZE, fileSize - 1);
                        const contentLength = end - start + 1;
                        const headers = {
                            'Content-Type': 'video/mp4',
                            'Content-Length': contentLength,
                            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                            'Accept-Ranges': 'bytes',
                        };

                        res.writeHead(206, headers);
                        const fileStream = fs.createReadStream(filePath, { start, end });
                        fileStream.pipe(res);
                    } catch (error) {
                        console.error(error);
                        return res.status(500).end('Internal Server Error');
                    }
                });
            } catch (error) {
                console.error(error);
                return res.status(500).end('Internal Server Error');
            }
        });
    });

    app.get('/watch', (req, res) => {
        fs.readFile((__dirname + "/pages/watch.html"), (err, data) => {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        })
    });

    app.get('/submit', (req, res) => {
        fs.readFile((__dirname + "/pages/submit.html"), (err, data) => {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        })
    });

    app.get('/css', (req, res) => {
        fs.readFile((__dirname + "/pages/style/style.css"), (err, data) => {
            res.writeHead(200, { 'Content-Type': 'text/css' });
            res.end(data);
        })
    });
}

module.exports = { frontEndHandler }