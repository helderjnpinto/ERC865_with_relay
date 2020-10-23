const ALKITOKEN = artifacts.require("ALKITOKEN");

module.exports = function (deployer, network, accounts) {
  // if (network == "development") return; 
  
  const [owner, relayer] = accounts;

  deployer.deploy(ALKITOKEN, "Alki gold token", "Alki", "1", 80001, relayer, {
    from: owner,
    overwrite: false
  });

};
