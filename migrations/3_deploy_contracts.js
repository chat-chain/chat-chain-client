var Evee = artifacts.require("./Evee.sol");
var EveeNFT = artifacts.require("./EveeNFT.sol");
var Recipiant = artifacts.require("./Recipiant.sol");
var RecipiantHashDomain = artifacts.require("./RecipiantHashDomain.sol");
var Test = artifacts.require("./Test.sol");




module.exports = function(deployer, network, accounts) {
  //console.log('accounts[0] ',accounts[0]);
  deployer.deploy(EveeNFT,'https://gateway.pinata.cloud/ipfs/QmQfSCYuGTV4nGU3cxPdheNZgmvJqpfKTR7wuQiQHStv6d').then(function(){
      return deployer.deploy(Evee, EveeNFT.address).then(function(){
        return deployer.deploy(RecipiantHashDomain).then(function(){
            console.log('RecipiantHashDomain.address',RecipiantHashDomain.address);
            return deployer.deploy(Recipiant,"Hello world",RecipiantHashDomain.address, EveeNFT.address, 1 , Evee.address);
      });
    });
  });
};