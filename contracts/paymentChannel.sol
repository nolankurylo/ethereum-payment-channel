/**
* @title ECE496A Term Project - PaymentChannel
* @dev An efficient Ethereum payment channel via micropayments
* @SPDX-License-Identifier: UNLICENSED
*/

pragma solidity ^0.8.1;

contract PaymentChannel {

  address payable public messageSender;
  address payable public messageReceiver;
  uint public contractEndTime;
  uint256 public messageValue;
  bytes32 public merkleTreeRoot;
  uint256 public maxSendAmount;

  //State Machine
  enum States {HandShake,Accepting,InTransfer}
  States state; 

  event TransferComplete(uint amountTransferred);
  event TransferFailed(uint amountTransferred);

  modifier checkMessageSender(){
    require(msg.sender == messageSender, "You are not the correct sender.");
    _;
  }

  modifier checkMessageReceiver() {
    require(msg.sender == messageReceiver, "You are not the correct receiver.");
    _;
  }

  modifier checkTime() {
    require(block.timestamp > contractEndTime, "Time out not expired yet, can't refund.");
    _;
  }

  modifier checkState(States _state) {
    require (state == _state, "Invalid State");
    _;
  }

  //Constructor
  constructor() payable
  {
    messageSender = payable(msg.sender);
    state = States.HandShake;
    maxSendAmount = msg.value * 1000000000000000000; // in ether
  }

  /**
  * @dev Function for MessageSender to initiate payment channel between MessageSender and MessageReceiver
  * @param _messageReceiver address of receipient
  * @param _validityTime number of minutes before the contract expires 
  * @param _messageValue how much each micropayment is worth
  * @param _merkleTreeRoot hash of merkle tree root from sender
  */
  function handShake(address payable _messageReceiver, uint _validityTime, uint256 _messageValue, bytes32 _merkleTreeRoot) public
    payable
    checkMessageSender
    checkState(States.HandShake)
  {
    messageReceiver = _messageReceiver;
    require(block.timestamp < block.timestamp + _validityTime * 1 minutes, "Handsake duration invalid");
    contractEndTime = block.timestamp + _validityTime * 1 minutes;
    messageValue = _messageValue;
    merkleTreeRoot = _merkleTreeRoot;
    state = States.Accepting;
  }


  /**
  * @dev Function for MessageReceiver to close payment channel and collect the Ether from MessageSender
  * @param _microPaymentHash hash of micropayment from sender
  * @param _microPaymentNumber which micropayment
  */
  function claim(bytes32 _microPaymentHash, uint256 _microPaymentNumber) public payable
    checkMessageReceiver
    checkState(States.Accepting)
  {
    state = States.InTransfer;

    bytes32 hash = _microPaymentHash;
    for (uint256 i = 1; i <= _microPaymentNumber; i++){
      hash = keccak256(abi.encodePacked(hash));
    }

    if(hash != merkleTreeRoot) {
      state = States.Accepting;
      emit TransferFailed(maxSendAmount);
      revert();
    }

    uint sendAmount = _microPaymentNumber * messageValue * 1000000000000000000;
    require(sendAmount <= maxSendAmount, "Trying to send more than what was defined at contract deployment");

    
    if (messageReceiver.send(sendAmount)) {
      emit TransferComplete(sendAmount);
      selfdestruct(messageSender);
     }
    else{
      emit TransferFailed(sendAmount);
      state = States.Accepting;
     }
    
  }

  /**
  * @dev Function for MessageSender to extend the expiration time of the contract
  * @param _validityTime number of minutes to add to contract's current exipiration time
  */
  function updateExpiration(uint _validityTime) public
    checkMessageSender
    checkState(States.Accepting)
    {
      require(contractEndTime < contractEndTime + _validityTime * 1 minutes, "Can't update to new expiration, invalid new expiration");
      contractEndTime += _validityTime * 1 minutes;
    }

  /**
  * @dev Function for MessageSender to obtain a refund if the contract has expired and the MessageReceiver has not collected payment
  */
  function refund() public
    checkMessageSender
    checkTime
    checkState(States.Accepting)
    {
      selfdestruct(messageSender);
    }

  

}
