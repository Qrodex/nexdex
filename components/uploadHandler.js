const multer = require('multer');
const path = require('path');
const fs = require('fs');
const url = require('url');
const {makeid} = require('./idGenerator')

function handleUpload(app, __dirname) {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            const uniqueFolder = Date.now().toString() + makeid(16);
            const uploadPath = path.join(__dirname, 'uploads', uniqueFolder);
            fs.mkdirSync(uploadPath, { recursive: true });
            fs.mkdirSync(uploadPath + '/comment', { recursive: true });

            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            cb(null, file.originalname);
        },
    });
    const upload = multer({ storage: storage });

    app.post('/upload', upload.single('video'), (req, res) => {
        const uniqueFolder = req.file.destination.split(path.sep).pop();

        const metadata = {
            title: req.body.title || 'Untitled',
            description: req.body.description || '',
            filename: req.file.originalname,
            path: `/uploads/${uniqueFolder}/${req.file.originalname}`,
        };

        const metadataPath = path.join(__dirname, 'uploads', uniqueFolder, 'metadata.json');
        fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
        res.json({ message: 'Video uploaded successfully!' });
    });
}

module.exports = { handleUpload };