"use strict";var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;var _assert = _interopRequireDefault(require("assert"));
var _GenUtils = _interopRequireDefault(require("../../common/GenUtils"));

var _MoneroOutput = _interopRequireDefault(require("./MoneroOutput"));

/**
 * Represents a transaction on the Monero network.
 */
class MoneroTx {

  static DEFAULT_PAYMENT_ID = "0000000000000000";







































  constructor(tx) {
    Object.assign(this, tx);
    this.block = undefined;

    // deserialize extra
    if (this.extra !== undefined) this.extra = new Uint8Array(this.extra);

    // deserialize bigints
    if (this.fee !== undefined && typeof this.fee !== "bigint") this.fee = BigInt(this.fee);
    if (this.unlockTime !== undefined && typeof this.unlockTime !== "bigint") this.unlockTime = BigInt(this.unlockTime);

    // copy inputs
    if (this.inputs) {
      this.inputs = this.inputs.slice();
      for (let i = 0; i < this.inputs.length; i++) {
        this.inputs[i] = new _MoneroOutput.default(this.inputs[i]).setTx(this);
      }
    }

    // copy outputs
    if (this.outputs) {
      this.outputs = this.outputs.slice();
      for (let i = 0; i < this.outputs.length; i++) {
        this.outputs[i] = new _MoneroOutput.default(this.outputs[i]).setTx(this);
      }
    }
  }

  /**
   * @return {MoneroBlock} tx block
   */
  getBlock() {
    return this.block;
  }

  /**
   * @param {MoneroBlock} block - tx block
   * @return {MoneroTx} this tx for chaining
   */
  setBlock(block) {
    this.block = block;
    return this;
  }

  /**
   * @return {number} tx height
   */
  getHeight() {
    return this.getBlock() === undefined ? undefined : this.getBlock().getHeight();
  }

  /**
   * @return {string} tx hash
   */
  getHash() {
    return this.hash;
  }

  /**
   * @param {string} hash - tx hash
   * @return {MoneroTx} this tx for chaining
   */
  setHash(hash) {
    this.hash = hash;
    return this;
  }

  /**
   * @return {number} tx version
   */
  getVersion() {
    return this.version;
  }

  /**
   * @param {number} version - tx version
   * @return {MoneroTx} this tx for chaining
   */
  setVersion(version) {
    this.version = version;
    return this;
  }

  /**
   * @return {boolean} true if the tx is a miner tx, false otherwise
   */
  getIsMinerTx() {
    return this.isMinerTx;
  }

  /**
   * @param {boolean} miner - true if the tx is a miner tx, false otherwise
   * @return {MoneroTx} this tx for chaining
   */
  setIsMinerTx(miner) {
    this.isMinerTx = miner;
    return this;
  }

  /**
   * @return {string} tx payment id
   */
  getPaymentId() {
    return this.paymentId;
  }

  /**
   * @param {string} paymentId - tx payment id
   * @return {MoneroTx} this tx for chaining
   */
  setPaymentId(paymentId) {
    this.paymentId = paymentId;
    return this;
  }

  /**
   * @return {bigint} tx fee
   */
  getFee() {
    return this.fee;
  }

  /**
   * @param {bigint} fee - tx fee
   * @return {MoneroTx} this tx for chaining
   */
  setFee(fee) {
    this.fee = fee;
    return this;
  }

  /**
   * @return {number} tx ring size
   */
  getRingSize() {
    return this.ringSize;
  }

  /**
   * @param {number} ringSize - tx ring size
   * @return {MoneroTx} this tx for chaining
   */
  setRingSize(ringSize) {
    this.ringSize = ringSize;
    return this;
  }

  /**
   * @return {boolean} true if the tx is set to be relayed, false otherwise
   */
  getRelay() {
    return this.relay;
  }

  /**
   * @param {boolean} relay - true if the tx is set to be relayed, false otherwise
   * @return {MoneroTx} this tx for chaining
   */
  setRelay(relay) {
    this.relay = relay;
    return this;
  }

  /**
   * @return {boolean} true if the tx is relayed, false otherwise
   */
  getIsRelayed() {
    return this.isRelayed;
  }

  /**
   * @param {boolean} isRelayed - true if the tx is relayed, false otherwise
   * @return {MoneroTx} this tx for chaining
   */
  setIsRelayed(isRelayed) {
    this.isRelayed = isRelayed;
    return this;
  }

  /**
   * @return {boolean} true if the tx is confirmed, false otherwise
   */
  getIsConfirmed() {
    return this.isConfirmed;
  }

  /**
   * @param {boolean} isConfirmed - true if the tx is confirmed, false otherwise
   * @return {MoneroTx} this tx for chaining
   */
  setIsConfirmed(isConfirmed) {
    this.isConfirmed = isConfirmed;
    return this;
  }

  /**
   * @return {boolean} true if the tx is in the memory pool, false otherwise
   */
  getInTxPool() {
    return this.inTxPool;
  }

  /**
   * @param {boolean} inTxPool - true if the tx is in the memory pool, false otherwise
   * @return {MoneroTx} this tx for chaining
   */
  setInTxPool(inTxPool) {
    this.inTxPool = inTxPool;
    return this;
  }

  /**
   * @return {number} number of block confirmations
   */
  getNumConfirmations() {
    return this.numConfirmations;
  }

  /**
   * @param {number} numConfirmations - number of block confirmations
   * @return {MoneroTx} this tx for chaining
   */
  setNumConfirmations(numConfirmations) {
    this.numConfirmations = numConfirmations;
    return this;
  }

  /**
   * Get the minimum height or timestamp for the transactions to unlock.
   * 
   * @return {bigint} the minimum height or timestamp for the transaction to unlock
   */
  getUnlockTime() {
    return this.unlockTime;
  }

  setUnlockTime(unlockTime) {
    if (unlockTime !== undefined && typeof unlockTime !== "bigint") unlockTime = BigInt(unlockTime);
    this.unlockTime = unlockTime;
    return this;
  }

  /**
   * @return {number} timestamp the tx was last relayed from the node
   */
  getLastRelayedTimestamp() {
    return this.lastRelayedTimestamp;
  }

  /**
   * @param {number} lastRelayedTimestamp - timestamp the tx was last relayed from the node
   * @return {MoneroTx} this tx for chaining
   */
  setLastRelayedTimestamp(lastRelayedTimestamp) {
    this.lastRelayedTimestamp = lastRelayedTimestamp;
    return this;
  }

  /**
   * @return {number} timestamp the tx was received at the node
   */
  getReceivedTimestamp() {
    return this.receivedTimestamp;
  }

  /**
   * @param {number} receivedTimestamp - timestamp the tx was received at the node
   * @return {MoneroTx} this tx for chaining
   */
  setReceivedTimestamp(receivedTimestamp) {
    this.receivedTimestamp = receivedTimestamp;
    return this;
  }

  /**
   * @return {boolean} true if a double spend has been seen, false otherwise
   */
  getIsDoubleSpendSeen() {
    return this.isDoubleSpendSeen;
  }

  /**
   * @param {boolean} isDoubleSpendSeen - true if a double spend has been seen, false otherwise
   * @return {MoneroTx} this tx for chaining
   */
  setIsDoubleSpendSeen(isDoubleSpendSeen) {
    this.isDoubleSpendSeen = isDoubleSpendSeen;
    return this;
  }

  /**
   * @return {string} tx key
   */
  getKey() {
    return this.key;
  }

  /**
   * @param {string} key - tx key
   * @return {MoneroTx} this tx for chaining
   */
  setKey(key) {
    this.key = key;
    return this;
  }

  /**
   * Get full transaction hex. Full hex = pruned hex + prunable hex.
   * 
   * @return {string} full tx hex
   */
  getFullHex() {
    return this.fullHex;
  }

  /**
   * @param {string} fullHex - full tx hex
   * @return {MoneroTx} this tx for chaining
   */
  setFullHex(fullHex) {
    this.fullHex = fullHex;
    return this;
  }

  /**
   * Get pruned transaction hex. Full hex = pruned hex + prunable hex.
   * 
   * @return {string} pruned tx hex
   */
  getPrunedHex() {
    return this.prunedHex;
  }

  /**
   * @param {string} prunedHex - pruned tx hex
   * @return {MoneroTx} this tx for chaining
   */
  setPrunedHex(prunedHex) {
    this.prunedHex = prunedHex;
    return this;
  }

  /**
   * Get prunable transaction hex which is hex that is removed from a pruned
   * transaction. Full hex = pruned hex + prunable hex.
   * 
   * @return {string} prunable tx hex
   */
  getPrunableHex() {
    return this.prunableHex;
  }

  /**
   * @param {string} prunableHex - prunable tx hex
   * @return {MoneroTx} this tx for chaining
   */
  setPrunableHex(prunableHex) {
    this.prunableHex = prunableHex;
    return this;
  }

  /**
   * @return {string} prunable tx hash
   */
  getPrunableHash() {
    return this.prunableHash;
  }

  /**
   * @param {string} prunableHash - prunable tx hash
   * @return {MoneroTx} this tx for chaining
   */
  setPrunableHash(prunableHash) {
    this.prunableHash = prunableHash;
    return this;
  }

  /**
   * @return {number} tx size
   */
  getSize() {
    return this.size;
  }

  /**
   * @param {number} size - tx size
   * @return {MoneroTx} this tx for chaining
   */
  setSize(size) {
    this.size = size;
    return this;
  }

  /**
   * @return {number} tx weight
   */
  getWeight() {
    return this.weight;
  }

  /**
   * @param {number} weight - tx weight
   * @return {MoneroTx} this tx for chaining
   */
  setWeight(weight) {
    this.weight = weight;
    return this;
  }

  /**
   * @return {MoneroOutput[]} tx inputs
   */
  getInputs() {
    return this.inputs;
  }

  /**
   * @param {MoneroOutput[]} - tx inputs
   * @return {MoneroTx} this tx for chaining
   */
  setInputs(inputs) {
    this.inputs = inputs;
    return this;
  }

  /**
   * @return {MoneroOutput[]} tx outputs
   */
  getOutputs() {
    return this.outputs;
  }

  /**
   * @param {MoneroOutput[]} outputs - tx outputs
   * @return {MoneroTx} this tx for chaining
   */
  setOutputs(outputs) {
    this.outputs = outputs;
    return this;
  }

  /**
   * @return {number[]} tx output indices
   */
  getOutputIndices() {
    return this.outputIndices;
  }

  /**
   * @param {number[]} outputIndices - tx output indices
   * @return {MoneroTx} this tx for chaining
   */
  setOutputIndices(outputIndices) {
    this.outputIndices = outputIndices;
    return this;
  }

  /**
   * @return {string} tx metadata
   */
  getMetadata() {
    return this.metadata;
  }

  /**
   * @param {string} metadata - tx metadata
   * @return {MoneroTx} this tx for chaining
   */
  setMetadata(metadata) {
    this.metadata = metadata;
    return this;
  }

  /**
   * @return {Uint8Array} tx extra
   */
  getExtra() {
    return this.extra;
  }

  /**
   * @param {Uint8Array} extra - tx extra
   * @return {MoneroTx} this tx for chaining
   */
  setExtra(extra) {
    this.extra = extra;
    return this;
  }

  /**
   * @return {any} RCT signatures
   */
  getRctSignatures() {
    return this.rctSignatures;
  }

  /**
   * @param {any} rctSignatures - RCT signatures
   * @return {MoneroTx} this tx for chaining
   */
  setRctSignatures(rctSignatures) {
    this.rctSignatures = rctSignatures;
    return this;
  }

  /**
   * @return {any} prunable RCT signature data
   */
  getRctSigPrunable() {
    return this.rctSigPrunable;
  }

  /**
   * @param {any} rctSigPrunable - prunable RCT signature data
   * @return {MoneroTx} this tx for chaining
   */
  setRctSigPrunable(rctSigPrunable) {
    this.rctSigPrunable = rctSigPrunable;
    return this;
  }

  /**
   * @return {boolean} true if kept by a block, false otherwise
   */
  getIsKeptByBlock() {
    return this.isKeptByBlock;
  }

  /**
   * @param {boolean} isKeptByBlock - true if kept by a block, false otherwise
   * @return {MoneroTx} this tx for chaining
   */
  setIsKeptByBlock(isKeptByBlock) {
    this.isKeptByBlock = isKeptByBlock;
    return this;
  }

  /**
   * @return {boolean} true if the tx failed, false otherwise
   */
  getIsFailed() {
    return this.isFailed;
  }

  /**
   * @param {boolean} isFailed - true if the tx failed, false otherwise
   * @return {MoneroTx} this tx for chaining
   */
  setIsFailed(isFailed) {
    this.isFailed = isFailed;
    return this;
  }

  /**
   * @return {number} block height of the last tx failure
   */
  getLastFailedHeight() {
    return this.lastFailedHeight;
  }

  /**
   * @param {number} lastFailedHeight - block height of the last tx failure
   * @return {MoneroTx} this tx for chaining
   */
  setLastFailedHeight(lastFailedHeight) {
    this.lastFailedHeight = lastFailedHeight;
    return this;
  }

  /**
   * @return {string} block hash of the last tx failure
   */
  getLastFailedHash() {
    return this.lastFailedHash;
  }

  /**
   * @param {string} lastFailedHash - block hash of the last tx failure
   * @return {MoneroTx} this tx for chaining
   */
  setLastFailedHash(lastFailedHash) {
    this.lastFailedHash = lastFailedHash;
    return this;
  }

  /**
   * @return {number} max used block height
   */
  getMaxUsedBlockHeight() {
    return this.maxUsedBlockHeight;
  }

  /**
   * @param {number} maxUsedBlockHeight - max used block height
   * @return {MoneroTx} this tx for chaining
   */
  setMaxUsedBlockHeight(maxUsedBlockHeight) {
    this.maxUsedBlockHeight = maxUsedBlockHeight;
    return this;
  }

  /**
   * @return {string} max used block hash
   */
  getMaxUsedBlockHash() {
    return this.maxUsedBlockHash;
  }

  /**
   * @param {string} maxUsedBlockHash - max used block hash
   * @return {MoneroTx} this tx for chaining
   */
  setMaxUsedBlockHash(maxUsedBlockHash) {
    this.maxUsedBlockHash = maxUsedBlockHash;
    return this;
  }

  /**
   * @return {string[]} tx signatures
   */
  getSignatures() {
    return this.signatures;
  }

  /**
   * @param {string[]} signatures - tx signatures
   * @return {MoneroTx} this tx for chaining
   */
  setSignatures(signatures) {
    this.signatures = signatures;
    return this;
  }

  /**
   * @return {MoneroTx} a copy of this tx
   */
  copy() {
    return new MoneroTx(this);
  }

  /**
   * @return {any} json representation of this tx
   */
  toJson() {
    let json = Object.assign({}, this);
    if (this.getFee() !== undefined) json.fee = this.getFee().toString();
    if (this.getUnlockTime() !== undefined) json.unlockTime = this.getUnlockTime().toString();
    if (this.getInputs()) {
      json.inputs = [];
      for (let input of this.getInputs()) json.inputs.push(input.toJson());
    }
    if (this.getOutputs()) {
      json.outputs = [];
      for (let output of this.getOutputs()) json.outputs.push(output.toJson());
    }
    if (this.getExtra() !== undefined) json.extra = Array.from(this.getExtra(), (byte) => byte);
    delete json.block; // do not serialize parent block
    return json;
  }

  /**
   * Updates this transaction by merging the latest information from the given
   * transaction.
   * 
   * @param {MoneroTx} tx - the transaction to update this transaction with
   * @return {MoneroTx} this for method chaining
   */
  merge(tx) {
    (0, _assert.default)(tx instanceof MoneroTx);
    if (this === tx) return this;

    // merge blocks if they're different
    if (this.getBlock() !== tx.getBlock()) {
      if (this.getBlock() === undefined) {
        this.setBlock(tx.getBlock());
        this.getBlock().getTxs[this.getBlock().getTxs().indexOf(tx)] = this; // update block to point to this tx
      } else if (tx.getBlock() !== undefined) {
        this.getBlock().merge(tx.getBlock()); // comes back to merging txs
        return this;
      }
    }

    // otherwise merge tx fields
    this.setHash(_GenUtils.default.reconcile(this.getHash(), tx.getHash()));
    this.setVersion(_GenUtils.default.reconcile(this.getVersion(), tx.getVersion()));
    this.setPaymentId(_GenUtils.default.reconcile(this.getPaymentId(), tx.getPaymentId()));
    this.setFee(_GenUtils.default.reconcile(this.getFee(), tx.getFee()));
    this.setRingSize(_GenUtils.default.reconcile(this.getRingSize(), tx.getRingSize()));
    this.setIsConfirmed(_GenUtils.default.reconcile(this.getIsConfirmed(), tx.getIsConfirmed(), { resolveTrue: true })); // tx can become confirmed
    this.setIsMinerTx(_GenUtils.default.reconcile(this.getIsMinerTx(), tx.getIsMinerTx()));
    this.setRelay(_GenUtils.default.reconcile(this.getRelay(), tx.getRelay(), { resolveTrue: true })); // tx can become relayed
    this.setIsRelayed(_GenUtils.default.reconcile(this.getIsRelayed(), tx.getIsRelayed(), { resolveTrue: true })); // tx can become relayed
    this.setIsDoubleSpendSeen(_GenUtils.default.reconcile(this.getIsDoubleSpendSeen(), tx.getIsDoubleSpendSeen(), { resolveTrue: true })); // double spend can become seen
    this.setKey(_GenUtils.default.reconcile(this.getKey(), tx.getKey()));
    this.setFullHex(_GenUtils.default.reconcile(this.getFullHex(), tx.getFullHex()));
    this.setPrunedHex(_GenUtils.default.reconcile(this.getPrunedHex(), tx.getPrunedHex()));
    this.setPrunableHex(_GenUtils.default.reconcile(this.getPrunableHex(), tx.getPrunableHex()));
    this.setPrunableHash(_GenUtils.default.reconcile(this.getPrunableHash(), tx.getPrunableHash()));
    this.setSize(_GenUtils.default.reconcile(this.getSize(), tx.getSize()));
    this.setWeight(_GenUtils.default.reconcile(this.getWeight(), tx.getWeight()));
    this.setOutputIndices(_GenUtils.default.reconcile(this.getOutputIndices(), tx.getOutputIndices()));
    this.setMetadata(_GenUtils.default.reconcile(this.getMetadata(), tx.getMetadata()));
    this.setExtra(_GenUtils.default.reconcile(this.getExtra(), tx.getExtra()));
    this.setRctSignatures(_GenUtils.default.reconcile(this.getRctSignatures(), tx.getRctSignatures()));
    this.setRctSigPrunable(_GenUtils.default.reconcile(this.getRctSigPrunable(), tx.getRctSigPrunable()));
    this.setIsKeptByBlock(_GenUtils.default.reconcile(this.getIsKeptByBlock(), tx.getIsKeptByBlock()));
    this.setIsFailed(_GenUtils.default.reconcile(this.getIsFailed(), tx.getIsFailed(), { resolveTrue: true }));
    this.setLastFailedHeight(_GenUtils.default.reconcile(this.getLastFailedHeight(), tx.getLastFailedHeight()));
    this.setLastFailedHash(_GenUtils.default.reconcile(this.getLastFailedHash(), tx.getLastFailedHash()));
    this.setMaxUsedBlockHeight(_GenUtils.default.reconcile(this.getMaxUsedBlockHeight(), tx.getMaxUsedBlockHeight()));
    this.setMaxUsedBlockHash(_GenUtils.default.reconcile(this.getMaxUsedBlockHash(), tx.getMaxUsedBlockHash()));
    this.setSignatures(_GenUtils.default.reconcile(this.getSignatures(), tx.getSignatures()));
    this.setUnlockTime(_GenUtils.default.reconcile(this.getUnlockTime(), tx.getUnlockTime()));
    this.setNumConfirmations(_GenUtils.default.reconcile(this.getNumConfirmations(), tx.getNumConfirmations(), { resolveMax: true })); // num confirmations can increase

    // merge inputs
    if (tx.getInputs()) {
      for (let merger of tx.getInputs()) {
        let merged = false;
        merger.setTx(this);
        if (!this.getInputs()) this.setInputs([]);
        for (let mergee of this.getInputs()) {
          if (mergee.getKeyImage().getHex() === merger.getKeyImage().getHex()) {
            mergee.merge(merger);
            merged = true;
            break;
          }
        }
        if (!merged) this.getInputs().push(merger);
      }
    }

    // merge outputs
    if (tx.getOutputs()) {
      for (let output of tx.getOutputs()) output.setTx(this);
      if (!this.getOutputs()) this.setOutputs(tx.getOutputs());else
      {

        // merge outputs if key image or stealth public key present, otherwise append
        for (let merger of tx.getOutputs()) {
          let merged = false;
          merger.setTx(this);
          for (let mergee of this.getOutputs()) {
            if (merger.getKeyImage() && mergee.getKeyImage().getHex() === merger.getKeyImage().getHex() ||
            merger.getStealthPublicKey() && mergee.getStealthPublicKey() === merger.getStealthPublicKey()) {
              mergee.merge(merger);
              merged = true;
              break;
            }
          }
          if (!merged) this.getOutputs().push(merger); // append output
        }
      }
    }

    // handle unrelayed -> relayed -> confirmed
    if (this.getIsConfirmed()) {
      this.setInTxPool(false);
      this.setReceivedTimestamp(undefined);
      this.setLastRelayedTimestamp(undefined);
    } else {
      this.setInTxPool(_GenUtils.default.reconcile(this.getInTxPool(), tx.getInTxPool(), { resolveTrue: true })); // unrelayed -> tx pool
      this.setReceivedTimestamp(_GenUtils.default.reconcile(this.getReceivedTimestamp(), tx.getReceivedTimestamp(), { resolveMax: false })); // take earliest receive time
      this.setLastRelayedTimestamp(_GenUtils.default.reconcile(this.getLastRelayedTimestamp(), tx.getLastRelayedTimestamp(), { resolveMax: true })); // take latest relay time
    }

    return this; // for chaining
  }

  /**
   * @param {number} [indent] - starting indentation
   * @return {string} string representation of this tx
   */
  toString(indent = 0) {
    let str = "";
    str += _GenUtils.default.getIndent(indent) + "=== TX ===\n";
    str += _GenUtils.default.kvLine("Tx hash", this.getHash(), indent);
    str += _GenUtils.default.kvLine("Height", this.getHeight(), indent);
    str += _GenUtils.default.kvLine("Version", this.getVersion(), indent);
    str += _GenUtils.default.kvLine("Is miner tx", this.getIsMinerTx(), indent);
    str += _GenUtils.default.kvLine("Payment ID", this.getPaymentId(), indent);
    str += _GenUtils.default.kvLine("Fee", this.getFee(), indent);
    str += _GenUtils.default.kvLine("Ring size", this.getRingSize(), indent);
    str += _GenUtils.default.kvLine("Relay", this.getRelay(), indent);
    str += _GenUtils.default.kvLine("Is relayed", this.getIsRelayed(), indent);
    str += _GenUtils.default.kvLine("Is confirmed", this.getIsConfirmed(), indent);
    str += _GenUtils.default.kvLine("In tx pool", this.getInTxPool(), indent);
    str += _GenUtils.default.kvLine("Num confirmations", this.getNumConfirmations(), indent);
    str += _GenUtils.default.kvLine("Unlock time", this.getUnlockTime(), indent);
    str += _GenUtils.default.kvLine("Last relayed time", this.getLastRelayedTimestamp(), indent);
    str += _GenUtils.default.kvLine("Received time", this.getReceivedTimestamp(), indent);
    str += _GenUtils.default.kvLine("Is double spend", this.getIsDoubleSpendSeen(), indent);
    str += _GenUtils.default.kvLine("Key", this.getKey(), indent);
    str += _GenUtils.default.kvLine("Full hex", this.getFullHex(), indent);
    str += _GenUtils.default.kvLine("Pruned hex", this.getPrunedHex(), indent);
    str += _GenUtils.default.kvLine("Prunable hex", this.getPrunableHex(), indent);
    str += _GenUtils.default.kvLine("Prunable hash", this.getPrunableHash(), indent);
    str += _GenUtils.default.kvLine("Size", this.getSize(), indent);
    str += _GenUtils.default.kvLine("Weight", this.getWeight(), indent);
    str += _GenUtils.default.kvLine("Output indices", this.getOutputIndices(), indent);
    str += _GenUtils.default.kvLine("Metadata", this.getMetadata(), indent);
    str += _GenUtils.default.kvLine("Extra", this.getExtra(), indent);
    str += _GenUtils.default.kvLine("RCT signatures", this.getRctSignatures(), indent);
    str += _GenUtils.default.kvLine("RCT sig prunable", this.getRctSigPrunable(), indent);
    str += _GenUtils.default.kvLine("Kept by block", this.getIsKeptByBlock(), indent);
    str += _GenUtils.default.kvLine("Is failed", this.getIsFailed(), indent);
    str += _GenUtils.default.kvLine("Last failed height", this.getLastFailedHeight(), indent);
    str += _GenUtils.default.kvLine("Last failed hash", this.getLastFailedHash(), indent);
    str += _GenUtils.default.kvLine("Max used block height", this.getMaxUsedBlockHeight(), indent);
    str += _GenUtils.default.kvLine("Max used block hash", this.getMaxUsedBlockHash(), indent);
    str += _GenUtils.default.kvLine("Signatures", this.getSignatures(), indent);
    if (this.getInputs() !== undefined) {
      str += _GenUtils.default.kvLine("Inputs", "", indent);
      for (let i = 0; i < this.getInputs().length; i++) {
        str += _GenUtils.default.kvLine(i + 1, "", indent + 1);
        str += this.getInputs()[i].toString(indent + 2);
        str += '\n';
      }
    }
    if (this.getOutputs() !== undefined) {
      str += _GenUtils.default.kvLine("Outputs", "", indent);
      for (let i = 0; i < this.getOutputs().length; i++) {
        str += _GenUtils.default.kvLine(i + 1, "", indent + 1);
        str += this.getOutputs()[i].toString(indent + 2);
        str += '\n';
      }
    }
    return str.slice(0, str.length - 1); // strip last newline
  }
}exports.default = MoneroTx;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfYXNzZXJ0IiwiX2ludGVyb3BSZXF1aXJlRGVmYXVsdCIsInJlcXVpcmUiLCJfR2VuVXRpbHMiLCJfTW9uZXJvT3V0cHV0IiwiTW9uZXJvVHgiLCJERUZBVUxUX1BBWU1FTlRfSUQiLCJjb25zdHJ1Y3RvciIsInR4IiwiT2JqZWN0IiwiYXNzaWduIiwiYmxvY2siLCJ1bmRlZmluZWQiLCJleHRyYSIsIlVpbnQ4QXJyYXkiLCJmZWUiLCJCaWdJbnQiLCJ1bmxvY2tUaW1lIiwiaW5wdXRzIiwic2xpY2UiLCJpIiwibGVuZ3RoIiwiTW9uZXJvT3V0cHV0Iiwic2V0VHgiLCJvdXRwdXRzIiwiZ2V0QmxvY2siLCJzZXRCbG9jayIsImdldEhlaWdodCIsImdldEhhc2giLCJoYXNoIiwic2V0SGFzaCIsImdldFZlcnNpb24iLCJ2ZXJzaW9uIiwic2V0VmVyc2lvbiIsImdldElzTWluZXJUeCIsImlzTWluZXJUeCIsInNldElzTWluZXJUeCIsIm1pbmVyIiwiZ2V0UGF5bWVudElkIiwicGF5bWVudElkIiwic2V0UGF5bWVudElkIiwiZ2V0RmVlIiwic2V0RmVlIiwiZ2V0UmluZ1NpemUiLCJyaW5nU2l6ZSIsInNldFJpbmdTaXplIiwiZ2V0UmVsYXkiLCJyZWxheSIsInNldFJlbGF5IiwiZ2V0SXNSZWxheWVkIiwiaXNSZWxheWVkIiwic2V0SXNSZWxheWVkIiwiZ2V0SXNDb25maXJtZWQiLCJpc0NvbmZpcm1lZCIsInNldElzQ29uZmlybWVkIiwiZ2V0SW5UeFBvb2wiLCJpblR4UG9vbCIsInNldEluVHhQb29sIiwiZ2V0TnVtQ29uZmlybWF0aW9ucyIsIm51bUNvbmZpcm1hdGlvbnMiLCJzZXROdW1Db25maXJtYXRpb25zIiwiZ2V0VW5sb2NrVGltZSIsInNldFVubG9ja1RpbWUiLCJnZXRMYXN0UmVsYXllZFRpbWVzdGFtcCIsImxhc3RSZWxheWVkVGltZXN0YW1wIiwic2V0TGFzdFJlbGF5ZWRUaW1lc3RhbXAiLCJnZXRSZWNlaXZlZFRpbWVzdGFtcCIsInJlY2VpdmVkVGltZXN0YW1wIiwic2V0UmVjZWl2ZWRUaW1lc3RhbXAiLCJnZXRJc0RvdWJsZVNwZW5kU2VlbiIsImlzRG91YmxlU3BlbmRTZWVuIiwic2V0SXNEb3VibGVTcGVuZFNlZW4iLCJnZXRLZXkiLCJrZXkiLCJzZXRLZXkiLCJnZXRGdWxsSGV4IiwiZnVsbEhleCIsInNldEZ1bGxIZXgiLCJnZXRQcnVuZWRIZXgiLCJwcnVuZWRIZXgiLCJzZXRQcnVuZWRIZXgiLCJnZXRQcnVuYWJsZUhleCIsInBydW5hYmxlSGV4Iiwic2V0UHJ1bmFibGVIZXgiLCJnZXRQcnVuYWJsZUhhc2giLCJwcnVuYWJsZUhhc2giLCJzZXRQcnVuYWJsZUhhc2giLCJnZXRTaXplIiwic2l6ZSIsInNldFNpemUiLCJnZXRXZWlnaHQiLCJ3ZWlnaHQiLCJzZXRXZWlnaHQiLCJnZXRJbnB1dHMiLCJzZXRJbnB1dHMiLCJnZXRPdXRwdXRzIiwic2V0T3V0cHV0cyIsImdldE91dHB1dEluZGljZXMiLCJvdXRwdXRJbmRpY2VzIiwic2V0T3V0cHV0SW5kaWNlcyIsImdldE1ldGFkYXRhIiwibWV0YWRhdGEiLCJzZXRNZXRhZGF0YSIsImdldEV4dHJhIiwic2V0RXh0cmEiLCJnZXRSY3RTaWduYXR1cmVzIiwicmN0U2lnbmF0dXJlcyIsInNldFJjdFNpZ25hdHVyZXMiLCJnZXRSY3RTaWdQcnVuYWJsZSIsInJjdFNpZ1BydW5hYmxlIiwic2V0UmN0U2lnUHJ1bmFibGUiLCJnZXRJc0tlcHRCeUJsb2NrIiwiaXNLZXB0QnlCbG9jayIsInNldElzS2VwdEJ5QmxvY2siLCJnZXRJc0ZhaWxlZCIsImlzRmFpbGVkIiwic2V0SXNGYWlsZWQiLCJnZXRMYXN0RmFpbGVkSGVpZ2h0IiwibGFzdEZhaWxlZEhlaWdodCIsInNldExhc3RGYWlsZWRIZWlnaHQiLCJnZXRMYXN0RmFpbGVkSGFzaCIsImxhc3RGYWlsZWRIYXNoIiwic2V0TGFzdEZhaWxlZEhhc2giLCJnZXRNYXhVc2VkQmxvY2tIZWlnaHQiLCJtYXhVc2VkQmxvY2tIZWlnaHQiLCJzZXRNYXhVc2VkQmxvY2tIZWlnaHQiLCJnZXRNYXhVc2VkQmxvY2tIYXNoIiwibWF4VXNlZEJsb2NrSGFzaCIsInNldE1heFVzZWRCbG9ja0hhc2giLCJnZXRTaWduYXR1cmVzIiwic2lnbmF0dXJlcyIsInNldFNpZ25hdHVyZXMiLCJjb3B5IiwidG9Kc29uIiwianNvbiIsInRvU3RyaW5nIiwiaW5wdXQiLCJwdXNoIiwib3V0cHV0IiwiQXJyYXkiLCJmcm9tIiwiYnl0ZSIsIm1lcmdlIiwiYXNzZXJ0IiwiZ2V0VHhzIiwiaW5kZXhPZiIsIkdlblV0aWxzIiwicmVjb25jaWxlIiwicmVzb2x2ZVRydWUiLCJyZXNvbHZlTWF4IiwibWVyZ2VyIiwibWVyZ2VkIiwibWVyZ2VlIiwiZ2V0S2V5SW1hZ2UiLCJnZXRIZXgiLCJnZXRTdGVhbHRoUHVibGljS2V5IiwiaW5kZW50Iiwic3RyIiwiZ2V0SW5kZW50Iiwia3ZMaW5lIiwiZXhwb3J0cyIsImRlZmF1bHQiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi90cy9kYWVtb24vbW9kZWwvTW9uZXJvVHgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGFzc2VydCBmcm9tIFwiYXNzZXJ0XCI7XG5pbXBvcnQgR2VuVXRpbHMgZnJvbSBcIi4uLy4uL2NvbW1vbi9HZW5VdGlsc1wiO1xuaW1wb3J0IE1vbmVyb0Jsb2NrIGZyb20gXCIuL01vbmVyb0Jsb2NrXCI7XG5pbXBvcnQgTW9uZXJvT3V0cHV0IGZyb20gXCIuL01vbmVyb091dHB1dFwiO1xuXG4vKipcbiAqIFJlcHJlc2VudHMgYSB0cmFuc2FjdGlvbiBvbiB0aGUgTW9uZXJvIG5ldHdvcmsuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1vbmVyb1R4IHtcblxuICBzdGF0aWMgcmVhZG9ubHkgREVGQVVMVF9QQVlNRU5UX0lEID0gXCIwMDAwMDAwMDAwMDAwMDAwXCI7XG5cbiAgYmxvY2s6IE1vbmVyb0Jsb2NrO1xuICBoYXNoOiBzdHJpbmc7XG4gIHZlcnNpb246IG51bWJlcjtcbiAgaXNNaW5lclR4OiBib29sZWFuO1xuICBwYXltZW50SWQ6IHN0cmluZztcbiAgZmVlOiBiaWdpbnQ7XG4gIHJpbmdTaXplOiBudW1iZXI7XG4gIHJlbGF5OiBib29sZWFuO1xuICBpc1JlbGF5ZWQ6IGJvb2xlYW47XG4gIGlzQ29uZmlybWVkOiBib29sZWFuO1xuICBpblR4UG9vbDogYm9vbGVhbjtcbiAgbnVtQ29uZmlybWF0aW9uczogbnVtYmVyO1xuICB1bmxvY2tUaW1lOiBiaWdpbnQ7XG4gIGxhc3RSZWxheWVkVGltZXN0YW1wOiBudW1iZXI7XG4gIHJlY2VpdmVkVGltZXN0YW1wOiBudW1iZXI7XG4gIGlzRG91YmxlU3BlbmRTZWVuOiBib29sZWFuO1xuICBrZXk6IHN0cmluZztcbiAgZnVsbEhleDogc3RyaW5nO1xuICBwcnVuZWRIZXg6IHN0cmluZztcbiAgcHJ1bmFibGVIZXg6IHN0cmluZztcbiAgcHJ1bmFibGVIYXNoOiBzdHJpbmc7XG4gIHNpemU6IG51bWJlcjtcbiAgd2VpZ2h0OiBudW1iZXI7XG4gIGlucHV0czogTW9uZXJvT3V0cHV0W107XG4gIG91dHB1dHM6IE1vbmVyb091dHB1dFtdO1xuICBvdXRwdXRJbmRpY2VzOiBudW1iZXJbXTtcbiAgbWV0YWRhdGE6IHN0cmluZztcbiAgZXh0cmE6IFVpbnQ4QXJyYXk7XG4gIHJjdFNpZ25hdHVyZXM6IGFueTtcbiAgcmN0U2lnUHJ1bmFibGU6IGFueTtcbiAgaXNLZXB0QnlCbG9jazogYm9vbGVhbjtcbiAgaXNGYWlsZWQ6IGJvb2xlYW47XG4gIGxhc3RGYWlsZWRIZWlnaHQ6IG51bWJlcjtcbiAgbGFzdEZhaWxlZEhhc2g6IHN0cmluZztcbiAgbWF4VXNlZEJsb2NrSGVpZ2h0OiBudW1iZXI7XG4gIG1heFVzZWRCbG9ja0hhc2g6IHN0cmluZztcbiAgc2lnbmF0dXJlczogc3RyaW5nW107XG4gIFxuICBjb25zdHJ1Y3Rvcih0eD86IFBhcnRpYWw8TW9uZXJvVHg+KSB7XG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLCB0eCk7XG4gICAgdGhpcy5ibG9jayA9IHVuZGVmaW5lZDtcblxuICAgIC8vIGRlc2VyaWFsaXplIGV4dHJhXG4gICAgaWYgKHRoaXMuZXh0cmEgIT09IHVuZGVmaW5lZCkgdGhpcy5leHRyYSA9IG5ldyBVaW50OEFycmF5KHRoaXMuZXh0cmEpO1xuICAgIFxuICAgIC8vIGRlc2VyaWFsaXplIGJpZ2ludHNcbiAgICBpZiAodGhpcy5mZWUgIT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgdGhpcy5mZWUgIT09IFwiYmlnaW50XCIpIHRoaXMuZmVlID0gQmlnSW50KHRoaXMuZmVlKTtcbiAgICBpZiAodGhpcy51bmxvY2tUaW1lICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIHRoaXMudW5sb2NrVGltZSAhPT0gXCJiaWdpbnRcIikgdGhpcy51bmxvY2tUaW1lID0gQmlnSW50KHRoaXMudW5sb2NrVGltZSk7XG4gICAgXG4gICAgLy8gY29weSBpbnB1dHNcbiAgICBpZiAodGhpcy5pbnB1dHMpIHtcbiAgICAgIHRoaXMuaW5wdXRzID0gdGhpcy5pbnB1dHMuc2xpY2UoKTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5pbnB1dHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdGhpcy5pbnB1dHNbaV0gPSBuZXcgTW9uZXJvT3V0cHV0KHRoaXMuaW5wdXRzW2ldKS5zZXRUeCh0aGlzKTtcbiAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLy8gY29weSBvdXRwdXRzXG4gICAgaWYgKHRoaXMub3V0cHV0cykge1xuICAgICAgdGhpcy5vdXRwdXRzID0gdGhpcy5vdXRwdXRzLnNsaWNlKCk7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMub3V0cHV0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB0aGlzLm91dHB1dHNbaV0gPSBuZXcgTW9uZXJvT3V0cHV0KHRoaXMub3V0cHV0c1tpXSkuc2V0VHgodGhpcyk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIFxuICAvKipcbiAgICogQHJldHVybiB7TW9uZXJvQmxvY2t9IHR4IGJsb2NrXG4gICAqL1xuICBnZXRCbG9jaygpOiBNb25lcm9CbG9jayB7XG4gICAgcmV0dXJuIHRoaXMuYmxvY2s7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBAcGFyYW0ge01vbmVyb0Jsb2NrfSBibG9jayAtIHR4IGJsb2NrXG4gICAqIEByZXR1cm4ge01vbmVyb1R4fSB0aGlzIHR4IGZvciBjaGFpbmluZ1xuICAgKi9cbiAgc2V0QmxvY2soYmxvY2s6IE1vbmVyb0Jsb2NrKTogTW9uZXJvVHgge1xuICAgIHRoaXMuYmxvY2sgPSBibG9jaztcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBcbiAgLyoqXG4gICAqIEByZXR1cm4ge251bWJlcn0gdHggaGVpZ2h0XG4gICAqL1xuICBnZXRIZWlnaHQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5nZXRCbG9jaygpID09PSB1bmRlZmluZWQgPyB1bmRlZmluZWQgOiB0aGlzLmdldEJsb2NrKCkuZ2V0SGVpZ2h0KCk7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtzdHJpbmd9IHR4IGhhc2hcbiAgICovXG4gIGdldEhhc2goKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5oYXNoO1xuICB9XG4gIFxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IGhhc2ggLSB0eCBoYXNoXG4gICAqIEByZXR1cm4ge01vbmVyb1R4fSB0aGlzIHR4IGZvciBjaGFpbmluZ1xuICAgKi9cbiAgc2V0SGFzaChoYXNoOiBzdHJpbmcpOiBNb25lcm9UeCB7XG4gICAgdGhpcy5oYXNoID0gaGFzaDtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBcbiAgLyoqXG4gICAqIEByZXR1cm4ge251bWJlcn0gdHggdmVyc2lvblxuICAgKi9cbiAgZ2V0VmVyc2lvbigpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLnZlcnNpb247XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBAcGFyYW0ge251bWJlcn0gdmVyc2lvbiAtIHR4IHZlcnNpb25cbiAgICogQHJldHVybiB7TW9uZXJvVHh9IHRoaXMgdHggZm9yIGNoYWluaW5nXG4gICAqL1xuICBzZXRWZXJzaW9uKHZlcnNpb246IG51bWJlcik6IE1vbmVyb1R4IHtcbiAgICB0aGlzLnZlcnNpb24gPSB2ZXJzaW9uO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIFxuICAvKipcbiAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgdHggaXMgYSBtaW5lciB0eCwgZmFsc2Ugb3RoZXJ3aXNlXG4gICAqL1xuICBnZXRJc01pbmVyVHgoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaXNNaW5lclR4O1xuICB9XG4gIFxuICAvKipcbiAgICogQHBhcmFtIHtib29sZWFufSBtaW5lciAtIHRydWUgaWYgdGhlIHR4IGlzIGEgbWluZXIgdHgsIGZhbHNlIG90aGVyd2lzZVxuICAgKiBAcmV0dXJuIHtNb25lcm9UeH0gdGhpcyB0eCBmb3IgY2hhaW5pbmdcbiAgICovXG4gIHNldElzTWluZXJUeChtaW5lcjogYm9vbGVhbik6IE1vbmVyb1R4IHtcbiAgICB0aGlzLmlzTWluZXJUeCA9IG1pbmVyO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIFxuICAvKipcbiAgICogQHJldHVybiB7c3RyaW5nfSB0eCBwYXltZW50IGlkXG4gICAqL1xuICBnZXRQYXltZW50SWQoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5wYXltZW50SWQ7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcGF5bWVudElkIC0gdHggcGF5bWVudCBpZFxuICAgKiBAcmV0dXJuIHtNb25lcm9UeH0gdGhpcyB0eCBmb3IgY2hhaW5pbmdcbiAgICovXG4gIHNldFBheW1lbnRJZChwYXltZW50SWQ6IHN0cmluZyk6IE1vbmVyb1R4IHtcbiAgICB0aGlzLnBheW1lbnRJZCA9IHBheW1lbnRJZDtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBcbiAgLyoqXG4gICAqIEByZXR1cm4ge2JpZ2ludH0gdHggZmVlXG4gICAqL1xuICBnZXRGZWUoKTogYmlnaW50IHtcbiAgICByZXR1cm4gdGhpcy5mZWU7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBAcGFyYW0ge2JpZ2ludH0gZmVlIC0gdHggZmVlXG4gICAqIEByZXR1cm4ge01vbmVyb1R4fSB0aGlzIHR4IGZvciBjaGFpbmluZ1xuICAgKi9cbiAgc2V0RmVlKGZlZTogYmlnaW50KTogTW9uZXJvVHgge1xuICAgIHRoaXMuZmVlID0gZmVlO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIFxuICAvKipcbiAgICogQHJldHVybiB7bnVtYmVyfSB0eCByaW5nIHNpemVcbiAgICovXG4gIGdldFJpbmdTaXplKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMucmluZ1NpemU7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBAcGFyYW0ge251bWJlcn0gcmluZ1NpemUgLSB0eCByaW5nIHNpemVcbiAgICogQHJldHVybiB7TW9uZXJvVHh9IHRoaXMgdHggZm9yIGNoYWluaW5nXG4gICAqL1xuICBzZXRSaW5nU2l6ZShyaW5nU2l6ZTogbnVtYmVyKTogTW9uZXJvVHgge1xuICAgIHRoaXMucmluZ1NpemUgPSByaW5nU2l6ZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBcbiAgLyoqXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhlIHR4IGlzIHNldCB0byBiZSByZWxheWVkLCBmYWxzZSBvdGhlcndpc2VcbiAgICovXG4gIGdldFJlbGF5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnJlbGF5O1xuICB9XG4gIFxuICAvKipcbiAgICogQHBhcmFtIHtib29sZWFufSByZWxheSAtIHRydWUgaWYgdGhlIHR4IGlzIHNldCB0byBiZSByZWxheWVkLCBmYWxzZSBvdGhlcndpc2VcbiAgICogQHJldHVybiB7TW9uZXJvVHh9IHRoaXMgdHggZm9yIGNoYWluaW5nXG4gICAqL1xuICBzZXRSZWxheShyZWxheTogYm9vbGVhbik6IE1vbmVyb1R4IHtcbiAgICB0aGlzLnJlbGF5ID0gcmVsYXk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoZSB0eCBpcyByZWxheWVkLCBmYWxzZSBvdGhlcndpc2VcbiAgICovXG4gIGdldElzUmVsYXllZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pc1JlbGF5ZWQ7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzUmVsYXllZCAtIHRydWUgaWYgdGhlIHR4IGlzIHJlbGF5ZWQsIGZhbHNlIG90aGVyd2lzZVxuICAgKiBAcmV0dXJuIHtNb25lcm9UeH0gdGhpcyB0eCBmb3IgY2hhaW5pbmdcbiAgICovXG4gIHNldElzUmVsYXllZChpc1JlbGF5ZWQ6IGJvb2xlYW4pOiBNb25lcm9UeCB7XG4gICAgdGhpcy5pc1JlbGF5ZWQgPSBpc1JlbGF5ZWQ7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoZSB0eCBpcyBjb25maXJtZWQsIGZhbHNlIG90aGVyd2lzZVxuICAgKi9cbiAgZ2V0SXNDb25maXJtZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaXNDb25maXJtZWQ7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzQ29uZmlybWVkIC0gdHJ1ZSBpZiB0aGUgdHggaXMgY29uZmlybWVkLCBmYWxzZSBvdGhlcndpc2VcbiAgICogQHJldHVybiB7TW9uZXJvVHh9IHRoaXMgdHggZm9yIGNoYWluaW5nXG4gICAqL1xuICBzZXRJc0NvbmZpcm1lZChpc0NvbmZpcm1lZDogYm9vbGVhbik6IE1vbmVyb1R4IHtcbiAgICB0aGlzLmlzQ29uZmlybWVkID0gaXNDb25maXJtZWQ7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoZSB0eCBpcyBpbiB0aGUgbWVtb3J5IHBvb2wsIGZhbHNlIG90aGVyd2lzZVxuICAgKi9cbiAgZ2V0SW5UeFBvb2woKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaW5UeFBvb2w7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGluVHhQb29sIC0gdHJ1ZSBpZiB0aGUgdHggaXMgaW4gdGhlIG1lbW9yeSBwb29sLCBmYWxzZSBvdGhlcndpc2VcbiAgICogQHJldHVybiB7TW9uZXJvVHh9IHRoaXMgdHggZm9yIGNoYWluaW5nXG4gICAqL1xuICBzZXRJblR4UG9vbChpblR4UG9vbDogYm9vbGVhbik6IE1vbmVyb1R4IHtcbiAgICB0aGlzLmluVHhQb29sID0gaW5UeFBvb2w7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtudW1iZXJ9IG51bWJlciBvZiBibG9jayBjb25maXJtYXRpb25zXG4gICAqL1xuICBnZXROdW1Db25maXJtYXRpb25zKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMubnVtQ29uZmlybWF0aW9ucztcbiAgfVxuICBcbiAgLyoqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBudW1Db25maXJtYXRpb25zIC0gbnVtYmVyIG9mIGJsb2NrIGNvbmZpcm1hdGlvbnNcbiAgICogQHJldHVybiB7TW9uZXJvVHh9IHRoaXMgdHggZm9yIGNoYWluaW5nXG4gICAqL1xuICBzZXROdW1Db25maXJtYXRpb25zKG51bUNvbmZpcm1hdGlvbnM6IG51bWJlcik6IE1vbmVyb1R4IHtcbiAgICB0aGlzLm51bUNvbmZpcm1hdGlvbnMgPSBudW1Db25maXJtYXRpb25zO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIFxuICAvKipcbiAgICogR2V0IHRoZSBtaW5pbXVtIGhlaWdodCBvciB0aW1lc3RhbXAgZm9yIHRoZSB0cmFuc2FjdGlvbnMgdG8gdW5sb2NrLlxuICAgKiBcbiAgICogQHJldHVybiB7YmlnaW50fSB0aGUgbWluaW11bSBoZWlnaHQgb3IgdGltZXN0YW1wIGZvciB0aGUgdHJhbnNhY3Rpb24gdG8gdW5sb2NrXG4gICAqL1xuICBnZXRVbmxvY2tUaW1lKCk6IGJpZ2ludCB7XG4gICAgcmV0dXJuIHRoaXMudW5sb2NrVGltZTtcbiAgfVxuICBcbiAgc2V0VW5sb2NrVGltZSh1bmxvY2tUaW1lOiBiaWdpbnQgfCBzdHJpbmcgfCBudW1iZXIgfCB1bmRlZmluZWQpOiBNb25lcm9UeCB7XG4gICAgaWYgKHVubG9ja1RpbWUgIT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgdW5sb2NrVGltZSAhPT0gXCJiaWdpbnRcIikgdW5sb2NrVGltZSA9IEJpZ0ludCh1bmxvY2tUaW1lKTtcbiAgICB0aGlzLnVubG9ja1RpbWUgPSB1bmxvY2tUaW1lIGFzIGJpZ2ludCB8IHVuZGVmaW5lZDtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBcbiAgLyoqXG4gICAqIEByZXR1cm4ge251bWJlcn0gdGltZXN0YW1wIHRoZSB0eCB3YXMgbGFzdCByZWxheWVkIGZyb20gdGhlIG5vZGVcbiAgICovXG4gIGdldExhc3RSZWxheWVkVGltZXN0YW1wKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMubGFzdFJlbGF5ZWRUaW1lc3RhbXA7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBAcGFyYW0ge251bWJlcn0gbGFzdFJlbGF5ZWRUaW1lc3RhbXAgLSB0aW1lc3RhbXAgdGhlIHR4IHdhcyBsYXN0IHJlbGF5ZWQgZnJvbSB0aGUgbm9kZVxuICAgKiBAcmV0dXJuIHtNb25lcm9UeH0gdGhpcyB0eCBmb3IgY2hhaW5pbmdcbiAgICovXG4gIHNldExhc3RSZWxheWVkVGltZXN0YW1wKGxhc3RSZWxheWVkVGltZXN0YW1wOiBudW1iZXIpOiBNb25lcm9UeCB7XG4gICAgdGhpcy5sYXN0UmVsYXllZFRpbWVzdGFtcCA9IGxhc3RSZWxheWVkVGltZXN0YW1wO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIFxuICAvKipcbiAgICogQHJldHVybiB7bnVtYmVyfSB0aW1lc3RhbXAgdGhlIHR4IHdhcyByZWNlaXZlZCBhdCB0aGUgbm9kZVxuICAgKi9cbiAgZ2V0UmVjZWl2ZWRUaW1lc3RhbXAoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5yZWNlaXZlZFRpbWVzdGFtcDtcbiAgfVxuICBcbiAgLyoqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByZWNlaXZlZFRpbWVzdGFtcCAtIHRpbWVzdGFtcCB0aGUgdHggd2FzIHJlY2VpdmVkIGF0IHRoZSBub2RlXG4gICAqIEByZXR1cm4ge01vbmVyb1R4fSB0aGlzIHR4IGZvciBjaGFpbmluZ1xuICAgKi9cbiAgc2V0UmVjZWl2ZWRUaW1lc3RhbXAocmVjZWl2ZWRUaW1lc3RhbXA6IG51bWJlcik6IE1vbmVyb1R4IHtcbiAgICB0aGlzLnJlY2VpdmVkVGltZXN0YW1wID0gcmVjZWl2ZWRUaW1lc3RhbXA7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIGEgZG91YmxlIHNwZW5kIGhhcyBiZWVuIHNlZW4sIGZhbHNlIG90aGVyd2lzZVxuICAgKi9cbiAgZ2V0SXNEb3VibGVTcGVuZFNlZW4oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaXNEb3VibGVTcGVuZFNlZW47XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzRG91YmxlU3BlbmRTZWVuIC0gdHJ1ZSBpZiBhIGRvdWJsZSBzcGVuZCBoYXMgYmVlbiBzZWVuLCBmYWxzZSBvdGhlcndpc2VcbiAgICogQHJldHVybiB7TW9uZXJvVHh9IHRoaXMgdHggZm9yIGNoYWluaW5nXG4gICAqL1xuICBzZXRJc0RvdWJsZVNwZW5kU2Vlbihpc0RvdWJsZVNwZW5kU2VlbjogYm9vbGVhbiApOiBNb25lcm9UeCB7XG4gICAgdGhpcy5pc0RvdWJsZVNwZW5kU2VlbiA9IGlzRG91YmxlU3BlbmRTZWVuO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIFxuICAvKipcbiAgICogQHJldHVybiB7c3RyaW5nfSB0eCBrZXlcbiAgICovXG4gIGdldEtleSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmtleTtcbiAgfVxuICBcbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgLSB0eCBrZXlcbiAgICogQHJldHVybiB7TW9uZXJvVHh9IHRoaXMgdHggZm9yIGNoYWluaW5nXG4gICAqL1xuICBzZXRLZXkoa2V5OiBzdHJpbmcpOiBNb25lcm9UeCB7XG4gICAgdGhpcy5rZXkgPSBrZXk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBHZXQgZnVsbCB0cmFuc2FjdGlvbiBoZXguIEZ1bGwgaGV4ID0gcHJ1bmVkIGhleCArIHBydW5hYmxlIGhleC5cbiAgICogXG4gICAqIEByZXR1cm4ge3N0cmluZ30gZnVsbCB0eCBoZXhcbiAgICovXG4gIGdldEZ1bGxIZXgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5mdWxsSGV4O1xuICB9XG4gIFxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IGZ1bGxIZXggLSBmdWxsIHR4IGhleFxuICAgKiBAcmV0dXJuIHtNb25lcm9UeH0gdGhpcyB0eCBmb3IgY2hhaW5pbmdcbiAgICovXG4gIHNldEZ1bGxIZXgoZnVsbEhleDogc3RyaW5nKTogTW9uZXJvVHgge1xuICAgIHRoaXMuZnVsbEhleCA9IGZ1bGxIZXg7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBHZXQgcHJ1bmVkIHRyYW5zYWN0aW9uIGhleC4gRnVsbCBoZXggPSBwcnVuZWQgaGV4ICsgcHJ1bmFibGUgaGV4LlxuICAgKiBcbiAgICogQHJldHVybiB7c3RyaW5nfSBwcnVuZWQgdHggaGV4XG4gICAqL1xuICBnZXRQcnVuZWRIZXgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5wcnVuZWRIZXg7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcHJ1bmVkSGV4IC0gcHJ1bmVkIHR4IGhleFxuICAgKiBAcmV0dXJuIHtNb25lcm9UeH0gdGhpcyB0eCBmb3IgY2hhaW5pbmdcbiAgICovXG4gIHNldFBydW5lZEhleChwcnVuZWRIZXg6IHN0cmluZyk6IE1vbmVyb1R4IHtcbiAgICB0aGlzLnBydW5lZEhleCA9IHBydW5lZEhleDtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBcbiAgLyoqXG4gICAqIEdldCBwcnVuYWJsZSB0cmFuc2FjdGlvbiBoZXggd2hpY2ggaXMgaGV4IHRoYXQgaXMgcmVtb3ZlZCBmcm9tIGEgcHJ1bmVkXG4gICAqIHRyYW5zYWN0aW9uLiBGdWxsIGhleCA9IHBydW5lZCBoZXggKyBwcnVuYWJsZSBoZXguXG4gICAqIFxuICAgKiBAcmV0dXJuIHtzdHJpbmd9IHBydW5hYmxlIHR4IGhleFxuICAgKi9cbiAgZ2V0UHJ1bmFibGVIZXgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5wcnVuYWJsZUhleDtcbiAgfVxuICBcbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwcnVuYWJsZUhleCAtIHBydW5hYmxlIHR4IGhleFxuICAgKiBAcmV0dXJuIHtNb25lcm9UeH0gdGhpcyB0eCBmb3IgY2hhaW5pbmdcbiAgICovXG4gIHNldFBydW5hYmxlSGV4KHBydW5hYmxlSGV4OiBzdHJpbmcpOiBNb25lcm9UeCB7XG4gICAgdGhpcy5wcnVuYWJsZUhleCA9IHBydW5hYmxlSGV4O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIFxuICAvKipcbiAgICogQHJldHVybiB7c3RyaW5nfSBwcnVuYWJsZSB0eCBoYXNoXG4gICAqL1xuICBnZXRQcnVuYWJsZUhhc2goKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5wcnVuYWJsZUhhc2g7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcHJ1bmFibGVIYXNoIC0gcHJ1bmFibGUgdHggaGFzaFxuICAgKiBAcmV0dXJuIHtNb25lcm9UeH0gdGhpcyB0eCBmb3IgY2hhaW5pbmdcbiAgICovXG4gIHNldFBydW5hYmxlSGFzaChwcnVuYWJsZUhhc2g6IHN0cmluZyk6IE1vbmVyb1R4IHtcbiAgICB0aGlzLnBydW5hYmxlSGFzaCA9IHBydW5hYmxlSGFzaDtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBcbiAgLyoqXG4gICAqIEByZXR1cm4ge251bWJlcn0gdHggc2l6ZVxuICAgKi9cbiAgZ2V0U2l6ZSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLnNpemU7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBAcGFyYW0ge251bWJlcn0gc2l6ZSAtIHR4IHNpemVcbiAgICogQHJldHVybiB7TW9uZXJvVHh9IHRoaXMgdHggZm9yIGNoYWluaW5nXG4gICAqL1xuICBzZXRTaXplKHNpemU6IG51bWJlcik6IE1vbmVyb1R4IHtcbiAgICB0aGlzLnNpemUgPSBzaXplO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIFxuICAvKipcbiAgICogQHJldHVybiB7bnVtYmVyfSB0eCB3ZWlnaHRcbiAgICovXG4gIGdldFdlaWdodCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLndlaWdodDtcbiAgfVxuICBcbiAgLyoqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB3ZWlnaHQgLSB0eCB3ZWlnaHRcbiAgICogQHJldHVybiB7TW9uZXJvVHh9IHRoaXMgdHggZm9yIGNoYWluaW5nXG4gICAqL1xuICBzZXRXZWlnaHQod2VpZ2h0OiBudW1iZXIpOiBNb25lcm9UeCB7XG4gICAgdGhpcy53ZWlnaHQgPSB3ZWlnaHQ7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtNb25lcm9PdXRwdXRbXX0gdHggaW5wdXRzXG4gICAqL1xuICBnZXRJbnB1dHMoKTogTW9uZXJvT3V0cHV0W10ge1xuICAgIHJldHVybiB0aGlzLmlucHV0cztcbiAgfVxuICBcbiAgLyoqXG4gICAqIEBwYXJhbSB7TW9uZXJvT3V0cHV0W119IC0gdHggaW5wdXRzXG4gICAqIEByZXR1cm4ge01vbmVyb1R4fSB0aGlzIHR4IGZvciBjaGFpbmluZ1xuICAgKi9cbiAgc2V0SW5wdXRzKGlucHV0czogTW9uZXJvT3V0cHV0W10pOiBNb25lcm9UeCB7XG4gICAgdGhpcy5pbnB1dHMgPSBpbnB1dHM7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtNb25lcm9PdXRwdXRbXX0gdHggb3V0cHV0c1xuICAgKi9cbiAgZ2V0T3V0cHV0cygpOiBNb25lcm9PdXRwdXRbXSB7XG4gICAgcmV0dXJuIHRoaXMub3V0cHV0cztcbiAgfVxuICBcbiAgLyoqXG4gICAqIEBwYXJhbSB7TW9uZXJvT3V0cHV0W119IG91dHB1dHMgLSB0eCBvdXRwdXRzXG4gICAqIEByZXR1cm4ge01vbmVyb1R4fSB0aGlzIHR4IGZvciBjaGFpbmluZ1xuICAgKi9cbiAgc2V0T3V0cHV0cyhvdXRwdXRzOiBNb25lcm9PdXRwdXRbXSk6IE1vbmVyb1R4IHtcbiAgICB0aGlzLm91dHB1dHMgPSBvdXRwdXRzO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIFxuICAvKipcbiAgICogQHJldHVybiB7bnVtYmVyW119IHR4IG91dHB1dCBpbmRpY2VzXG4gICAqL1xuICBnZXRPdXRwdXRJbmRpY2VzKCk6IG51bWJlcltdIHtcbiAgICByZXR1cm4gdGhpcy5vdXRwdXRJbmRpY2VzO1xuICB9XG4gIFxuICAvKipcbiAgICogQHBhcmFtIHtudW1iZXJbXX0gb3V0cHV0SW5kaWNlcyAtIHR4IG91dHB1dCBpbmRpY2VzXG4gICAqIEByZXR1cm4ge01vbmVyb1R4fSB0aGlzIHR4IGZvciBjaGFpbmluZ1xuICAgKi9cbiAgc2V0T3V0cHV0SW5kaWNlcyhvdXRwdXRJbmRpY2VzOiBudW1iZXJbXSk6IE1vbmVyb1R4IHtcbiAgICB0aGlzLm91dHB1dEluZGljZXMgPSBvdXRwdXRJbmRpY2VzO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIFxuICAvKipcbiAgICogQHJldHVybiB7c3RyaW5nfSB0eCBtZXRhZGF0YVxuICAgKi9cbiAgZ2V0TWV0YWRhdGEoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5tZXRhZGF0YTtcbiAgfVxuICBcbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBtZXRhZGF0YSAtIHR4IG1ldGFkYXRhXG4gICAqIEByZXR1cm4ge01vbmVyb1R4fSB0aGlzIHR4IGZvciBjaGFpbmluZ1xuICAgKi9cbiAgc2V0TWV0YWRhdGEobWV0YWRhdGE6IHN0cmluZyk6IE1vbmVyb1R4IHtcbiAgICB0aGlzLm1ldGFkYXRhID0gbWV0YWRhdGE7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtVaW50OEFycmF5fSB0eCBleHRyYVxuICAgKi9cbiAgZ2V0RXh0cmEoKTogVWludDhBcnJheSB7XG4gICAgcmV0dXJuIHRoaXMuZXh0cmE7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBAcGFyYW0ge1VpbnQ4QXJyYXl9IGV4dHJhIC0gdHggZXh0cmFcbiAgICogQHJldHVybiB7TW9uZXJvVHh9IHRoaXMgdHggZm9yIGNoYWluaW5nXG4gICAqL1xuICBzZXRFeHRyYShleHRyYTogVWludDhBcnJheSk6IE1vbmVyb1R4IHtcbiAgICB0aGlzLmV4dHJhID0gZXh0cmE7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7YW55fSBSQ1Qgc2lnbmF0dXJlc1xuICAgKi9cbiAgZ2V0UmN0U2lnbmF0dXJlcygpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLnJjdFNpZ25hdHVyZXM7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHthbnl9IHJjdFNpZ25hdHVyZXMgLSBSQ1Qgc2lnbmF0dXJlc1xuICAgKiBAcmV0dXJuIHtNb25lcm9UeH0gdGhpcyB0eCBmb3IgY2hhaW5pbmdcbiAgICovXG4gIHNldFJjdFNpZ25hdHVyZXMocmN0U2lnbmF0dXJlczogYW55KTogTW9uZXJvVHgge1xuICAgIHRoaXMucmN0U2lnbmF0dXJlcyA9IHJjdFNpZ25hdHVyZXM7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7YW55fSBwcnVuYWJsZSBSQ1Qgc2lnbmF0dXJlIGRhdGFcbiAgICovXG4gIGdldFJjdFNpZ1BydW5hYmxlKCk6IG9iamVjdCB7XG4gICAgcmV0dXJuIHRoaXMucmN0U2lnUHJ1bmFibGU7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHthbnl9IHJjdFNpZ1BydW5hYmxlIC0gcHJ1bmFibGUgUkNUIHNpZ25hdHVyZSBkYXRhXG4gICAqIEByZXR1cm4ge01vbmVyb1R4fSB0aGlzIHR4IGZvciBjaGFpbmluZ1xuICAgKi9cbiAgc2V0UmN0U2lnUHJ1bmFibGUocmN0U2lnUHJ1bmFibGU6IGFueSk6IE1vbmVyb1R4IHtcbiAgICB0aGlzLnJjdFNpZ1BydW5hYmxlID0gcmN0U2lnUHJ1bmFibGU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiBrZXB0IGJ5IGEgYmxvY2ssIGZhbHNlIG90aGVyd2lzZVxuICAgKi9cbiAgZ2V0SXNLZXB0QnlCbG9jaygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pc0tlcHRCeUJsb2NrO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNLZXB0QnlCbG9jayAtIHRydWUgaWYga2VwdCBieSBhIGJsb2NrLCBmYWxzZSBvdGhlcndpc2VcbiAgICogQHJldHVybiB7TW9uZXJvVHh9IHRoaXMgdHggZm9yIGNoYWluaW5nXG4gICAqL1xuICBzZXRJc0tlcHRCeUJsb2NrKGlzS2VwdEJ5QmxvY2s6IGJvb2xlYW4pOiBNb25lcm9UeCB7XG4gICAgdGhpcy5pc0tlcHRCeUJsb2NrID0gaXNLZXB0QnlCbG9jaztcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoZSB0eCBmYWlsZWQsIGZhbHNlIG90aGVyd2lzZVxuICAgKi9cbiAgZ2V0SXNGYWlsZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaXNGYWlsZWQ7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtib29sZWFufSBpc0ZhaWxlZCAtIHRydWUgaWYgdGhlIHR4IGZhaWxlZCwgZmFsc2Ugb3RoZXJ3aXNlXG4gICAqIEByZXR1cm4ge01vbmVyb1R4fSB0aGlzIHR4IGZvciBjaGFpbmluZ1xuICAgKi9cbiAgc2V0SXNGYWlsZWQoaXNGYWlsZWQ6IGJvb2xlYW4pOiBNb25lcm9UeCB7XG4gICAgdGhpcy5pc0ZhaWxlZCA9IGlzRmFpbGVkO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4ge251bWJlcn0gYmxvY2sgaGVpZ2h0IG9mIHRoZSBsYXN0IHR4IGZhaWx1cmVcbiAgICovXG4gIGdldExhc3RGYWlsZWRIZWlnaHQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5sYXN0RmFpbGVkSGVpZ2h0O1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBsYXN0RmFpbGVkSGVpZ2h0IC0gYmxvY2sgaGVpZ2h0IG9mIHRoZSBsYXN0IHR4IGZhaWx1cmVcbiAgICogQHJldHVybiB7TW9uZXJvVHh9IHRoaXMgdHggZm9yIGNoYWluaW5nXG4gICAqL1xuICBzZXRMYXN0RmFpbGVkSGVpZ2h0KGxhc3RGYWlsZWRIZWlnaHQ6IG51bWJlcik6IE1vbmVyb1R4IHtcbiAgICB0aGlzLmxhc3RGYWlsZWRIZWlnaHQgPSBsYXN0RmFpbGVkSGVpZ2h0O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4ge3N0cmluZ30gYmxvY2sgaGFzaCBvZiB0aGUgbGFzdCB0eCBmYWlsdXJlXG4gICAqL1xuICBnZXRMYXN0RmFpbGVkSGFzaCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmxhc3RGYWlsZWRIYXNoO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBsYXN0RmFpbGVkSGFzaCAtIGJsb2NrIGhhc2ggb2YgdGhlIGxhc3QgdHggZmFpbHVyZVxuICAgKiBAcmV0dXJuIHtNb25lcm9UeH0gdGhpcyB0eCBmb3IgY2hhaW5pbmdcbiAgICovXG4gIHNldExhc3RGYWlsZWRIYXNoKGxhc3RGYWlsZWRIYXNoOiBzdHJpbmcpOiBNb25lcm9UeCB7XG4gICAgdGhpcy5sYXN0RmFpbGVkSGFzaCA9IGxhc3RGYWlsZWRIYXNoO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4ge251bWJlcn0gbWF4IHVzZWQgYmxvY2sgaGVpZ2h0XG4gICAqL1xuICBnZXRNYXhVc2VkQmxvY2tIZWlnaHQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5tYXhVc2VkQmxvY2tIZWlnaHQ7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtudW1iZXJ9IG1heFVzZWRCbG9ja0hlaWdodCAtIG1heCB1c2VkIGJsb2NrIGhlaWdodFxuICAgKiBAcmV0dXJuIHtNb25lcm9UeH0gdGhpcyB0eCBmb3IgY2hhaW5pbmdcbiAgICovXG4gIHNldE1heFVzZWRCbG9ja0hlaWdodChtYXhVc2VkQmxvY2tIZWlnaHQ6IG51bWJlcik6IE1vbmVyb1R4IHtcbiAgICB0aGlzLm1heFVzZWRCbG9ja0hlaWdodCA9IG1heFVzZWRCbG9ja0hlaWdodDtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtzdHJpbmd9IG1heCB1c2VkIGJsb2NrIGhhc2hcbiAgICovXG4gIGdldE1heFVzZWRCbG9ja0hhc2goKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5tYXhVc2VkQmxvY2tIYXNoO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBtYXhVc2VkQmxvY2tIYXNoIC0gbWF4IHVzZWQgYmxvY2sgaGFzaFxuICAgKiBAcmV0dXJuIHtNb25lcm9UeH0gdGhpcyB0eCBmb3IgY2hhaW5pbmdcbiAgICovXG4gIHNldE1heFVzZWRCbG9ja0hhc2gobWF4VXNlZEJsb2NrSGFzaDogc3RyaW5nKTogTW9uZXJvVHgge1xuICAgIHRoaXMubWF4VXNlZEJsb2NrSGFzaCA9IG1heFVzZWRCbG9ja0hhc2g7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7c3RyaW5nW119IHR4IHNpZ25hdHVyZXNcbiAgICovXG4gIGdldFNpZ25hdHVyZXMoKTogc3RyaW5nW10ge1xuICAgIHJldHVybiB0aGlzLnNpZ25hdHVyZXM7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmdbXX0gc2lnbmF0dXJlcyAtIHR4IHNpZ25hdHVyZXNcbiAgICogQHJldHVybiB7TW9uZXJvVHh9IHRoaXMgdHggZm9yIGNoYWluaW5nXG4gICAqL1xuICBzZXRTaWduYXR1cmVzKHNpZ25hdHVyZXM6IHN0cmluZ1tdKTogTW9uZXJvVHgge1xuICAgIHRoaXMuc2lnbmF0dXJlcyA9IHNpZ25hdHVyZXM7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7TW9uZXJvVHh9IGEgY29weSBvZiB0aGlzIHR4XG4gICAqL1xuICBjb3B5KCk6IE1vbmVyb1R4IHtcbiAgICByZXR1cm4gbmV3IE1vbmVyb1R4KHRoaXMpO1xuICB9XG4gIFxuICAvKipcbiAgICogQHJldHVybiB7YW55fSBqc29uIHJlcHJlc2VudGF0aW9uIG9mIHRoaXMgdHhcbiAgICovXG4gIHRvSnNvbigpOiBhbnkge1xuICAgIGxldCBqc29uOiBhbnkgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzKTtcbiAgICBpZiAodGhpcy5nZXRGZWUoKSAhPT0gdW5kZWZpbmVkKSBqc29uLmZlZSA9IHRoaXMuZ2V0RmVlKCkudG9TdHJpbmcoKTtcbiAgICBpZiAodGhpcy5nZXRVbmxvY2tUaW1lKCkgIT09IHVuZGVmaW5lZCkganNvbi51bmxvY2tUaW1lID0gdGhpcy5nZXRVbmxvY2tUaW1lKCkudG9TdHJpbmcoKTtcbiAgICBpZiAodGhpcy5nZXRJbnB1dHMoKSkge1xuICAgICAganNvbi5pbnB1dHMgPSBbXTtcbiAgICAgIGZvciAobGV0IGlucHV0IG9mIHRoaXMuZ2V0SW5wdXRzKCkpIGpzb24uaW5wdXRzLnB1c2goaW5wdXQudG9Kc29uKCkpO1xuICAgIH1cbiAgICBpZiAodGhpcy5nZXRPdXRwdXRzKCkpIHtcbiAgICAgIGpzb24ub3V0cHV0cyA9IFtdO1xuICAgICAgZm9yIChsZXQgb3V0cHV0IG9mIHRoaXMuZ2V0T3V0cHV0cygpKSBqc29uLm91dHB1dHMucHVzaChvdXRwdXQudG9Kc29uKCkpO1xuICAgIH1cbiAgICBpZiAodGhpcy5nZXRFeHRyYSgpICE9PSB1bmRlZmluZWQpIGpzb24uZXh0cmEgPSBBcnJheS5mcm9tKHRoaXMuZ2V0RXh0cmEoKSwgYnl0ZSA9PiBieXRlKTtcbiAgICBkZWxldGUganNvbi5ibG9jazsgIC8vIGRvIG5vdCBzZXJpYWxpemUgcGFyZW50IGJsb2NrXG4gICAgcmV0dXJuIGpzb247XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoaXMgdHJhbnNhY3Rpb24gYnkgbWVyZ2luZyB0aGUgbGF0ZXN0IGluZm9ybWF0aW9uIGZyb20gdGhlIGdpdmVuXG4gICAqIHRyYW5zYWN0aW9uLlxuICAgKiBcbiAgICogQHBhcmFtIHtNb25lcm9UeH0gdHggLSB0aGUgdHJhbnNhY3Rpb24gdG8gdXBkYXRlIHRoaXMgdHJhbnNhY3Rpb24gd2l0aFxuICAgKiBAcmV0dXJuIHtNb25lcm9UeH0gdGhpcyBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAqL1xuICBtZXJnZSh0eDogTW9uZXJvVHgpOiBNb25lcm9UeCB7XG4gICAgYXNzZXJ0KHR4IGluc3RhbmNlb2YgTW9uZXJvVHgpO1xuICAgIGlmICh0aGlzID09PSB0eCkgcmV0dXJuIHRoaXM7XG4gICAgXG4gICAgLy8gbWVyZ2UgYmxvY2tzIGlmIHRoZXkncmUgZGlmZmVyZW50XG4gICAgaWYgKHRoaXMuZ2V0QmxvY2soKSAhPT0gdHguZ2V0QmxvY2soKSkge1xuICAgICAgaWYgKHRoaXMuZ2V0QmxvY2soKSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRoaXMuc2V0QmxvY2sodHguZ2V0QmxvY2soKSk7XG4gICAgICAgIHRoaXMuZ2V0QmxvY2soKS5nZXRUeHNbdGhpcy5nZXRCbG9jaygpLmdldFR4cygpLmluZGV4T2YodHgpXSA9IHRoaXM7IC8vIHVwZGF0ZSBibG9jayB0byBwb2ludCB0byB0aGlzIHR4XG4gICAgICB9IGVsc2UgaWYgKHR4LmdldEJsb2NrKCkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aGlzLmdldEJsb2NrKCkubWVyZ2UodHguZ2V0QmxvY2soKSk7IC8vIGNvbWVzIGJhY2sgdG8gbWVyZ2luZyB0eHNcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8vIG90aGVyd2lzZSBtZXJnZSB0eCBmaWVsZHNcbiAgICB0aGlzLnNldEhhc2goR2VuVXRpbHMucmVjb25jaWxlKHRoaXMuZ2V0SGFzaCgpLCB0eC5nZXRIYXNoKCkpKTtcbiAgICB0aGlzLnNldFZlcnNpb24oR2VuVXRpbHMucmVjb25jaWxlKHRoaXMuZ2V0VmVyc2lvbigpLCB0eC5nZXRWZXJzaW9uKCkpKTtcbiAgICB0aGlzLnNldFBheW1lbnRJZChHZW5VdGlscy5yZWNvbmNpbGUodGhpcy5nZXRQYXltZW50SWQoKSwgdHguZ2V0UGF5bWVudElkKCkpKTtcbiAgICB0aGlzLnNldEZlZShHZW5VdGlscy5yZWNvbmNpbGUodGhpcy5nZXRGZWUoKSwgdHguZ2V0RmVlKCkpKTtcbiAgICB0aGlzLnNldFJpbmdTaXplKEdlblV0aWxzLnJlY29uY2lsZSh0aGlzLmdldFJpbmdTaXplKCksIHR4LmdldFJpbmdTaXplKCkpKTtcbiAgICB0aGlzLnNldElzQ29uZmlybWVkKEdlblV0aWxzLnJlY29uY2lsZSh0aGlzLmdldElzQ29uZmlybWVkKCksIHR4LmdldElzQ29uZmlybWVkKCksIHtyZXNvbHZlVHJ1ZTogdHJ1ZX0pKTsgLy8gdHggY2FuIGJlY29tZSBjb25maXJtZWRcbiAgICB0aGlzLnNldElzTWluZXJUeChHZW5VdGlscy5yZWNvbmNpbGUodGhpcy5nZXRJc01pbmVyVHgoKSwgdHguZ2V0SXNNaW5lclR4KCkpKTtcbiAgICB0aGlzLnNldFJlbGF5KEdlblV0aWxzLnJlY29uY2lsZSh0aGlzLmdldFJlbGF5KCksIHR4LmdldFJlbGF5KCksIHtyZXNvbHZlVHJ1ZTogdHJ1ZX0pKTsgICAgICAgLy8gdHggY2FuIGJlY29tZSByZWxheWVkXG4gICAgdGhpcy5zZXRJc1JlbGF5ZWQoR2VuVXRpbHMucmVjb25jaWxlKHRoaXMuZ2V0SXNSZWxheWVkKCksIHR4LmdldElzUmVsYXllZCgpLCB7cmVzb2x2ZVRydWU6IHRydWV9KSk7IC8vIHR4IGNhbiBiZWNvbWUgcmVsYXllZFxuICAgIHRoaXMuc2V0SXNEb3VibGVTcGVuZFNlZW4oR2VuVXRpbHMucmVjb25jaWxlKHRoaXMuZ2V0SXNEb3VibGVTcGVuZFNlZW4oKSwgdHguZ2V0SXNEb3VibGVTcGVuZFNlZW4oKSwge3Jlc29sdmVUcnVlOiB0cnVlfSkpOyAvLyBkb3VibGUgc3BlbmQgY2FuIGJlY29tZSBzZWVuXG4gICAgdGhpcy5zZXRLZXkoR2VuVXRpbHMucmVjb25jaWxlKHRoaXMuZ2V0S2V5KCksIHR4LmdldEtleSgpKSk7XG4gICAgdGhpcy5zZXRGdWxsSGV4KEdlblV0aWxzLnJlY29uY2lsZSh0aGlzLmdldEZ1bGxIZXgoKSwgdHguZ2V0RnVsbEhleCgpKSk7XG4gICAgdGhpcy5zZXRQcnVuZWRIZXgoR2VuVXRpbHMucmVjb25jaWxlKHRoaXMuZ2V0UHJ1bmVkSGV4KCksIHR4LmdldFBydW5lZEhleCgpKSk7XG4gICAgdGhpcy5zZXRQcnVuYWJsZUhleChHZW5VdGlscy5yZWNvbmNpbGUodGhpcy5nZXRQcnVuYWJsZUhleCgpLCB0eC5nZXRQcnVuYWJsZUhleCgpKSk7XG4gICAgdGhpcy5zZXRQcnVuYWJsZUhhc2goR2VuVXRpbHMucmVjb25jaWxlKHRoaXMuZ2V0UHJ1bmFibGVIYXNoKCksIHR4LmdldFBydW5hYmxlSGFzaCgpKSk7XG4gICAgdGhpcy5zZXRTaXplKEdlblV0aWxzLnJlY29uY2lsZSh0aGlzLmdldFNpemUoKSwgdHguZ2V0U2l6ZSgpKSk7XG4gICAgdGhpcy5zZXRXZWlnaHQoR2VuVXRpbHMucmVjb25jaWxlKHRoaXMuZ2V0V2VpZ2h0KCksIHR4LmdldFdlaWdodCgpKSk7XG4gICAgdGhpcy5zZXRPdXRwdXRJbmRpY2VzKEdlblV0aWxzLnJlY29uY2lsZSh0aGlzLmdldE91dHB1dEluZGljZXMoKSwgdHguZ2V0T3V0cHV0SW5kaWNlcygpKSk7XG4gICAgdGhpcy5zZXRNZXRhZGF0YShHZW5VdGlscy5yZWNvbmNpbGUodGhpcy5nZXRNZXRhZGF0YSgpLCB0eC5nZXRNZXRhZGF0YSgpKSk7XG4gICAgdGhpcy5zZXRFeHRyYShHZW5VdGlscy5yZWNvbmNpbGUodGhpcy5nZXRFeHRyYSgpLCB0eC5nZXRFeHRyYSgpKSk7XG4gICAgdGhpcy5zZXRSY3RTaWduYXR1cmVzKEdlblV0aWxzLnJlY29uY2lsZSh0aGlzLmdldFJjdFNpZ25hdHVyZXMoKSwgdHguZ2V0UmN0U2lnbmF0dXJlcygpKSk7XG4gICAgdGhpcy5zZXRSY3RTaWdQcnVuYWJsZShHZW5VdGlscy5yZWNvbmNpbGUodGhpcy5nZXRSY3RTaWdQcnVuYWJsZSgpLCB0eC5nZXRSY3RTaWdQcnVuYWJsZSgpKSk7XG4gICAgdGhpcy5zZXRJc0tlcHRCeUJsb2NrKEdlblV0aWxzLnJlY29uY2lsZSh0aGlzLmdldElzS2VwdEJ5QmxvY2soKSwgdHguZ2V0SXNLZXB0QnlCbG9jaygpKSk7XG4gICAgdGhpcy5zZXRJc0ZhaWxlZChHZW5VdGlscy5yZWNvbmNpbGUodGhpcy5nZXRJc0ZhaWxlZCgpLCB0eC5nZXRJc0ZhaWxlZCgpLCB7cmVzb2x2ZVRydWU6IHRydWV9KSk7XG4gICAgdGhpcy5zZXRMYXN0RmFpbGVkSGVpZ2h0KEdlblV0aWxzLnJlY29uY2lsZSh0aGlzLmdldExhc3RGYWlsZWRIZWlnaHQoKSwgdHguZ2V0TGFzdEZhaWxlZEhlaWdodCgpKSk7XG4gICAgdGhpcy5zZXRMYXN0RmFpbGVkSGFzaChHZW5VdGlscy5yZWNvbmNpbGUodGhpcy5nZXRMYXN0RmFpbGVkSGFzaCgpLCB0eC5nZXRMYXN0RmFpbGVkSGFzaCgpKSk7XG4gICAgdGhpcy5zZXRNYXhVc2VkQmxvY2tIZWlnaHQoR2VuVXRpbHMucmVjb25jaWxlKHRoaXMuZ2V0TWF4VXNlZEJsb2NrSGVpZ2h0KCksIHR4LmdldE1heFVzZWRCbG9ja0hlaWdodCgpKSk7XG4gICAgdGhpcy5zZXRNYXhVc2VkQmxvY2tIYXNoKEdlblV0aWxzLnJlY29uY2lsZSh0aGlzLmdldE1heFVzZWRCbG9ja0hhc2goKSwgdHguZ2V0TWF4VXNlZEJsb2NrSGFzaCgpKSk7XG4gICAgdGhpcy5zZXRTaWduYXR1cmVzKEdlblV0aWxzLnJlY29uY2lsZSh0aGlzLmdldFNpZ25hdHVyZXMoKSwgdHguZ2V0U2lnbmF0dXJlcygpKSk7XG4gICAgdGhpcy5zZXRVbmxvY2tUaW1lKEdlblV0aWxzLnJlY29uY2lsZSh0aGlzLmdldFVubG9ja1RpbWUoKSwgdHguZ2V0VW5sb2NrVGltZSgpKSk7XG4gICAgdGhpcy5zZXROdW1Db25maXJtYXRpb25zKEdlblV0aWxzLnJlY29uY2lsZSh0aGlzLmdldE51bUNvbmZpcm1hdGlvbnMoKSwgdHguZ2V0TnVtQ29uZmlybWF0aW9ucygpLCB7cmVzb2x2ZU1heDogdHJ1ZX0pKTsgLy8gbnVtIGNvbmZpcm1hdGlvbnMgY2FuIGluY3JlYXNlXG4gICAgXG4gICAgLy8gbWVyZ2UgaW5wdXRzXG4gICAgaWYgKHR4LmdldElucHV0cygpKSB7XG4gICAgICBmb3IgKGxldCBtZXJnZXIgb2YgdHguZ2V0SW5wdXRzKCkpIHtcbiAgICAgICAgbGV0IG1lcmdlZCA9IGZhbHNlO1xuICAgICAgICBtZXJnZXIuc2V0VHgodGhpcyk7XG4gICAgICAgIGlmICghdGhpcy5nZXRJbnB1dHMoKSkgdGhpcy5zZXRJbnB1dHMoW10pO1xuICAgICAgICBmb3IgKGxldCBtZXJnZWUgb2YgdGhpcy5nZXRJbnB1dHMoKSkge1xuICAgICAgICAgIGlmIChtZXJnZWUuZ2V0S2V5SW1hZ2UoKS5nZXRIZXgoKSA9PT0gbWVyZ2VyLmdldEtleUltYWdlKCkuZ2V0SGV4KCkpIHtcbiAgICAgICAgICAgIG1lcmdlZS5tZXJnZShtZXJnZXIpO1xuICAgICAgICAgICAgbWVyZ2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoIW1lcmdlZCkgdGhpcy5nZXRJbnB1dHMoKS5wdXNoKG1lcmdlcik7XG4gICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8vIG1lcmdlIG91dHB1dHNcbiAgICBpZiAodHguZ2V0T3V0cHV0cygpKSB7XG4gICAgICBmb3IgKGxldCBvdXRwdXQgb2YgdHguZ2V0T3V0cHV0cygpKSBvdXRwdXQuc2V0VHgodGhpcyk7XG4gICAgICBpZiAoIXRoaXMuZ2V0T3V0cHV0cygpKSB0aGlzLnNldE91dHB1dHModHguZ2V0T3V0cHV0cygpKTtcbiAgICAgIGVsc2Uge1xuICAgICAgICBcbiAgICAgICAgLy8gbWVyZ2Ugb3V0cHV0cyBpZiBrZXkgaW1hZ2Ugb3Igc3RlYWx0aCBwdWJsaWMga2V5IHByZXNlbnQsIG90aGVyd2lzZSBhcHBlbmRcbiAgICAgICAgZm9yIChsZXQgbWVyZ2VyIG9mIHR4LmdldE91dHB1dHMoKSkge1xuICAgICAgICAgIGxldCBtZXJnZWQgPSBmYWxzZTtcbiAgICAgICAgICBtZXJnZXIuc2V0VHgodGhpcyk7XG4gICAgICAgICAgZm9yIChsZXQgbWVyZ2VlIG9mIHRoaXMuZ2V0T3V0cHV0cygpKSB7XG4gICAgICAgICAgICBpZiAoKG1lcmdlci5nZXRLZXlJbWFnZSgpICYmIG1lcmdlZS5nZXRLZXlJbWFnZSgpLmdldEhleCgpID09PSBtZXJnZXIuZ2V0S2V5SW1hZ2UoKS5nZXRIZXgoKSkgfHxcbiAgICAgICAgICAgICAgICAobWVyZ2VyLmdldFN0ZWFsdGhQdWJsaWNLZXkoKSAmJiBtZXJnZWUuZ2V0U3RlYWx0aFB1YmxpY0tleSgpID09PSBtZXJnZXIuZ2V0U3RlYWx0aFB1YmxpY0tleSgpKSkge1xuICAgICAgICAgICAgIG1lcmdlZS5tZXJnZShtZXJnZXIpO1xuICAgICAgICAgICAgIG1lcmdlZCA9IHRydWU7XG4gICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghbWVyZ2VkKSB0aGlzLmdldE91dHB1dHMoKS5wdXNoKG1lcmdlcik7IC8vIGFwcGVuZCBvdXRwdXRcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvLyBoYW5kbGUgdW5yZWxheWVkIC0+IHJlbGF5ZWQgLT4gY29uZmlybWVkXG4gICAgaWYgKHRoaXMuZ2V0SXNDb25maXJtZWQoKSkge1xuICAgICAgdGhpcy5zZXRJblR4UG9vbChmYWxzZSk7XG4gICAgICB0aGlzLnNldFJlY2VpdmVkVGltZXN0YW1wKHVuZGVmaW5lZCk7XG4gICAgICB0aGlzLnNldExhc3RSZWxheWVkVGltZXN0YW1wKHVuZGVmaW5lZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2V0SW5UeFBvb2woR2VuVXRpbHMucmVjb25jaWxlKHRoaXMuZ2V0SW5UeFBvb2woKSwgdHguZ2V0SW5UeFBvb2woKSwge3Jlc29sdmVUcnVlOiB0cnVlfSkpOyAvLyB1bnJlbGF5ZWQgLT4gdHggcG9vbFxuICAgICAgdGhpcy5zZXRSZWNlaXZlZFRpbWVzdGFtcChHZW5VdGlscy5yZWNvbmNpbGUodGhpcy5nZXRSZWNlaXZlZFRpbWVzdGFtcCgpLCB0eC5nZXRSZWNlaXZlZFRpbWVzdGFtcCgpLCB7cmVzb2x2ZU1heDogZmFsc2V9KSk7IC8vIHRha2UgZWFybGllc3QgcmVjZWl2ZSB0aW1lXG4gICAgICB0aGlzLnNldExhc3RSZWxheWVkVGltZXN0YW1wKEdlblV0aWxzLnJlY29uY2lsZSh0aGlzLmdldExhc3RSZWxheWVkVGltZXN0YW1wKCksIHR4LmdldExhc3RSZWxheWVkVGltZXN0YW1wKCksIHtyZXNvbHZlTWF4OiB0cnVlfSkpOyAgLy8gdGFrZSBsYXRlc3QgcmVsYXkgdGltZVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gdGhpczsgIC8vIGZvciBjaGFpbmluZ1xuICB9XG4gIFxuICAvKipcbiAgICogQHBhcmFtIHtudW1iZXJ9IFtpbmRlbnRdIC0gc3RhcnRpbmcgaW5kZW50YXRpb25cbiAgICogQHJldHVybiB7c3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhpcyB0eFxuICAgKi9cbiAgdG9TdHJpbmcoaW5kZW50ID0gMCk6IHN0cmluZyB7XG4gICAgbGV0IHN0ciA9IFwiXCI7XG4gICAgc3RyICs9IEdlblV0aWxzLmdldEluZGVudChpbmRlbnQpICsgXCI9PT0gVFggPT09XFxuXCI7XG4gICAgc3RyICs9IEdlblV0aWxzLmt2TGluZShcIlR4IGhhc2hcIiwgdGhpcy5nZXRIYXNoKCksIGluZGVudCk7XG4gICAgc3RyICs9IEdlblV0aWxzLmt2TGluZShcIkhlaWdodFwiLCB0aGlzLmdldEhlaWdodCgpLCBpbmRlbnQpO1xuICAgIHN0ciArPSBHZW5VdGlscy5rdkxpbmUoXCJWZXJzaW9uXCIsIHRoaXMuZ2V0VmVyc2lvbigpLCBpbmRlbnQpO1xuICAgIHN0ciArPSBHZW5VdGlscy5rdkxpbmUoXCJJcyBtaW5lciB0eFwiLCB0aGlzLmdldElzTWluZXJUeCgpLCBpbmRlbnQpO1xuICAgIHN0ciArPSBHZW5VdGlscy5rdkxpbmUoXCJQYXltZW50IElEXCIsIHRoaXMuZ2V0UGF5bWVudElkKCksIGluZGVudCk7XG4gICAgc3RyICs9IEdlblV0aWxzLmt2TGluZShcIkZlZVwiLCB0aGlzLmdldEZlZSgpLCBpbmRlbnQpO1xuICAgIHN0ciArPSBHZW5VdGlscy5rdkxpbmUoXCJSaW5nIHNpemVcIiwgdGhpcy5nZXRSaW5nU2l6ZSgpLCBpbmRlbnQpO1xuICAgIHN0ciArPSBHZW5VdGlscy5rdkxpbmUoXCJSZWxheVwiLCB0aGlzLmdldFJlbGF5KCksIGluZGVudCk7XG4gICAgc3RyICs9IEdlblV0aWxzLmt2TGluZShcIklzIHJlbGF5ZWRcIiwgdGhpcy5nZXRJc1JlbGF5ZWQoKSwgaW5kZW50KTtcbiAgICBzdHIgKz0gR2VuVXRpbHMua3ZMaW5lKFwiSXMgY29uZmlybWVkXCIsIHRoaXMuZ2V0SXNDb25maXJtZWQoKSwgaW5kZW50KTtcbiAgICBzdHIgKz0gR2VuVXRpbHMua3ZMaW5lKFwiSW4gdHggcG9vbFwiLCB0aGlzLmdldEluVHhQb29sKCksIGluZGVudCk7XG4gICAgc3RyICs9IEdlblV0aWxzLmt2TGluZShcIk51bSBjb25maXJtYXRpb25zXCIsIHRoaXMuZ2V0TnVtQ29uZmlybWF0aW9ucygpLCBpbmRlbnQpO1xuICAgIHN0ciArPSBHZW5VdGlscy5rdkxpbmUoXCJVbmxvY2sgdGltZVwiLCB0aGlzLmdldFVubG9ja1RpbWUoKSwgaW5kZW50KTtcbiAgICBzdHIgKz0gR2VuVXRpbHMua3ZMaW5lKFwiTGFzdCByZWxheWVkIHRpbWVcIiwgdGhpcy5nZXRMYXN0UmVsYXllZFRpbWVzdGFtcCgpLCBpbmRlbnQpO1xuICAgIHN0ciArPSBHZW5VdGlscy5rdkxpbmUoXCJSZWNlaXZlZCB0aW1lXCIsIHRoaXMuZ2V0UmVjZWl2ZWRUaW1lc3RhbXAoKSwgaW5kZW50KTtcbiAgICBzdHIgKz0gR2VuVXRpbHMua3ZMaW5lKFwiSXMgZG91YmxlIHNwZW5kXCIsIHRoaXMuZ2V0SXNEb3VibGVTcGVuZFNlZW4oKSwgaW5kZW50KTtcbiAgICBzdHIgKz0gR2VuVXRpbHMua3ZMaW5lKFwiS2V5XCIsIHRoaXMuZ2V0S2V5KCksIGluZGVudCk7XG4gICAgc3RyICs9IEdlblV0aWxzLmt2TGluZShcIkZ1bGwgaGV4XCIsIHRoaXMuZ2V0RnVsbEhleCgpLCBpbmRlbnQpO1xuICAgIHN0ciArPSBHZW5VdGlscy5rdkxpbmUoXCJQcnVuZWQgaGV4XCIsIHRoaXMuZ2V0UHJ1bmVkSGV4KCksIGluZGVudCk7XG4gICAgc3RyICs9IEdlblV0aWxzLmt2TGluZShcIlBydW5hYmxlIGhleFwiLCB0aGlzLmdldFBydW5hYmxlSGV4KCksIGluZGVudCk7XG4gICAgc3RyICs9IEdlblV0aWxzLmt2TGluZShcIlBydW5hYmxlIGhhc2hcIiwgdGhpcy5nZXRQcnVuYWJsZUhhc2goKSwgaW5kZW50KTtcbiAgICBzdHIgKz0gR2VuVXRpbHMua3ZMaW5lKFwiU2l6ZVwiLCB0aGlzLmdldFNpemUoKSwgaW5kZW50KTtcbiAgICBzdHIgKz0gR2VuVXRpbHMua3ZMaW5lKFwiV2VpZ2h0XCIsIHRoaXMuZ2V0V2VpZ2h0KCksIGluZGVudCk7XG4gICAgc3RyICs9IEdlblV0aWxzLmt2TGluZShcIk91dHB1dCBpbmRpY2VzXCIsIHRoaXMuZ2V0T3V0cHV0SW5kaWNlcygpLCBpbmRlbnQpO1xuICAgIHN0ciArPSBHZW5VdGlscy5rdkxpbmUoXCJNZXRhZGF0YVwiLCB0aGlzLmdldE1ldGFkYXRhKCksIGluZGVudCk7XG4gICAgc3RyICs9IEdlblV0aWxzLmt2TGluZShcIkV4dHJhXCIsIHRoaXMuZ2V0RXh0cmEoKSwgaW5kZW50KTtcbiAgICBzdHIgKz0gR2VuVXRpbHMua3ZMaW5lKFwiUkNUIHNpZ25hdHVyZXNcIiwgdGhpcy5nZXRSY3RTaWduYXR1cmVzKCksIGluZGVudCk7XG4gICAgc3RyICs9IEdlblV0aWxzLmt2TGluZShcIlJDVCBzaWcgcHJ1bmFibGVcIiwgdGhpcy5nZXRSY3RTaWdQcnVuYWJsZSgpLCBpbmRlbnQpO1xuICAgIHN0ciArPSBHZW5VdGlscy5rdkxpbmUoXCJLZXB0IGJ5IGJsb2NrXCIsIHRoaXMuZ2V0SXNLZXB0QnlCbG9jaygpLCBpbmRlbnQpO1xuICAgIHN0ciArPSBHZW5VdGlscy5rdkxpbmUoXCJJcyBmYWlsZWRcIiwgdGhpcy5nZXRJc0ZhaWxlZCgpLCBpbmRlbnQpO1xuICAgIHN0ciArPSBHZW5VdGlscy5rdkxpbmUoXCJMYXN0IGZhaWxlZCBoZWlnaHRcIiwgdGhpcy5nZXRMYXN0RmFpbGVkSGVpZ2h0KCksIGluZGVudCk7XG4gICAgc3RyICs9IEdlblV0aWxzLmt2TGluZShcIkxhc3QgZmFpbGVkIGhhc2hcIiwgdGhpcy5nZXRMYXN0RmFpbGVkSGFzaCgpLCBpbmRlbnQpO1xuICAgIHN0ciArPSBHZW5VdGlscy5rdkxpbmUoXCJNYXggdXNlZCBibG9jayBoZWlnaHRcIiwgdGhpcy5nZXRNYXhVc2VkQmxvY2tIZWlnaHQoKSwgaW5kZW50KTtcbiAgICBzdHIgKz0gR2VuVXRpbHMua3ZMaW5lKFwiTWF4IHVzZWQgYmxvY2sgaGFzaFwiLCB0aGlzLmdldE1heFVzZWRCbG9ja0hhc2goKSwgaW5kZW50KTtcbiAgICBzdHIgKz0gR2VuVXRpbHMua3ZMaW5lKFwiU2lnbmF0dXJlc1wiLCB0aGlzLmdldFNpZ25hdHVyZXMoKSwgaW5kZW50KTtcbiAgICBpZiAodGhpcy5nZXRJbnB1dHMoKSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBzdHIgKz0gR2VuVXRpbHMua3ZMaW5lKFwiSW5wdXRzXCIsIFwiXCIsIGluZGVudCk7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZ2V0SW5wdXRzKCkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgc3RyICs9IEdlblV0aWxzLmt2TGluZShpICsgMSwgXCJcIiwgaW5kZW50ICsgMSk7XG4gICAgICAgIHN0ciArPSB0aGlzLmdldElucHV0cygpW2ldLnRvU3RyaW5nKGluZGVudCArIDIpO1xuICAgICAgICBzdHIgKz0gJ1xcbidcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRoaXMuZ2V0T3V0cHV0cygpICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHN0ciArPSBHZW5VdGlscy5rdkxpbmUoXCJPdXRwdXRzXCIsIFwiXCIsIGluZGVudCk7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZ2V0T3V0cHV0cygpLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHN0ciArPSBHZW5VdGlscy5rdkxpbmUoaSArIDEsIFwiXCIsIGluZGVudCArIDEpO1xuICAgICAgICBzdHIgKz0gdGhpcy5nZXRPdXRwdXRzKClbaV0udG9TdHJpbmcoaW5kZW50ICsgMik7XG4gICAgICAgIHN0ciArPSAnXFxuJ1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc3RyLnNsaWNlKDAsIHN0ci5sZW5ndGggLSAxKTsgIC8vIHN0cmlwIGxhc3QgbmV3bGluZVxuICB9XG59XG4iXSwibWFwcGluZ3MiOiJ5TEFBQSxJQUFBQSxPQUFBLEdBQUFDLHNCQUFBLENBQUFDLE9BQUE7QUFDQSxJQUFBQyxTQUFBLEdBQUFGLHNCQUFBLENBQUFDLE9BQUE7O0FBRUEsSUFBQUUsYUFBQSxHQUFBSCxzQkFBQSxDQUFBQyxPQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNlLE1BQU1HLFFBQVEsQ0FBQzs7RUFFNUIsT0FBZ0JDLGtCQUFrQixHQUFHLGtCQUFrQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQXdDdkRDLFdBQVdBLENBQUNDLEVBQXNCLEVBQUU7SUFDbENDLE1BQU0sQ0FBQ0MsTUFBTSxDQUFDLElBQUksRUFBRUYsRUFBRSxDQUFDO0lBQ3ZCLElBQUksQ0FBQ0csS0FBSyxHQUFHQyxTQUFTOztJQUV0QjtJQUNBLElBQUksSUFBSSxDQUFDQyxLQUFLLEtBQUtELFNBQVMsRUFBRSxJQUFJLENBQUNDLEtBQUssR0FBRyxJQUFJQyxVQUFVLENBQUMsSUFBSSxDQUFDRCxLQUFLLENBQUM7O0lBRXJFO0lBQ0EsSUFBSSxJQUFJLENBQUNFLEdBQUcsS0FBS0gsU0FBUyxJQUFJLE9BQU8sSUFBSSxDQUFDRyxHQUFHLEtBQUssUUFBUSxFQUFFLElBQUksQ0FBQ0EsR0FBRyxHQUFHQyxNQUFNLENBQUMsSUFBSSxDQUFDRCxHQUFHLENBQUM7SUFDdkYsSUFBSSxJQUFJLENBQUNFLFVBQVUsS0FBS0wsU0FBUyxJQUFJLE9BQU8sSUFBSSxDQUFDSyxVQUFVLEtBQUssUUFBUSxFQUFFLElBQUksQ0FBQ0EsVUFBVSxHQUFHRCxNQUFNLENBQUMsSUFBSSxDQUFDQyxVQUFVLENBQUM7O0lBRW5IO0lBQ0EsSUFBSSxJQUFJLENBQUNDLE1BQU0sRUFBRTtNQUNmLElBQUksQ0FBQ0EsTUFBTSxHQUFHLElBQUksQ0FBQ0EsTUFBTSxD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