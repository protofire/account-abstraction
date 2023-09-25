import type { HardhatUserConfig, HttpNetworkUserConfig } from "hardhat/types";
import '@nomiclabs/hardhat-waffle'
import '@typechain/hardhat'
import 'hardhat-deploy'
import '@nomiclabs/hardhat-etherscan'
import { getSingletonFactoryInfo } from "@safe-global/safe-singleton-factory";
import 'solidity-coverage'
import * as fs from 'fs'
import { BigNumber } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const mnemonicFileName = process.env.MNEMONIC_FILE ?? `${process.env.HOME}/.secret/testnet-mnemonic.txt`
let mnemonic = 'test '.repeat(11) + 'junk'
if (fs.existsSync(mnemonicFileName)) { mnemonic = fs.readFileSync(mnemonicFileName, 'ascii') }

const { PK, CUSTOM_DETERMINISTIC_DEPLOYMENT, INFURA_KEY } = process.env;
const sharedNetworkConfig: HttpNetworkUserConfig = {};
if (PK) {
  sharedNetworkConfig.accounts = [PK];
} else {
  sharedNetworkConfig.accounts = {
    mnemonic: mnemonic,
  };
}

const deterministicDeployment = CUSTOM_DETERMINISTIC_DEPLOYMENT == "true" ?
  (network: string) => {
    const info = getSingletonFactoryInfo(parseInt(network))
    if (!info) return undefined
    return {
      factory: info.address,
      deployer: info.signerAddress,
      funding: BigNumber.from(info.gasLimit).mul(BigNumber.from(info.gasPrice)).toString(),
      signedTx: info.transaction
    }
  } : undefined

/* function getNetwork1 (url: string): { url: string, accounts: { mnemonic: string } } {
  return {
    url,
    accounts: { mnemonic }
  }
}

function getNetwork (name: string): { url: string, accounts: { mnemonic: string } } {
  return getNetwork1(`https://${name}.infura.io/v3/${process.env.INFURA_ID}`)
  // return getNetwork1(`wss://${name}.infura.io/ws/v3/${process.env.INFURA_ID}`)
} */

const optimizedCompilerSettings = {
  version: '0.8.17',
  settings: {
    optimizer: { enabled: true, runs: 1000000 },
    viaIR: true
  }
}

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: {
    compilers: [{
      version: '0.8.15',
      settings: {
        optimizer: { enabled: true, runs: 1000000 }
      }
    }],
    overrides: {
      'contracts/core/EntryPoint.sol': optimizedCompilerSettings,
      'contracts/samples/SimpleAccount.sol': optimizedCompilerSettings
    }
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
      blockGasLimit: 100000000,
      gas: 100000000
    },
    mainnet: {
      ...sharedNetworkConfig,
      url: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
    },
    xdai: {
      ...sharedNetworkConfig,
      url: "https://xdai.poanetwork.dev",
    },
    ewc: {
      ...sharedNetworkConfig,
      url: `https://rpc.energyweb.org`,
    },
    rinkeby: {
      ...sharedNetworkConfig,
      url: `https://rinkeby.infura.io/v3/${INFURA_KEY}`,
    },
    goerli: {
      ...sharedNetworkConfig,
      url: `https://goerli.infura.io/v3/${INFURA_KEY}`,
    },
    kovan: {
      ...sharedNetworkConfig,
      url: `https://kovan.infura.io/v3/${INFURA_KEY}`,
    },
    polygon: {
      ...sharedNetworkConfig,
      url: `https://polygon-mainnet.infura.io/v3/${INFURA_KEY}`,
    },
    volta: {
      ...sharedNetworkConfig,
      url: `https://volta-rpc.energyweb.org`,
    },
    bsc: {
      ...sharedNetworkConfig,
      url: `https://bsc-dataseed.binance.org/`,
    },
    arbitrum: {
      ...sharedNetworkConfig,
      url: `https://arb1.arbitrum.io/rpc`,
    },
    fantomTestnet: {
      ...sharedNetworkConfig,
      url: `https://rpc.testnet.fantom.network/`,
    },
    lineaTestnet: {
      ...sharedNetworkConfig,
      url: `https://rpc.goerli.linea.build`,
    },
    tenetTestnet: {
      ...sharedNetworkConfig,
      url: `https://rpc.testnet.tenet.org`,
    },
    tenetMainnet: {
      ...sharedNetworkConfig,
      url: `https://rpc.tenet.org`,
    },
    hmyt: {
      ...sharedNetworkConfig,
      url: `https://api.s0.b.hmny.io`,
    },
    chilizTestnet: {
      ...sharedNetworkConfig,
      url: `https://spicy-rpc.chiliz.com/`,
    },
    mantleTestnet: {
      ...sharedNetworkConfig,
      url: `https://rpc.testnet.mantle.xyz`,
    },
    rskTestnet: {
      ...sharedNetworkConfig,
      url: `https://testnet.sovryn.app`,
    },
    mantleMainnet: {
      ...sharedNetworkConfig,
      url: `https://rpc.mantle.xyz`,
    },
    neonMainnet: {
      ...sharedNetworkConfig,
      url: `https://neon-proxy-mainnet.solana.p2p.org`,
    },
    lineaMainnet: {
      ...sharedNetworkConfig,
      url: `https://archive.linea.build`,
    },
    rskMainnet: {
      ...sharedNetworkConfig,
      url: `https://public-node.rsk.co`,
    },
    harmonyShard0: {
      ...sharedNetworkConfig,
      url: `https://a.api.s0.t.hmny.io`,
    },
    cascadiaTestnet: {
      ...sharedNetworkConfig,
      url: `https://testnet.cascadia.foundation`,
    },
    scrollSepolia: {
      ...sharedNetworkConfig,
      url: `https://sepolia-rpc.scroll.io/`,
    },
    scrollAlpha: {
      ...sharedNetworkConfig,
      url: `https://scroll-alphanet.public.blastapi.io`,
    },
    horizenTestnet: {
      ...sharedNetworkConfig,
      url: `https://gobi-rpc.horizenlabs.io/ethv1`,
    },
    filecoinTestnet: {
      ...sharedNetworkConfig,
      url: `https://api.calibration.node.glif.io/rpc/v1`,
    },
  },
  deterministicDeployment,
  mocha: {
    timeout: 10000
  },

  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }

}

// coverage chokes on the "compilers" settings
if (process.env.COVERAGE != null) {
  // @ts-ignore
  config.solidity = config.solidity.compilers[0]
}

export default config
