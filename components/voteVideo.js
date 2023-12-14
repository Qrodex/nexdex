const multer = require('multer');
const path = require('path');
const fs = require('fs');
const url = require('url');
const { makeid, checkForEmptyString } = require('./idGenerator')
const sanitizeHtml = require('sanitize-html')

function voteVideo(app, __dirname) {
    app.get('/vote', (req, res) => {
        try {
            const uniqueVideoID = req.query.vidlink;
            let theVote = sanitizeHtml(req.query.vote);

            if (theVote == 'up') {
                theVote = 1
            } else if (theVote == 'down') {
                theVote = -1
            } else {
                return
            }

            const videoFilePath = path.join(__dirname, 'uploads', uniqueVideoID, 'metadata.json');
            fs.readFile((videoFilePath), (err, data) => {
                const videoData = JSON.parse(data);
                if (!videoData.votes) {
                    videoData.votes = 0
                }
                videoData.votes += theVote
                fs.writeFileSync(videoFilePath, JSON.stringify(videoData, null, 2));

                res.json({ message: 'Vote sent successfully!' });
            })
        } catch (error) {
            console.error(error)
            res.json({ message: 'Internal Server Error' });
        }
    });
}

module.exports = { voteVideo }