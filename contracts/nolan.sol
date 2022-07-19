pragma solidity 0.4.23;

contract Testing{
    
    struct student {
        uint id;
        string fName;
        string lName;
    }

    uint student_counter;
    mapping(uint=>student) public studentClass;

    uint [3] coffee_prices = [1,2,3];
    enum coffee_size{Small, Medium, Large}
    uint public coffee_total;
    address admin;

    coffee_size public cup;

    constructor() public {
        cup = coffee_size.Medium;
        student_counter = 0;
        admin = msg.sender;
        
    }

    modifier timestamp(){
        require(block.timestamp >= 1656629273);
        _;
    }

    modifier onlyAdmin(){
        require(msg.sender == admin, "You are not an Admin!!");
        _;
    }
    
    function calcCoffeeTotal(uint s, uint m, uint l) public onlyAdmin returns(uint) {
        coffee_total = 0;
        uint [3] memory coffee_order = [s,m,l];

        for(uint i = 0; i < 3; i++){
            coffee_total += coffee_order[i]*coffee_prices[i];
        }
        return coffee_total;
    }
    
    function addStudent(uint vnum, string memory fName, string memory lName) public{
        studentClass[vnum] = student(vnum, fName, lName);
        student_counter += 1;
    }

    function set_counter(uint _counter) public {
        student_counter = _counter;
    }

    function get_counter() public view returns(uint) {
        return student_counter;
    }
}