import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import fs from "node:fs";
import { createPublicClient, createWalletClient, custom, formatEther, http, isAddress } from "viem";
import { baseSepolia } from "viem/chains";

const NET = {
  name: "Base Sepolia",
  chainId: 84532,
  rpcUrl: "https://sepolia.base.org",
  explorer: "https://sepolia.basescan.org",
};

function readJson(path, fallback) {
  try {
    return JSON.parse(fs.readFileSync(path, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJson(path, data) {
  fs.mkdirSync(path.split("/").slice(0, -1).join("/"), { recursive: true });
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

async function safeWalletAddresses(walletClient) {
  try {
    return await walletClient.getAddresses();
  } catch {
    return [];
  }
}

export async function run() {
  const sdk = new CoinbaseWalletSDK({ appName: "Ironwhisper", darkMode: false });
  const provider = sdk.makeWeb3Provider(NET.rpcUrl, NET.chainId);

  const walletClient = createWalletClient({
    chain: baseSepolia,
    transport: custom(provider),
  });

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(NET.rpcUrl),
  });

  const targetsDoc = readJson("inputs/targets.json", { targets: [] });
  const targets = Array.isArray(targetsDoc.targets) ? targetsDoc.targets : [];

  const addresses = await safeWalletAddresses(walletClient);

  const balances = [];
  for (const a of addresses) {
    const bal = await publicClient.getBalance({ address: a });
    balances.push({
      address: a,
      balanceEth: formatEther(bal),
      basescan: `${NET.explorer}/address/${a}`,
    });
  }

  const latest = await publicClient.getBlockNumber();
  const block = await publicClient.getBlock({ blockNumber: latest });
  const gasPrice = await publicClient.getGasPrice();

  const bytecode = [];
  for (const t of targets) {
    if (!isAddress(t)) continue;
    const code = await publicClient.getBytecode({ address: t });
    bytecode.push({
      address: t,
      hasBytecode: !!code && code !== "0x",
      codeLink: `${NET.explorer}/address/${t}#code`,
    });
  }

  const report = {
    builtFor: "Base",
    network: "base-sepolia",
    chainId: NET.chainId,
    explorer: NET.explorer,
    rpcUrl: NET.rpcUrl,
    generatedAt: new Date().toISOString(),
    wallet: { connected: addresses.length > 0, addresses },
    balances,
    chain: {
      latestBlock: latest.toString(),
      blockLink: `${NET.explorer}/block/${latest.toString()}`,
      timestampIso: new Date(Number(block.timestamp) * 1000).toISOString(),
      gasPriceGwei: (Number(gasPrice) / 1e9).toFixed(3),
    },
    bytecode,
  };

  writeJson("reports/latest.json", report);
  fs.mkdirSync("logs", { recursive: true });
  fs.appendFileSync("logs/run.log", `[${report.generatedAt}] wrote reports/latest.json\n`);
  console.log("snapshot written: reports/latest.json");
}

run().catch((e) => {
  fs.mkdirSync("logs", { recursive: true });
  fs.appendFileSync("logs/run.log", `[${new Date().toISOString()}] error: ${e?.message || String(e)}\n`);
  console.error(e);
});
