pragma solidity 0.6.0;
pragma experimental ABIEncoderV2;
//experimental pragma allows us to return a struct 
contract Wallet{
  address [] public approvers;
  uint public quorum;
  struct Transfer{
    uint id;
    uint amount;
    address payable to;
    uint approvals;
    bool sent;
  }
  mapping (uint => Transfer) public transfers;
  mapping (address => mapping(uint => bool)) public approvals;
  uint public nextId;
  constructor(address [] memory _approvers, uint _quorum)public {
    approvers = _approvers;
    quorum=_quorum;
  }
  function getApprovers() external view returns(address [] memory){
    return approvers;
  }
  function createTransfer(uint amount, address payable to) external onlyApprover(){
    transfers[nextId] = Transfer(
      nextId,
      amount,
      to,
      0,
      false
    );
    nextId++;
  }
  function getTransfers() external view returns(Transfer [] memory){
    Transfer[] memory tr = new Transfer[](nextId);
    for (uint i = 0; i < nextId; i++) {
        tr[i] = transfers[i];
    }
    return tr;
  }
  function approveTransfer(uint id) external onlyApprover(){
    require(transfers[id].sent == false, "transfer has already been approved");
    require(approvals[msg.sender][id]== false, "you can not approve transfer twice");
    approvals[msg.sender][id]= true;
    transfers[id].approvals++;
    if(transfers[id].approvals >= quorum){
      transfers[id].sent =true;
      address payable to = transfers[id].to;
      uint amount = transfers[id].amount;
      to.transfer(amount);
    }
  }
  //receives ether
  receive() external payable {}

  modifier onlyApprover(){
    bool allowed = false;
    for (uint i=0; i< approvers.length; i++){
      if (approvers[i] == msg.sender){
        allowed =true;
      }
    }
    require(allowed == true, "only approvers allowed");
    _;
  }
}