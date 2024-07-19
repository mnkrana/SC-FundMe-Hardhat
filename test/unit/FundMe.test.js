const { assert, expect } = require("chai")
const { network, deployments, getNamedAccounts, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

console.log(network.name)

_ = !developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", function () {
          let fundMe
          let mockV3Aggregator
          let deployer
          const sendValue = ethers.parseEther("0.1")
        
        beforeEach(async () => {                          
            deployer = (await getNamedAccounts()).deployer               
            fundMe = await ethers.getContract("FundMe", deployer)                        
            mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })

          describe("constructor", function () {
              it("sets the aggregator addresses correctly", async () => {
                  const response = await fundMe.getPriceFeed()                                    
                  const mockAddress = await mockV3Aggregator.getAddress()                  
                  assert.equal(response, mockAddress)
              })
          })

          describe("fund", function () {              
              it("Fails if you don't send enough ETH", async () => {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH!"
                  )
              })
              
              it("Updates the amount funded data structure", async () => {                  
                  const startingBalance = await fundMe.getAddressToAmountFunded(deployer)
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.getAddressToAmountFunded(deployer)
                  assert.equal((response - startingBalance).toString(), sendValue.toString())
              })

              it("Adds funder to array of funders", async () => {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.getFunder(0)
                  assert.equal(response, deployer)
              })
          })

          describe("withdraw", function () {

              beforeEach(async () => {
                  await fundMe.fund({ value: sendValue })
              })

              it("withdraws ETH from a single funder", async () => {
                  // Arrange
                  const startingFundMeBalance = await fundMe.getBalance()
                  const startingDeployerBalance = await ethers.provider.getBalance(deployer)

                  // Act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait()
                  const { gasUsed, gasPrice } = transactionReceipt
                  const gasCost = gasUsed * gasPrice

                  const endingFundMeBalance = await fundMe.getBalance()
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  // Assert
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      (startingFundMeBalance
                          + startingDeployerBalance)
                          .toString(),
                      (endingDeployerBalance + gasCost).toString()
                  )
              })
              
              it("is allows us to withdraw with multiple funders", async () => {
                  // Arrange
                  const accounts = await ethers.getSigners()
                  for (i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }
                  const startingFundMeBalance = await fundMe.getBalance()
                  const startingDeployerBalance = await ethers.provider.getBalance(deployer)

                  // Act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait()
                  const { gasUsed, gasPrice } = transactionReceipt
                  const withdrawGasCost = gasUsed * gasPrice                         
                  const endingDeployerBalance = await ethers.provider.getBalance(deployer)
              
                      // Assert
                  assert.equal(
                      (startingFundMeBalance
                          + startingDeployerBalance)
                          .toString(),
                      (endingDeployerBalance + withdrawGasCost).toString()
                  )
              
                  await expect(fundMe.getFunder(0)).to.be.reverted

                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })
              
              it("Only allows the owner to withdraw", async function () {
                  const accounts = await ethers.getSigners()
                  const fundMeConnectedContract = await fundMe.connect(
                      accounts[1]
                  )
                  await expect(
                      fundMeConnectedContract.withdraw()
                  ).to.be.revertedWith("FundMe__NotOwner")
              })
          })
      })
