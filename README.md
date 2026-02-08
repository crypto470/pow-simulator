# PoW Simulator (Pure Node.js)

A simple Proof-of-Work blockchain simulator written in pure Node.js (no external libraries).

## Features
- Builds a simple blockchain (blocks linked by previous hash)
- Hashing with SHA-256
- Mining by changing nonce until hash has leading zeros
- Mining difficulty (number of leading zeros)
- Dynamic difficulty adjustment to target a desired block time

## Run
```bash
npm start
