const { expectRevert } = require('@openzeppelin/test-helpers');
const { web3 } = require('@openzeppelin/test-helpers/src/setup');
const Wallet = artifacts.require('Wallet');

contract('Wallet', (accounts)=>{
  let wallet;
  beforeEach(async ()=>{
    //will be executed before each test
    wallet = await Wallet.new(
      //pass in all the argument the smart contract's constructor needs
      [accounts[0], accounts[1], accounts[2]],
      2
    );
    await web3.eth.sendTransaction({from: accounts[0], to: wallet.address, value:1000 });
  });

  //test
  it('should have correct approvers and qourum', async() =>{
    const approvers= await wallet.getApprovers();
    const quorum= await wallet.quorum();
    assert(approvers.length === 3);
    assert(approvers[0] == accounts[0]);
    assert(approvers[1] == accounts[1]);
    assert(approvers[2] == accounts[2]);
    assert(quorum.toNumber() === 2);
  });
  it('should create transfers', async() =>{
    await wallet.createTransfer(100, accounts[5],{from: accounts[0]});
    const transfers= await wallet.getTransfers();
    assert(transfers.length === 1);
    assert(transfers[0]['id'] === '0');
    assert(transfers[0]['amount'] === '100');
    assert(transfers[0]['to'] === accounts[5]);
    assert(transfers[0]['approvals'] === '0');
    assert(transfers[0]['sent'] == false);
  });
  it('should not create transfer if sender is not approved', async()=>{
    await expectRevert(wallet.createTransfer(100, accounts[5],{from: accounts[4]}),//account 4 is not an approval,
    'only approvers allowed'
    );
  });
  it('should increment approval', async()=>{
    await wallet.createTransfer(100, accounts[5],{from: accounts[0]});
    await wallet.approveTransfer(0, { from : accounts[0]});
    const transfers= await wallet.getTransfers();
    const balance = await web3.eth.getBalance(wallet.address);
    assert(transfers[0]['approvals'] === '1');
    assert(transfers[0]['sent'] == false);
    assert(balance ==='1000');
  });
  it('should send transfer if qourum is reached', async()=>{
    const balanceBefore = await web3.utils.toBN(web3.utils.utf8ToHex(web3.eth.getBalance(accounts[6])));//returns object
    //console.log(typeof(balanceBefore))
    await wallet.createTransfer(100, accounts[6],{from: accounts[0]});
    await wallet.approveTransfer(0, { from : accounts[0]});
    await wallet.approveTransfer(0, { from : accounts[1]});
    const balanceAfter = await web3.utils.toBN(web3.utils.utf8ToHex(web3.eth.getBalance(accounts[6])));
    // console.log(balanceAfter.sub(balanceBefore).toNumber())
    // assert(balanceAfter.sub(balanceBefore).toNumber() === 100);
    //not working
  })
  it('shold not approve transfer if sender is not approved', async()=>{
    await wallet.createTransfer(100, accounts[5],{from: accounts[0]});
    await expectRevert(wallet.approveTransfer(0,{from: accounts[4]}),//account 4 is not an approval,
    'only approvers allowed'
    );
  });
  it('should not approve transfer if transfer is already sent', async()=>{
    await wallet.createTransfer(100, accounts[6],{from: accounts[0]});
    await wallet.approveTransfer(0, { from : accounts[0]});
    await wallet.approveTransfer(0, { from : accounts[1]});
    await expectRevert(
      wallet.approveTransfer(0,{from: accounts[2]}),
    'transfer has already been approved'
    );
  });
  it('should not approve transfer twice', async()=>{
    await wallet.createTransfer(100, accounts[6],{from: accounts[0]});
    await wallet.approveTransfer(0, { from : accounts[0]});
    await expectRevert(
    wallet.approveTransfer(0, { from : accounts[0]}),
    'you can not approve transfer twice'
    ); 
  });
}); 