const { network } = require("hardhat")

const DECIMALS = "8"
const INITIAL_PRICE = "200000000000" // 2000

async function deployMocks({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    if (chainId == 31337) {
        log("Local network detected! Deploying mocks...")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_PRICE],
        })
        log("Mocks Deployed!")
        log("------------------------------------------------")
    }
}

module.exports = deployMocks
module.exports.tags = ["all", "mocks"]
