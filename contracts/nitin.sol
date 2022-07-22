pragma solidity ^0.4.0;

contract SmartContract {

  address public payMaker;
  address public payTaker;
  uint public contractEndTime;
  uint public word;
  bytes32 public tip;

  //State Machine
  enum States {HandShake,Accepting,InTransfer}
  States state; 

  modifier checkPayMaker(){
    require(msg.sender == payMaker);
    _;
  }

  modifier checkPayTaker() {
    require(msg.sender == payTaker);
    _;
  }

  modifier checkTime() {
    require(now > contractEndTime);
    _;
  }

  modifier checkState(States _state) {
    require (state == _state);
    _;
  }

  //Constructor
  function SmartContract() public
  {
    payMaker = msg.sender;
    state = States.HandShake;
  }

  function handShake(address _payTaker, uint _validityTime, uint _word, bytes32 _tip) public
    payable
    checkPayMaker
    checkState(States.HandShake)
  {
    payTaker = _payTaker;
    require(now < now + _validityTime * 1 minutes);
    contractEndTime = now + _validityTime * 1 minutes;
    word = _word;
    tip = _tip;
    state = States.Accepting;
  }

  function claim(bytes32 _word, uint _totalWords) public
    checkPayTaker
    checkState(States.Accepting)
  {
    state = States.InTransfer;

    bytes32 scratch = _word;
    for (uint i = 1; i <= _totalWords; i++){
      scratch = keccak256(scratch);
    }

    if(scratch != tip) {
      state = States.Accepting;
      revert();
    }

    if (msg.sender.send(_totalWords * word)) {
      selfdestruct(payMaker);
     }

    state = States.Accepting;
  }

  function renew(uint _validityTime) public
    checkPayMaker
    checkState(States.Accepting)
    {
      require(contractEndTime < contractEndTime + _validityTime * 1 minutes);
      contractEndTime += _validityTime * 1 minutes;
    }

  function refund() public
    checkPayMaker
    checkTime
    checkState(States.Accepting)
    {
      selfdestruct(payMaker);
    }

  function() public payable { }

}