(async () => {
  try {
    console.log('Deploy...')
    
    // Note that the script needs the ABI which is generated from the compilation artifact.
    const metadata = JSON.parse(await remix.call('fileManager', 'getFile', 'contracts/artifacts/PaymentChannel.json'))
    const accounts = await web3.eth.getAccounts()

    let senderAccount = accounts[5]
    let receiverAccount = accounts[6]

    let senderBalance = await web3.eth.getBalance(senderAccount);
    let senderWallet = web3.utils.fromWei(senderBalance, "ether");

    var receiverBalance = await web3.eth.getBalance(receiverAccount);
    var receiverWallet = web3.utils.fromWei(receiverBalance, "ether");

    let EXPIRATION_TIME = 3 // 3 minutes contract duration
    let MESSAGE = "mysecret"
    let NUMBER_MICRO_PAYMENTS = 10
    let MICRO_PAYMENT_VALUE = 1
    let TOTAL_PAYMENT_VALUE = NUMBER_MICRO_PAYMENTS * MICRO_PAYMENT_VALUE


    console.log(`Sender: ${senderAccount}, Receiver: ${receiverAccount}`)
    console.log(`BEFORE CONTRACT DEPLOYMENT: SenderBalance: ${senderWallet}, ReceiverBalance: ${receiverWallet}`)
    console.log(`Message to encrypt: ${MESSAGE}`)

    // Create the Merkle Tree
    merkleTree = {}

    var messageHash = web3.utils.sha3(MESSAGE, {encoding: 'ascii'});

    merkleTree[NUMBER_MICRO_PAYMENTS] = messageHash

    for(var i = 1; i < NUMBER_MICRO_PAYMENTS; i++) {
      messageHash = web3.utils.sha3(messageHash, {encoding: 'hex'});
      merkleTree[NUMBER_MICRO_PAYMENTS-i] = messageHash
    }

    merkleTree['root'] = web3.utils.sha3(messageHash, {encoding: 'hex'});

    console.log(`The MerkleRoot is: ${merkleTree['root']}`);
    console.log(`The total value to be held by the contract is: ${TOTAL_PAYMENT_VALUE} ether`);
    
    
    let contract = new web3.eth.Contract(metadata.abi)
    contract = contract.deploy({
      data: metadata.data.bytecode.object,
      arguments: []
    })

    newContractInstance = await contract.send({
      from: senderAccount,
      value: TOTAL_PAYMENT_VALUE * 1000000000000000000

    })

    // Initiate contract
    await newContractInstance.methods.handShake(receiverAccount, EXPIRATION_TIME, MICRO_PAYMENT_VALUE, merkleTree['root']).send({
      from: senderAccount
    })
    
    // Sender creates micropayments, pick one to send to receiver
    microPaymentToSend = randomMicroPayment(1, NUMBER_MICRO_PAYMENTS);
    console.log(`Random micropayment to send is: ${microPaymentToSend}`)
  

    // Initiate contract
    await newContractInstance.methods.claim(merkleTree[microPaymentToSend], microPaymentToSend).send({
      from: receiverAccount
    })
    
    senderBalance = await web3.eth.getBalance(senderAccount);
    senderWallet = web3.utils.fromWei(senderBalance, "ether");

    var receiverBalance = await web3.eth.getBalance(receiverAccount);
    var receiverWallet = web3.utils.fromWei(receiverBalance, "ether");
    console.log(`\nAFTER CONTRACT TERMINATION: SenderBalance: ${senderWallet} ETHER, ReceiverBalance: ${receiverWallet} ETHER`)
    
    
    







  } catch (e) {
    console.log(e.message)
  }
})()



function randomMicroPayment(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}