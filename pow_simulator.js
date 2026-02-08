const crypto = require("crypto");

function sha256(str) {
  return crypto.createHash("sha256").update(str).digest("hex");
}

class Block {
  constructor(index, timestamp, data, prevHash, difficulty) {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.prevHash = prevHash;

    this.nonce = 0;
    this.difficulty = difficulty; // leading zeros
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return sha256(
      `${this.index}|${this.timestamp}|${JSON.stringify(this.data)}|${this.prevHash}|${this.nonce}|${this.difficulty}`
    );
  }

  mine() {
    const target = "0".repeat(this.difficulty);
    const start = Date.now();

    while (!this.hash.startsWith(target)) {
      this.nonce += 1;
      this.hash = this.calculateHash();
    }

    return Date.now() - start;
  }
}

class Blockchain {
  constructor(opts = {}) {
    this.chain = [this.createGenesisBlock()];

    this.targetBlockTimeMs = opts.targetBlockTimeMs ?? 1500;
    this.adjustEvery = opts.adjustEvery ?? 3;

    this.difficulty = opts.initialDifficulty ?? 3;
    this.minDifficulty = opts.minDifficulty ?? 1;
    this.maxDifficulty = opts.maxDifficulty ?? 8;
  }

  createGenesisBlock() {
    const b = new Block(0, Date.now(), { msg: "genesis" }, "0", 1);
    b.hash = b.calculateHash();
    return b;
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(data) {
    const prev = this.getLatestBlock();
    const block = new Block(
      prev.index + 1,
      Date.now(),
      data,
      prev.hash,
      this.difficulty
    );

    const ms = block.mine();
    this.chain.push(block);

    console.log(
      `Mined #${block.index} | diff=${block.difficulty} | nonce=${block.nonce} | time=${ms}ms | hash=${block.hash.slice(
        0,
        18
      )}...`
    );

    this.adjustDifficultyIfNeeded();
  }

  adjustDifficultyIfNeeded() {
    const minedBlocks = this.chain.length - 1; // excluding genesis
    if (minedBlocks <= 0) return;
    if (minedBlocks % this.adjustEvery !== 0) return;

    const last = this.chain.length - 1;
    const first = last - this.adjustEvery;

    const actual = this.chain[last].timestamp - this.chain[first].timestamp;
    const expected = this.targetBlockTimeMs * this.adjustEvery;

    if (actual < expected * 0.75) {
      this.difficulty = Math.min(this.difficulty + 1, this.maxDifficulty);
      console.log(
        `>> Difficulty UP to ${this.difficulty} (actual ${actual}ms, expected ${expected}ms)`
      );
    } else if (actual > expected * 1.25) {
      this.difficulty = Math.max(this.difficulty - 1, this.minDifficulty);
      console.log(
        `>> Difficulty DOWN to ${this.difficulty} (actual ${actual}ms, expected ${expected}ms)`
      );
    } else {
      console.log(
        `>> Difficulty stays ${this.difficulty} (actual ${actual}ms, expected ${expected}ms)`
      );
    }
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const curr = this.chain[i];
      const prev = this.chain[i - 1];

      if (curr.hash !== curr.calculateHash()) return false;
      if (curr.prevHash !== prev.hash) return false;

      const target = "0".repeat(curr.difficulty);
      if (!curr.hash.startsWith(target)) return false;
    }
    return true;
  }
}

// Demo run
const bc = new Blockchain({
  initialDifficulty: 3,
  targetBlockTimeMs: 1500,
  adjustEvery: 3,
  minDifficulty: 1,
  maxDifficulty: 7,
});

console.log("Starting mining...\n");

for (let i = 1; i <= 10; i++) {
  bc.addBlock({ from: "Alice", to: "Bob", amount: i });
}

console.log("\nChain valid?", bc.isChainValid());
console.log("\nFull chain:\n");
console.log(JSON.stringify(bc.chain, null, 2));
