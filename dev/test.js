const Blockchain = require('./blockchain');
const bitcoin = new Blockchain();

const bc1 =
{
    "chain": [
    {
    "index": 1,
    "timestamp": 1626817271226,
    "transactions": [],
    "nonce": 100,
    "hash": "0",
    "previousBlockHash": "0"
    },
    {
    "index": 2,
    "timestamp": 1626817294678,
    "transactions": [],
    "nonce": 18140,
    "hash": "0000b9135b054d1131392c9eb9d03b0111d4b516824a03c35639e12858912100",
    "previousBlockHash": "0"
    },
    {
    "index": 3,
    "timestamp": 1626817299042,
    "transactions": [
    {
    "amount": 12.5,
    "sender": "00",
    "recipient": "2546696faf5c40be9e2a630610b5f906",
    "transactionId": "0efda1b7d8ca4e7caa697e21bb4c2b7e"
    }
    ],
    "nonce": 11933,
    "hash": "00003d11dfa1da66ff5ce7691e8af4cedfd6da6aa34946c14343d580d452ea8c",
    "previousBlockHash": "0000b9135b054d1131392c9eb9d03b0111d4b516824a03c35639e12858912100"
    }
    ],
    "pendingTransactions": [
    {
    "amount": 12.5,
    "sender": "00",
    "recipient": "2546696faf5c40be9e2a630610b5f906",
    "transactionId": "929e4322101d4fb4b03919f946f6f4ad"
    }
    ],
    "currentNodeUrl": "http://localhost:3001",
    "networkNodes": []
    };
        

console.log('VALID:', bitcoin.chainIsValid(bc1.chain));