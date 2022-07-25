(async () => {
  try {
    console.log('Deploy...')
    const accounts = await web3.eth.getAccounts()
    // Note that the script needs the ABI which is generated from the compilation artifact.
    const metadata = JSON.parse(await remix.call('fileManager', 'getFile', 'contracts/artifacts/PaymentChannel.json'))
    
    let senderAccount = accounts[0]
    let receiverAccount = accounts[1]
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
    
    
    let contract = new web3.eth.Contract(metadata.abi)


    contract = contract.deploy({
      data: metadata.data.bytecode.object,
      arguments: []
    })

    await contract.send({
      from: senderAccount
    })

    // await contract.methods.handShake(receiverAccount, 100, 1, merkleTreeRoot).send({
    //   from: senderAccount
    // })
    // console.log(`Contract Address: ${newContractInstance.options.address}`)
    // console.log(newContractInstance)







  } catch (e) {
    console.log(e.message)
  }
})()

