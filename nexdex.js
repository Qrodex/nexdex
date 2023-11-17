const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const url = require('url');

const app = express();
const port = 3000;

function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

// Set up multer for handling file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uniqueFolder = Date.now().toString() + makeid(10);
        const uploadPath = path.join(__dirname, 'uploads', uniqueFolder);

        // Create a unique directory for each video
        fs.mkdirSync(uploadPath, { recursive: true });

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Use the original file name for the uploaded video
        cb(null, file.originalname);
    },
});

const upload = multer({ storage: storage });

// Define a route to handle video uploads
app.post('/upload', upload.single('video'), (req, res) => {
    // Get the unique directory assigned to the uploaded video
    const uniqueFolder = req.file.destination.split(path.sep).pop();

    // Create metadata JSON
    const metadata = {
        title: req.body.title || 'Untitled',
        description: req.body.description || '',
        filename: req.file.originalname,
        path: `/uploads/${uniqueFolder}/${req.file.originalname}`,
    };

    // Save metadata to a JSON file
    const metadataPath = path.join(__dirname, 'uploads', uniqueFolder, 'metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    res.json({ message: 'Video uploaded successfully!' });
});

// Serve uploaded videos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//upload and home frontend
app.get('/', (req, res) => {
    fs.readFile((__dirname + "/index.html"), (err, data) => {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
    })
});

//fetch videos
app.get('/fetch', async (req, res) => {
    const fs = require('fs').promises;
    try {
        const files = await fs.readdir("uploads");
        const total = [];

        // Create an array of promises for each file read operation
        const promises = files.map(async (id) => {
            const data = await fs.readFile(__dirname + "/uploads/" + id + "/metadata.json");
            const parsedData = JSON.parse(data);
            parsedData.id = id;
            total.push(parsedData);
        });

        // Wait for all promises to resolve
        await Promise.all(promises);

        // Respond to the request or do further processing
        res.json({ success: true, data: total });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

//videodata
app.get('/vmetadata', (req, res) => {
    const queryData = url.parse(req.url, true).query;
    const id = queryData.v;

    fs.readFile((__dirname + "/uploads/" + id + "/metadata.json"), (err, data) => {
        res.end(data);
    })
});

//embed frontend
app.get('/embed', (req, res) => {
    const queryData = url.parse(req.url, true).query;
    const id = queryData.v;

    fs.readFile((__dirname + "/uploads/" + id + "/metadata.json"), (err, data) => {
        let parseddata = JSON.parse(data)
        fs.readFile(__dirname + parseddata.path, function (err, data) {
            res.writeHead(200, { 'Content-Type': 'video/mp4' });
            res.end(data);
        })
    })
});

app.get('/watch', (req, res) => {
    fs.readFile((__dirname + "/watch.html"), (err, data) => {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
    })
});

app.get('/submit', (req, res) => {
    fs.readFile((__dirname + "/submit.html"), (err, data) => {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
    })
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
