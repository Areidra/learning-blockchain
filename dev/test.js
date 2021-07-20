const Blockchain = require('./blockchain');
const bitcoin = new Blockchain();

const previousBlockHash = 'oinaisdfn09n09asdnf90n90asndf';
const currentBlockData = [
    {
        amount: 101,
        sender: 'n90ans90n90ansdfn',
        recipient: '90na90sndf90ansdf09n'
    },
    {
        amount: 30,
        sender:'n90ans90n90ansdfn',
        recipient: 'uiansiudfuiabsduifb'
    },
    {
        amount: 200,
        sender: '89ans89dfn98asndf89',
        recipient: 'ausdf89ansd9fnasd'
    }
];
console.log('VALID:', bitcoin.chainIsValid(bc1.chain));