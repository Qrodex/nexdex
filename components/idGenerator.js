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

function checkForEmptyString(string) {
    if (!string.replace(/\s/g, '').length) {
        return true;
    } else {
        return false;
    }
}

module.exports = { makeid, checkForEmptyString };