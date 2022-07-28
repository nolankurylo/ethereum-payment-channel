(async () => {
  try {

    // USER DEFINED INPUT ----------------------------------------------------------
    let MESSAGE = "CoolProject"
    let NUMBER_MICRO_PAYMENTS = 10 // unknown to reciever
    let MICRO_PAYMENT_VALUE = 1 // unknown to reciever
    let TOTAL_PAYMENT_VALUE = NUMBER_MICRO_PAYMENTS * MICRO_PAYMENT_VALUE
    // USER DEFINED INPUT ----------------------------------------------------------

    // Note that the script needs the ABI which is generated from the compilation artifact.
    const metadata = JSON.parse(await remix.call('fileManager', 'getFile', 'contracts/artifacts/PaymentChannel.json'))
    const accounts = await web3.eth.getAccounts()

    let senderAccount = accounts[6]
    let receiverAccount = accounts[7]

    let senderBalance = await web3.eth.getBalance(senderAccount);
    let senderWallet = web3.utils.fromWei(senderBalance, "ether");

    var receiverBalance = await web3.eth.getBalance(receiverAccount);
    var receiverWallet = web3.utils.fromWei(receiverBalance, "ether");

    console.log(`Sender: ${senderAccount}, Receiver: ${receiverAccount}`)
    console.log(`BEFORE CONTRACT DEPLOYMENT: SenderBalance: ${senderWallet}, ReceiverBalance: ${receiverWallet}`)
    console.log(`Message to encrypt: ${MESSAGE}`)

    // Create the Merkle Tree
    merkleTree = {}

    var messageHash = web3.utils.sha3(MESSAGE, {encoding: 'ascii'});

    merkleTree[NUMBER_MICRO_PAYMENTS] = messageHash
    console.log(`MerkleTree of ${NUMBER_MICRO_PAYMENTS} MicroPayments:`);
    console.log(`${NUMBER_MICRO_PAYMENTS}: ${messageHash}`);
    for(var i = 1; i < NUMBER_MICRO_PAYMENTS; i++) {
      messageHash = web3.utils.sha3(messageHash, {encoding: 'hex'});
      console.log(`${NUMBER_MICRO_PAYMENTS - i}: ${messageHash}`);
      
      merkleTree[NUMBER_MICRO_PAYMENTS-i] = messageHash
    }

    merkleTree['root'] = web3.utils.sha3(messageHash, {encoding: 'hex'});

    console.log(`The MerkleRoot is: ${merkleTree['root']}`);
    console.log(`The total value to be held by the contract is: ${TOTAL_PAYMENT_VALUE} ether`);
    
    
    let contract = new web3.eth.Contract(metadata.abi)
    contract = contract.deploy({
      data: metadata.data.bytecode.object,
      arguments: [MICRO_PAYMENT_VALUE]
    })

    newContractInstance = await contract.send({
      from: senderAccount,
      value: TOTAL_PAYMENT_VALUE * 1000000000000000000

    })

  } catch (e) {
    console.log(e.message)
  }
})()

