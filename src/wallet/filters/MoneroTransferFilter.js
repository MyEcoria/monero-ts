assert = require("assert");
const MoneroSubaddressFilter = require("./MoneroSubaddressFilter");
const MoneroTransfer = require("../model/MoneroTransfer");

/**
 * Filters transfers by their attributes.
 * 
 * Transfers are only filtered if they don't match any fields that are set in
 * the filter.
 */
class MoneroTransferFilter extends MoneroSubaddressFilter {
  
  getIsOutgoing() {
    return this.isOutgoing;
  }
  
  setIsOutgoing(isOutgoing) {
    this.isOutgoing = isOutgoing;
    return this;
  }
  
  getIsIncoming() {
    return this.isOutgoing === undefined ? undefined : !this.isOutgoing;
  }
  
  setIsIncoming(isIncoming) {
    return this.setIsOutgoing(isIncoming === undefined ? undefined : !isIncoming);
  }
  
  meetsCriteria(transfer) {
    assert(transfer instanceof MoneroTransfer);
    if (!super.meetsCriteria(transfer)) return false;
    if (this.getIsIncoming() !== undefined && this.getIsIncoming() !== transfer.getIsIncoming()) return false;
    if (this.getIsOutgoing() !== undefined && this.getIsOutgoing() !== transfer.getIsOutgoing()) return false;
    return true;
  }
}

module.exports = MoneroTransferFilter;