const multer = require('multer');
const path = require('path');
const fs = require('fs');
const url = require('url');
const { makeid } = require('./idGenerator')
const sanitizeHtml = require('sanitize-html')

function commentHandler(app, __dirname) {
    app.get('/comment', (req, res) => {
        try {
            const uniqueVideoID = req.query.vidlink;
            const theComment = sanitizeHtml(req.query.text);
            const theWriter = sanitizeHtml(req.query.username);
            const uniqueCommentID = makeid(16)

            const metadata = {
                user: theWriter,
                text: theComment,
                replies: []
            };

            const metadataPath = path.join(__dirname, 'uploads', uniqueVideoID, 'comment', `${uniqueCommentID}.json`);
            fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

            res.json({ message: 'Comment sent successfully!' });
        } catch (error) {
            console.error(error)
            res.json({ message: 'Internal Server Error' });
        }
    });

    app.get('/reply', (req, res) => {
        try {
            const uniqueVideoID = req.query.vidlink;
            const uniqueCommentID = req.query.commentid;
            const theComment = sanitizeHtml(req.query.text);
            const theWriter = sanitizeHtml(req.query.username);

            const metadata = {
                user: theWriter,
                text: theComment
            };

            const commentFilePath = path.join(__dirname, 'uploads', uniqueVideoID, 'comment', `${uniqueCommentID}`);
            fs.readFile((commentFilePath), (err, data) => {
                const commentData = JSON.parse(data);
                if (!commentData.replies) {
                    commentData.replies = []
                }
                commentData.replies.push(metadata);
                fs.writeFileSync(commentFilePath, JSON.stringify(commentData, null, 2));

                res.json({ message: 'Reply sent successfully!' });
            })
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