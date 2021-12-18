const Migrations = artifacts.require("Shop");

module.exports = function (deployer) {
  deployer.deploy(Migrations);
};
