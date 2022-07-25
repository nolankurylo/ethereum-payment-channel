(async () => {
  try {
    console.log('Deploy...')
    const accounts = await web3.eth.getAccounts()
    // Note that the script needs the ABI which is generated from the compilation artifact.
    const metadata = JSON.parse(await remix.call('fileManager', 'getFile', 'contracts/artifacts/PaymentChannel_metadata.json'))
    
    let senderAccount = accounts[2]
    let receiverAccount = accounts[3]


    let MESSAGE = "mysecret"
    let NUMBER_MICRO_PAYMENTS = 10
    let MICRO_PAYMENT_VALUE = 1
    let TOTAL_PAYMENT_VALUE = NUMBER_MICRO_PAYMENTS * MICRO_PAYMENT_VALUE


    console.log(`Sender: ${senderAccount}, Receiver: ${receiverAccount}`)
    console.log(`Message to encrypt: ${MESSAGE}`)


    console.log(`The PayMessages from ${NUMBER_MICRO_PAYMENTS} to 1 are:`);
    var hashScratch = web3.utils.sha3(MESSAGE, {encoding: 'ascii'});
    console.log(`${NUMBER_MICRO_PAYMENTS}: ${hashScratch}`);

    for(var i = 1; i < NUMBER_MICRO_PAYMENTS; i++) {
      hashScratch = web3.utils.sha3(hashScratch, {encoding: 'hex'});
      console.log(`${NUMBER_MICRO_PAYMENTS-i}: ${hashScratch}`);
    }

    merkleTreeRoot = web3.utils.sha3(hashScratch, {encoding: 'hex'});

    console.log(`The MerkleRoot is: ${merkleTreeRoot}`);
    console.log(`The total value to be held by the contract is: ${TOTAL_PAYMENT_VALUE} ether`);
    
    
    let contract = new web3.eth.Contract(metadata.abi)

    contract = contract.deploy({
      data: metadata.data.bytecode.object,
      arguments: []
    })

    newContractInstance = await contract.send({
      from: senderAccount,
      // value: TOTAL_PAYMENT_VALUE * 1000000000000000000
    })

    // await contract.methods.handShake(receiverAccount, 100, 1, merkleTreeRoot).send({
    //   from: senderAccount
    // })
    
    console.log(`Contract Address: ${newContractInstance.options.address}`)
    console.log(newContractInstance.methods)







  } catch (e) {
    console.log(e.message)
  }
})()

