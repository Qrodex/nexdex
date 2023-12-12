const multer = require('multer');
const path = require('path');
const fs = require('fs');
const url = require('url');
const {makeid} = require('./idGenerator')

function commentHandler(app, __dirname) {
    app.get('/comment', (req, res) => {
        try {
            const uniqueVideoID = req.query.vidlink;
            const theComment = req.query.text;
            const theWriter = req.query.username;
            const uniqueCommentID = makeid(16)

            const metadata = {
                user: theWriter,
                text: theComment,
            };

            const metadataPath = path.join(__dirname, 'uploads', uniqueVideoID, 'comment', `${uniqueCommentID}.json`);
            fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

            res.json({ message: 'Comment sent successfully!' });
        } catch (error) {
            console.error(error)
            res.json({ message: 'Internal Server Error' });
        }
    });

    app.get('/comments', async (req, res) => {
        const fs = require('fs').promises;
        const regularfs = require('fs');
        const uniqueVideoID = req.query.vidlink;
        try {
            const combinedPath = await path.join(__dirname, 'uploads', uniqueVideoID, 'comment')
            if (!regularfs.existsSync(combinedPath)) {
                regularfs.mkdirSync(combinedPath, { recursive: true });
            }

            const files = await fs.readdir(combinedPath);
            const total = [];
            const promises = files.map(async (id) => {
                const data = await fs.readFile(combinedPath + `/${id}`);
                const parsedData = JSON.parse(data);
                parsedData.id = id;
                total.push(parsedData);
            });

            await Promise.all(promises);
            res.json({ success: true, data: total });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, error: 'Internal Server Error' });
        }
    });
}

module.exports = { commentHandler }