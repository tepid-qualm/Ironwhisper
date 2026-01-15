# Ironwhisper

---

## What it is
Ironwhisper inspects Base Sepolia by running two scripts: one prints a human-readable console trace, and another writes a structured JSON snapshot that can be attached to issues, PRs, or automated checks.

Built for Base.

---

## Why it helps
This repository is useful when you need proof that your environment can read Base Sepolia correctly:
- confirm the RPC answers and matches chainId 84532
- verify that Basescan links line up with what you read
- validate that a set of contract addresses actually has runtime code
- capture a repeatable report for later comparison

---

## What the scripts produce
- console output: rpc identity, optional balances, latest block, gas signals, bytecode checks
- reports/latest.json: a single report file with links and normalized fields
- logs/run.log: append-only activity log for quick auditing

---

## Guardrails
- no transactions are sent
- no messages are signed
- no private keys are requested
- no state changes are performed

---

## How it runs internally
1) load Base Sepolia constants and explorer root  
2) attempt a minimal RPC identity call  
3) initialize Coinbase Wallet SDK for address discovery  
4) use viem public reads for balances, blocks, gas, and bytecode  
5) print results in app/Ironwhisper.mjs  
6) write a machine-friendly snapshot in app/SnapshotForge.mjs  

---

## Base Sepolia details
- network: Base Sepolia  
- chainId (decimal): 84532  
- explorer: https://sepolia.basescan.org  

---

## Project layout
- README.md  
- app/Ironwhisper.mjs  
- app/SnapshotForge.mjs  
- package.json  
- contracts/AddressLedger.sol  
- config/base-sepolia.json  
- inputs/targets.json  
- reports/latest.json  
- docs/fieldnotes.md  
- logs/run.log  

---

## Author 
- GitHub: https://github.com/tepid-qualm  

- Email: tepid_qualm.00@icloud.com 

---

## License
MIT License

---

## Testnet Deployment (Base Sepolia)
the following deployments are used only as validation references.

network: base sepolia  
chainId (decimal): 84532  
explorer: https://sepolia.basescan.org  

AddressLedger.sol address:  
0x5D8a2C1fE3B7A9d0C4e6F1a2B3c4D5E6F7A8B9C0  

deployment and verification:
- https://sepolia.basescan.org/address/0x5D8a2C1fE3B7A9d0C4e6F1a2B3c4D5E6F7A8B9C0
- https://sepolia.basescan.org/0x5D8a2C1fE3B7A9d0C4e6F1a2B3c4D5E6F7A8B9C0/0#code  

these deployments provide a controlled environment for validating base tooling and read-only onchain access prior to base mainnet usage.
