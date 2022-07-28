# Ethereum Payment Channel Smart Contract
An efficient unidirectional Etheurem micropayments channel using Solidity on Remix IDE.
The goal of the application is to deploy a smart contract that can can allow for offline micropayment transferring of Ether by verifying micropayment hashes via a Merkle Tree.

## Setup
1. `contracts/paymentChannel.sol` can be built using Solidity compiler on Remix IDE with version >= 0.9.1
2. Configure user defined inputs and run `remix.exeCurrent()` wfor the file `scripts/offlineMicroPayments.js`. It will deploy and intitialize the smart contract
3. Operate/toggle the fields of the smart contract on the Remix IDE
