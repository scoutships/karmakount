import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const rpcUrl = 'https://mainnet.base.org';
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  const privateKey = process.env.DEPLOYER_PRIVATE_KEY || '0x3f5f0dc6fba15be6c2f8319c012e084cd7fe619eafd509026398df8d5854c4ec';
  const wallet = new ethers.Wallet(privateKey, provider);
  console.log('Deployer Address:', wallet.address);

  const balance = await provider.getBalance(wallet.address);
  console.log('Deployer Balance:', ethers.formatEther(balance), 'ETH');

  if (balance < ethers.parseEther('0.00005')) {
    console.log('\n======================================================');
    console.log('⚠️  Waiting for gas funding:');
    console.log('Send CA$1.00 (approx 0.0002 ETH) on BASE network to:');
    console.log('👉', wallet.address);
    console.log('======================================================\n');
    return;
  }

  const userAddress = '0x911763C6557A3696C39890C9472d9F9364cA6646';
  const artifactPath = path.join(__dirname, '../contracts/KarmaKountToken.json');
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  console.log('🚀 Deploying KarmaKountToken to Base Mainnet...');
  console.log('👑 Founder Genesis Allocation (60% = 600,000,000 $KARMA):', userAddress);
  console.log('💧 DEX Liquidity Reserve (20% = 200,000,000 $KARMA):', userAddress);
  console.log('🎮 Gameplay Faucet Vault (20% = 200,000,000 $KARMA):', userAddress);
  console.log('🛡️  Contract Owner:', userAddress);

  const contract = await factory.deploy(userAddress, userAddress, userAddress);
  const tx = contract.deploymentTransaction();
  console.log('Transaction Broadcasted!');
  console.log('Tx Hash:', tx.hash);
  console.log('Explorer:', `https://basescan.org/tx/${tx.hash}`);

  console.log('Waiting for block confirmation on Base...');
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log('\n======================================================');
  console.log('🎉 SUCCESS! $KARMA TOKEN IS LIVE ON BASE MAINNET!');
  console.log('Contract Address:', contractAddress);
  console.log('Basescan Explorer:', `https://basescan.org/address/${contractAddress}`);
  console.log('======================================================\n');

  // Verify on-chain supply and user balance
  const karmaToken = new ethers.Contract(contractAddress, artifact.abi, provider);
  const userBalance = await karmaToken.balanceOf(userAddress);
  const totalSupply = await karmaToken.totalSupply();
  console.log('Total Supply:', ethers.formatUnits(totalSupply, 18), '$KARMA');
  console.log('User Holdings:', ethers.formatUnits(userBalance, 18), '$KARMA (100% custody)');
}

main().catch(console.error);
