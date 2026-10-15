import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const rpcUrl = 'https://mainnet.base.org';
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  const privateKey = process.env.DEPLOYER_PRIVATE_KEY || '0x3f5f0dc6fba15be6c2f8319c012e084cd7fe619eafd509026398df8d5854c4ec';
  const wallet = new ethers.Wallet(privateKey, provider);
  console.log(`[Watcher] Monitoring deployer address: ${wallet.address} on Base Mainnet...`);

  const userAddress = '0x911763C6557A3696C39890C9472d9F9364cA6646';
  const artifactPath = path.join(__dirname, '../contracts/KarmaKountToken.json');
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

  let deployed = false;

  while (!deployed) {
    try {
      const balance = await provider.getBalance(wallet.address);
      const ethBal = Number(ethers.formatEther(balance));

      if (balance >= ethers.parseEther('0.00005')) {
        console.log(`[Watcher] ⚡ Detected balance of ${ethBal} ETH! Launching deployment immediately...`);

        const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
        console.log(`[Watcher] Deploying KarmaKountToken.sol to Base...`);
        console.log(`[Watcher] Founder (60% / 600M): ${userAddress}`);
        console.log(`[Watcher] Liquidity (20% / 200M): ${userAddress}`);
        console.log(`[Watcher] Game Vault (20% / 200M): ${userAddress}`);

        const contract = await factory.deploy(userAddress, userAddress, userAddress);
        const tx = contract.deploymentTransaction();
        console.log(`[Watcher] Tx broadcasted: https://basescan.org/tx/${tx.hash}`);

        await contract.waitForDeployment();
        const contractAddress = await contract.getAddress();

        console.log(`\n======================================================`);
        console.log(`🎉 SUCCESS! KarmaKountToken DEPLOYED ON BASE MAINNET!`);
        console.log(`Contract: ${contractAddress}`);
        console.log(`Explorer: https://basescan.org/address/${contractAddress}`);
        console.log(`======================================================\n`);

        // Save deployment receipt
        const receiptPath = path.join(__dirname, '../contracts/deployed-contract.json');
        fs.writeFileSync(receiptPath, JSON.stringify({
          network: 'Base Mainnet',
          chainId: 8453,
          token: 'KarmaKountToken ($KARMA)',
          contractAddress,
          txHash: tx.hash,
          owner: userAddress,
          founderBalance: '600,000,000 $KARMA',
          liquidityBalance: '200,000,000 $KARMA',
          gameVaultBalance: '200,000,000 $KARMA',
          deployedAt: new Date().toISOString()
        }, null, 2));

        // Update server/index.ts
        const serverPath = path.join(__dirname, '../server/index.ts');
        if (fs.existsSync(serverPath)) {
          let sCode = fs.readFileSync(serverPath, 'utf8');
          sCode = sCode.replace(/CONTRACT_ADDRESS\s*=\s*['"][^'"]*['"]/, `CONTRACT_ADDRESS = '${contractAddress}'`);
          fs.writeFileSync(serverPath, sCode);
          console.log(`[Watcher] Updated server/index.ts with contract address`);
        }

        // Update TokenomicsModal.tsx
        const modalPath = path.join(__dirname, '../src/components/TokenomicsModal.tsx');
        if (fs.existsSync(modalPath)) {
          let mCode = fs.readFileSync(modalPath, 'utf8');
          mCode = mCode.replace(/0x[a-fA-F0-9]{40}/g, (match) => {
            if (match.toLowerCase() === '0x911763c6557a3696c39890c9472d9f9364ca6646') return match;
            return contractAddress;
          });
          fs.writeFileSync(modalPath, mCode);
          console.log(`[Watcher] Updated TokenomicsModal.tsx with contract address`);
        }

        deployed = true;
        break;
      }
    } catch (err) {
      console.error(`[Watcher] Error during poll:`, err.message || err);
    }

    await new Promise((r) => setTimeout(r, 3000));
  }
}

main().catch(console.error);
