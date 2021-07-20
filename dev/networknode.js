// 


const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const uuid = require('uuid').v4;
const port = process.argv[2];
const rp = require('request-promise');
const requestPromise = require('request-promise');
const nodeAddress = uuid().split('-').join('');
const bitcoin = new Blockchain();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// get entire blockchain
app.get('/blockchain', function (req, res) {
  res.send(bitcoin);
});
// create a new transaction
app.post('/transaction', function (req, res) {
  const newTransaction = req.body;
  const blockIndex = bitcoin.addTransactionToPendingTransactions(newTransaction);
  res.json({ note: `Transaction will be added in block ${blockIndex}.` });
});
// broadcast transaction
app.post('/transaction/broadcast', function (req, res) {
  const newTransaction = bitcoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);
  bitcoin.addTransactionToPendingTransactions(newTransaction);
  const requestPromises = [];
  bitcoin.networkNodes.forEach(networkNodeUrl => {
    const requestOptions = {
      uri: networkNodeUrl + '/transaction',
      method: 'POST',
      body: newTransaction,
      json: true
    };
    requestPromises.push(rp(requestOptions));
  });
  Promise.all(requestPromises)
    .then(data => {
      res.json({ note: 'Transaction created and broadcast successfully.' });
    });
});
// mine a block
app.get('/mine', function (req, res) {
  const lastBlock = bitcoin.getLastBlock();
  const previousBlockHash = lastBlock['hash'];
  const currentBlockData = {
    transactions: bitcoin.pendingTransactions,
    index: lastBlock['index'] + 1
  };
  const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);
  const blockHash = bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce);
  const newBlock = bitcoin.createNewBlock(nonce, previousBlockHash, blockHash);
  const requestPromises = [];
  bitcoin.networkNodes.forEach(networkNodeUrl => {
    const requestOptions = {
      uri: networkNodeUrl + '/receive-new-block',
      method: 'POST',
      body: { newBlock: newBlock },
      json: true
    };
    requestPromises.push(rp(requestOptions));
  });
  Promise.all(requestPromises)
    .then(data => {
      const requestOptions = {
        uri: bitcoin.currentNodeUrl + '/transaction/broadcast',
        method: 'POST',
        body: {
          amount: 12.5,
          sender: "00",
          recipient: nodeAddress
        },
        json: true
      };
      return rp(requestOptions);
    })
    .then(data => {
      res.json({
        note: "New block mined & broadcast successfully",
        block: newBlock
      });
    });
});
// receive new block
app.post('/receive-new-block', function (req, res) {
  const newBlock = req.body.newBlock;
  const lastBlock = bitcoin.getLastBlock();
  const correctHash = lastBlock.hash === newBlock.previousBlockHash;
  const correctIndex = lastBlock['index'] + 1 === newBlock['index'];
  if (correctHash && correctIndex) {
    bitcoin.chain.push(newBlock);
    bitcoin.pendingTransactions = [];
    res.json({
      note: 'New block received and accepted.',
      newBlock: newBlock
    });
  } else {
    res.json({
      note: 'New block rejected.',
      newBlock: newBlock
    });
  }
});
// register a node and broadcast it the network
app.post('/register-and-broadcast-node', function (req, res) {
  const newNodeUrl = req.body.newNodeUrl;
  if (bitcoin.networkNodes.indexOf(newNodeUrl) == -1) bitcoin.networkNodes.push(newNodeUrl);
  const regNodesPromises = [];
  bitcoin.networkNodes.forEach(networkNodeUrl => {
    const requestOptions = {
      uri: networkNodeUrl + '/register-node',
      method: 'POST',
      body: { newNodeUrl: newNodeUrl },
      json: true
    };
    regNodesPromises.push(rp(requestOptions));
  });
  Promise.all(regNodesPromises)
    .then(data => {
      const bulkRegisterOptions = {
        uri: newNodeUrl + '/register-nodes-bulk',
        method: 'POST',
        body: { allNetworkNodes: [...bitcoin.networkNodes, bitcoin.currentNodeUrl] },
        json: true
      };
      return rp(bulkRegisterOptions);
    })
    .then(data => {
      res.json({ note: 'New node registered with network successfully.' });
    });
});
// register a node with the network
app.post('/register-node', function (req, res) {
  const newNodeUrl = req.body.newNodeUrl;
  const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(newNodeUrl) == -1;
  const notCurrentNode = bitcoin.currentNodeUrl !== newNodeUrl;
  if (nodeNotAlreadyPresent && notCurrentNode) bitcoin.networkNodes.push(newNodeUrl);
  res.json({ note: 'New node registered successfully.' });
});
// register multiple nodes at once
app.post('/register-nodes-bulk', function (req, res) {
  const allNetworkNodes = req.body.allNetworkNodes;
  allNetworkNodes.forEach(networkNodeUrl => {
    const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(networkNodeUrl) == -1;
    const notCurrentNode = bitcoin.currentNodeUrl !== networkNodeUrl;
    if (nodeNotAlreadyPresent && notCurrentNode) bitcoin.networkNodes.push(networkNodeUrl);
  });
  res.json({ note: 'Bulk registration successful.' });
});

app.get('/consensus', function (req, res) {
  bitcoin.networkNodes.forEach(networkNodeUrl => {
    const requestOptions = {
      uri: networkNodeUrl + '/blockchain',
      method: 'GET',
      json: true
    };
    requestPromise.push(rp(requestOptions));
  });

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
  }