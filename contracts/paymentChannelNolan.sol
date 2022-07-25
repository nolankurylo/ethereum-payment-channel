pragma solidity ^0.4.0;

contract PaymentChannel {

  address public messageSender;
  address public messageReceiver;
  uint public contractEndTime;
  uint256 public messageValue;
  bytes32 public merkleTreeRoot;
  uint256 public sendAmount;

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
    require(now > contractEndTime, "Time out not expired yet, can't refund.");
    _;
  }

  modifier checkState(States _state) {
    require (state == _state, "Invalid State");
    _;
  }

  //Constructor
  constructor() public
  {
    messageSender = msg.sender;
    state = States.HandShake;
    sendAmount = 0;
  }

  function handShake(address _messageReceiver, uint _validityTime, uint256 _messageValue, bytes32 _merkleTreeRoot) public
    payable
    checkMessageSender
    checkState(States.HandShake)
  {
    messageReceiver = _messageReceiver;
    require(now < now + _validityTime * 1 minutes, "Handsake duration invalid");
    contractEndTime = now + _validityTime * 1 minutes;
    messageValue = _messageValue;
    merkleTreeRoot = _merkleTreeRoot;
    state = States.Accepting;
  }

  function claim(bytes32 _message, uint256 _totalMicroPayments) public payable
    checkMessageReceiver
    checkState(States.Accepting)
  {
    state = States.InTransfer;

    bytes32 scratch = _message;
    for (uint256 i = 1; i <= _totalMicroPayments; i++){
      scratch = keccak256(abi.encodePacked(scratch));
    }

    if(scratch != merkleTreeRoot) {
      state = States.Accepting;
      emit TransferFailed(sendAmount);
      revert();
    }

    sendAmount = _totalMicroPayments * messageValue;
    
    if (msg.sender.send(sendAmount)) {
      emit TransferComplete(sendAmount);
      selfdestruct(messageSender);
     }
    else{
      emit TransferFailed(sendAmount);
      state = States.Accepting;
     }
    
  }

  function renew(uint _validityTime) public
    checkMessageSender
    checkState(States.Accepting)
    {
      require(contractEndTime < contractEndTime + _validityTime * 1 minutes, "Cant renew, invalid new expiration");
      contractEndTime += _validityTime * 1 minutes;
    }

  function refund() public
    checkMessageSender
    checkTime
    checkState(States.Accepting)
    {
      selfdestruct(messageSender);
    }

  function() public payable { }

}
