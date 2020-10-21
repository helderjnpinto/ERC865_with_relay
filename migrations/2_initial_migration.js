const ERC20 = artifacts.require("ERC20");
// 0xE65fB9f2136a1a9f626fe39C35B3F8D84B9C9ae6
module.exports = function (deployer, network, accounts) {
  deployer.deploy(ERC20, "Alki_mistery_token", "Alki");
};
