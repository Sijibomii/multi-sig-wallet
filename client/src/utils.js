import Web3 from "web3";
import Wallet from "./contracts/Wallet.json";

//returns the web3 object
const getWeb3 = ()=>{
  return new Promise((resolve, reject) =>{
    window.addEventListener('load', async()=>{
      if (window.ethereum){
        //instantiate metamask 
        const web3 = new Web3(window.ethereum);
        try{
          //if user refuses access to metamask it rejects else, it resolves
          window.ethereum.enable();
          resolve(web3);
        }catch(error){
          reject(error)
        }
      }else if(window.web3){
        //if user is using an old version of metamask
        resolve(window.web3);
      }else{
        //if metamask is not found
        reject('must install metamask');
      }
    } );
  });
};
//tongue flock flash beyond arm clay process gasp never moon urban width
//contract instance
const getWallet = async (web3)=>{
  const networkId = await web3.eth.net.getId();
  const contractDeployment = Wallet.networks[networkId];
  return new web3.eth.Contract(
    Wallet.abi,
    contractDeployment && contractDeployment.address
  );
};

export { getWeb3, getWallet }