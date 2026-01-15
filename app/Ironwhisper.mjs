import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import axios from "axios";
import fs from "node:fs";
import { createPublicClient, createWalletClient, custom, formatEther, http, isAddress } from "viem";
import { baseSepolia } from "viem/chains";

const NET = {
  name: "Base Sepolia",
  chainId: 84532,
  rpcUrl: "https://sepolia.base.org",
  explorer: "https://sepolia.basescan.org",
};

const linkAddress = (a) => `${NET.explorer}/address/${a}`;
const linkBlock = (b) => `${NET.explorer}/block/${b}`;
const linkCode = (a) => `${NET.explorer}/address/${a}#code`;
const short = (a) => `${a.slice(0, 6)}...${a.slice(-4)}`;

function readJson(path, fallback) {
  try {
    return JSON.parse(fs.readFileSync(path, "utf8"));
  } catch {
    return fallback;
  }
}

function ensureDir(path) {
  fs.mkdirSync(path, { recursive: true });
}

async function rpcChainId() {
  const payload = { jsonrpc: "2.0", id: 1, method: "eth_chainId", params: [] };
  const res = await axios.post(NET.rpcUrl, payload, { timeout: 9000 });
  return res?.data?.result ?? null;
}

async function safeWalletAddresses(walletClient) {
  try {
    return await walletClient.getAddresses();
  } catch {
    return [];
  }
}

export async function run() {
  console.log("Built for Base");
  console.log(`network: ${NET.name}`);
  console.log(`chainId (decimal): ${NET.chainId}`);
  console.log(`explorer: ${NET.explorer}`);
  console.log("");

  console.log("rpc identity:");
  try {
    console.log(`- eth_chainId: ${await rpcChainId()}`);
  } catch (e) {
    console.log(`- rpc probe failed: ${e?.message || String(e)}`);
  }
  console.log("");

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

  if (addresses.length) {
    console.log("wallet balances:");
    for (const a of addresses) {
      const bal = await publicClient.getBalance({ address: a });
      console.log(`- ${short(a)}: ${formatEther(bal)} ETH`);
      console.log(`  ${linkAddress(a)}`);
    }
  } else {
    console.log("wallet balances: skipped (no addresses available)");
  }
  console.log("");

  const latest = await publicClient.getBlockNumber();
  const block = await publicClient.getBlock({ blockNumber: latest });
  const gasPrice = await publicClient.getGasPrice();

  console.log("block and gas:");
  console.log(`- latest block: ${latest.toString()}`);
  console.log(`  ${linkBlock(latest.toString())}`);
  console.log(`- timestamp: ${new Date(Number(block.timestamp) * 1000).toISOString()}`);
  console.log(`- gas price gwei: ${(Number(gasPrice) / 1e9).toFixed(3)}`);
  console.log("");

  console.log("bytecode checks:");
  for (const t of targets) {
    if (!isAddress(t)) continue;
    const code = await publicClient.getBytecode({ address: t });
    const has = !!code && code !== "0x";
    console.log(`- ${short(t)}: ${has ? "bytecode found" : "no bytecode"}`);
    console.log(`  ${linkCode(t)}`);
  }

  ensureDir("logs");
  fs.appendFileSync("logs/run.log", `[${new Date().toISOString()}] inspect completed\n`);
  console.log("");
  console.log("done");
}

run().catch((e) => console.error(e));
