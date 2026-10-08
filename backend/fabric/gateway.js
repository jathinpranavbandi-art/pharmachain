// Real Hyperledger Fabric connection (Fabric test-network, Org1 User1 identity).
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const grpc = require('@grpc/grpc-js');
const { connect, signers } = require('@hyperledger/fabric-gateway');
const cfg = require('../config');
const dec = new TextDecoder();
const deadline = (ms) => () => ({ deadline: Date.now() + ms });
let contract;

const parse = (bytes) => { const s = dec.decode(bytes); return s ? JSON.parse(s) : null; };
const firstFile = (dir) => path.join(dir, fs.readdirSync(dir)[0]);

exports.init = async () => {
  const org = path.join(cfg.fabricPath, 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com');
  const user = path.join(org, 'users', 'User1@org1.example.com', 'msp');
  const tls = fs.readFileSync(path.join(org, 'peers', 'peer0.org1.example.com', 'tls', 'ca.crt'));
  const client = new grpc.Client('localhost:7051', grpc.credentials.createSsl(tls), {
    'grpc.ssl_target_name_override': 'peer0.org1.example.com',
  });
  const gateway = connect({
    client,
    identity: { mspId: cfg.mspId, credentials: fs.readFileSync(firstFile(path.join(user, 'signcerts'))) },
    signer: signers.newPrivateKeySigner(crypto.createPrivateKey(fs.readFileSync(firstFile(path.join(user, 'keystore'))))),
    evaluateOptions: deadline(5000), endorseOptions: deadline(15000),
    submitOptions: deadline(5000), commitStatusOptions: deadline(60000),
  });
  contract = gateway.getNetwork(cfg.channel).getContract(cfg.chaincode);
  await contract.evaluateTransaction('GetAllMedicines'); // proves peer + chaincode are reachable
};

exports.invoke = async (fn, args) => {
  const proposal = contract.newProposal(fn, { arguments: args });
  const tx = await proposal.endorse();
  const result = tx.getResult();
  const commit = await tx.submit();
  const status = await commit.getStatus();
  if (!status.successful) throw new Error(`Transaction ${status.transactionId} failed to commit (code ${status.code})`);
  return { txId: proposal.getTransactionId(), result: parse(result) };
};

exports.query = async (fn, args) => parse(await contract.evaluateTransaction(fn, ...args));
