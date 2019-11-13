const Hashids = require('hashids');

const salt = 'ThaKnowledgePlat4rm';
const hashLength = 7;
const characterSet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
const hashids = new Hashids(salt, hashLength, characterSet);

const encode = id => hashids.encode(id);
const decode = id => hashids.decode(id)[0];

module.exports = { encode, decode };