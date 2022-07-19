pragma solidity 0.5.1;

// Contract to buy some token
library Calculations{
    function modulo(uint a, uint b) internal pure returns (uint){
        return (a % b);
    }
    function multiply(uint a, uint b) internal pure returns (uint){
        return (a * b);
    }
}

contract buyToken{
    address payable wallet; // can receive ether
    mapping (address=> uint) public sender_account; // map address to sender account

    uint public costBefore;
    uint public costAfter;

    constructor (address payable _wallet) public{
        wallet = _wallet;
    }

    event deal(address buyer, uint _val);

    function credit(uint cost) public payable{
        costBefore = sender_account[msg.sender];
        sender_account[msg.sender] += cost;
        costAfter = sender_account[msg.sender];
        wallet.transfer(msg.value);
        emit deal(msg.sender, cost);

    }
}