const express = require('express');
const {handleUpload} = require('./components/uploadHandler')
const {commentHandler} = require('./components/commentHandler')
const {frontEndHandler} = require('./components/frontEndHandler')

const app = express();
const port = 3000;

handleUpload(app, __dirname)
commentHandler(app, __dirname)
frontEndHandler(app, __dirname)

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
