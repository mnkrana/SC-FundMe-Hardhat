const { task } = require("hardhat/config")

task("fundme-balance", "Prints fundme contract balance").setAction(
    async (taskArgs, hre) => {
    const deployer = (await hre.getNamedAccounts()).deployer    
    const fundme = await hre.ethers.getContract("FundMe", deployer)
    const balance = await fundme.getBalance();
    console.log(ethers.formatEther(balance), "ETH");
  });

task("fundme-fund", "Funds fundme contract").setAction(
    async (taskArgs, hre) => {
    const deployer = (await hre.getNamedAccounts()).deployer    
    const fundMe = await hre.ethers.getContract("FundMe", deployer)    
    await fundMe.fund({value: ethers.parseEther("0.1")})
    console.log(`Funding successfull`);
  });

task("fundme-withdraw", "Withdraw funds from contract").setAction(
    async (taskArgs, hre) => {
    const deployer = (await hre.getNamedAccounts()).deployer    
    const fundMe = await hre.ethers.getContract("FundMe", deployer)    
    await fundMe.withdraw()
    console.log(`Withdraw successfull into ${deployer}`);
  });

  task("balance", "Prints an account's balance")
  .addParam("account", "The account's address")
  .setAction(async (taskArgs) => {
    const balance = await ethers.provider.getBalance(taskArgs.account);

    console.log(ethers.formatEther(balance), "ETH");
  });


module.exports = {}
