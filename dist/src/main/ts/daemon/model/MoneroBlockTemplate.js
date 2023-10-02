"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0; /**
 * Monero block template to mine.
 */
class MoneroBlockTemplate {












  constructor(template) {
    Object.assign(this, template);
    if (this.expectedReward !== undefined && typeof this.expectedReward !== "bigint") this.expectedReward = BigInt(this.expectedReward);
    if (this.difficulty !== undefined && typeof this.difficulty !== "bigint") this.difficulty = BigInt(this.difficulty);
  }

  toJson() {
    let json = Object.assign({}, this);
    if (this.getExpectedReward() !== undefined) json.expectedReward = this.getExpectedReward().toString();
    if (this.getDifficulty() !== undefined) json.difficulty = this.getDifficulty().toString();
    return json;
  }

  getBlockTemplateBlob() {
    return this.blockTemplateBlob;
  }

  setBlockTemplateBlob(blockTemplateBlob) {
    this.blockTemplateBlob = blockTemplateBlob;
    return this;
  }

  getBlockHashingBlob() {
    return this.blockHashingBlob;
  }

  setBlockHashingBlob(blockHashingBlob) {
    this.blockHashingBlob = blockHashingBlob;
    return this;
  }

  getDifficulty() {
    return this.difficulty;
  }

  setDifficulty(difficulty) {
    this.difficulty = difficulty;
    return this;
  }

  getExpectedReward() {
    return this.expectedReward;
  }

  setExpectedReward(expectedReward) {
    this.expectedReward = expectedReward;
    return this;
  }

  getHeight() {
    return this.height;
  }

  setHeight(height) {
    this.height = height;
    return this;
  }

  getPrevHash() {
    return this.prevId;
  }

  setPrevHash(prevId) {
    this.prevId = prevId;
    return this;
  }

  getReservedOffset() {
    return this.reservedOffset;
  }

  setReservedOffset(reservedOffset) {
    this.reservedOffset = reservedOffset;
    return this;
  }

  getSeedHeight() {
    return this.height;
  }

  setSeedHeight(seedHeight) {
    this.seedHeight = seedHeight;
    return this;
  }

  getSeedHash() {
    return this.seedHash;
  }

  setSeedHash(seedHash) {
    this.seedHash = seedHash;
    return this;
  }

  getNextSeedHash() {
    return this.nextSeedHash;
  }

  setNextSeedHash(nextSeedHash) {
    this.nextSeedHash = nextSeedHash;
    return this;
  }
}exports.default = MoneroBlockTemplate;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNb25lcm9CbG9ja1RlbXBsYXRlIiwiY29uc3RydWN0b3IiLCJ0ZW1wbGF0ZSIsIk9iamVjdCIsImFzc2lnbiIsImV4cGVjdGVkUmV3YXJkIiwidW5kZWZpbmVkIiwiQmlnSW50IiwiZGlmZmljdWx0eSIsInRvSnNvbiIsImpzb24iLCJnZXRFeHBlY3RlZFJld2FyZCIsInRvU3RyaW5nIiwiZ2V0RGlmZmljdWx0eSIsImdldEJsb2NrVGVtcGxhdGVCbG9iIiwiYmxvY2tUZW1wbGF0ZUJsb2IiLCJzZXRCbG9ja1RlbXBsYXRlQmxvYiIsImdldEJsb2NrSGFzaGluZ0Jsb2IiLCJibG9ja0hhc2hpbmdCbG9iIiwic2V0QmxvY2tIYXNoaW5nQmxvYiIsInNldERpZmZpY3VsdHkiLCJzZXRFeHBlY3RlZFJld2FyZCIsImdldEhlaWdodCIsImhlaWdodCIsInNldEhlaWdodCIsImdldFByZXZIYXNoIiwicHJldklkIiwic2V0UHJldkhhc2giLCJnZXRSZXNlcnZlZE9mZnNldCIsInJlc2VydmVkT2Zmc2V0Iiwic2V0UmVzZXJ2ZWRPZmZzZXQiLCJnZXRTZWVkSGVpZ2h0Iiwic2V0U2VlZEhlaWdodCIsInNlZWRIZWlnaHQiLCJnZXRTZWVkSGFzaCIsInNlZWRIYXNoIiwic2V0U2VlZEhhc2giLCJnZXROZXh0U2VlZEhhc2giLCJuZXh0U2VlZEhhc2giLCJzZXROZXh0U2VlZEhhc2giLCJleHBvcnRzIiwiZGVmYXVsdCJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3RzL2RhZW1vbi9tb2RlbC9Nb25lcm9CbG9ja1RlbXBsYXRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogTW9uZXJvIGJsb2NrIHRlbXBsYXRlIHRvIG1pbmUuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1vbmVyb0Jsb2NrVGVtcGxhdGUge1xuXG4gIGJsb2NrVGVtcGxhdGVCbG9iOiBzdHJpbmc7XG4gIGJsb2NrSGFzaGluZ0Jsb2I6IHN0cmluZztcbiAgZGlmZmljdWx0eTogYmlnaW50O1xuICBleHBlY3RlZFJld2FyZDogYmlnaW50O1xuICBoZWlnaHQ6IG51bWJlcjtcbiAgcHJldklkOiBzdHJpbmc7XG4gIHJlc2VydmVkT2Zmc2V0OiBudW1iZXI7XG4gIHNlZWRIZWlnaHQ6IG51bWJlcjtcbiAgc2VlZEhhc2g6IHN0cmluZztcbiAgbmV4dFNlZWRIYXNoOiBzdHJpbmc7XG4gIFxuICBjb25zdHJ1Y3Rvcih0ZW1wbGF0ZT86IFBhcnRpYWw8TW9uZXJvQmxvY2tUZW1wbGF0ZT4pIHtcbiAgICBPYmplY3QuYXNzaWduKHRoaXMsIHRlbXBsYXRlKTtcbiAgICBpZiAodGhpcy5leHBlY3RlZFJld2FyZCAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiB0aGlzLmV4cGVjdGVkUmV3YXJkICE9PSBcImJpZ2ludFwiKSB0aGlzLmV4cGVjdGVkUmV3YXJkID0gQmlnSW50KHRoaXMuZXhwZWN0ZWRSZXdhcmQpO1xuICAgIGlmICh0aGlzLmRpZmZpY3VsdHkgIT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgdGhpcy5kaWZmaWN1bHR5ICE9PSBcImJpZ2ludFwiKSB0aGlzLmRpZmZpY3VsdHkgPSBCaWdJbnQodGhpcy5kaWZmaWN1bHR5KTtcbiAgfVxuICBcbiAgdG9Kc29uKCk6IGFueSB7XG4gICAgbGV0IGpzb246IGFueSA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMpO1xuICAgIGlmICh0aGlzLmdldEV4cGVjdGVkUmV3YXJkKCkgIT09IHVuZGVmaW5lZCkganNvbi5leHBlY3RlZFJld2FyZCA9IHRoaXMuZ2V0RXhwZWN0ZWRSZXdhcmQoKS50b1N0cmluZygpO1xuICAgIGlmICh0aGlzLmdldERpZmZpY3VsdHkoKSAhPT0gdW5kZWZpbmVkKSBqc29uLmRpZmZpY3VsdHkgPSB0aGlzLmdldERpZmZpY3VsdHkoKS50b1N0cmluZygpO1xuICAgIHJldHVybiBqc29uO1xuICB9XG4gIFxuICBnZXRCbG9ja1RlbXBsYXRlQmxvYigpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmJsb2NrVGVtcGxhdGVCbG9iO1xuICB9XG4gIFxuICBzZXRCbG9ja1RlbXBsYXRlQmxvYihibG9ja1RlbXBsYXRlQmxvYjogc3RyaW5nKTogTW9uZXJvQmxvY2tUZW1wbGF0ZSB7XG4gICAgdGhpcy5ibG9ja1RlbXBsYXRlQmxvYiA9IGJsb2NrVGVtcGxhdGVCbG9iO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIFxuICBnZXRCbG9ja0hhc2hpbmdCbG9iKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuYmxvY2tIYXNoaW5nQmxvYjtcbiAgfVxuICBcbiAgc2V0QmxvY2tIYXNoaW5nQmxvYihibG9ja0hhc2hpbmdCbG9iOiBzdHJpbmcpOiBNb25lcm9CbG9ja1RlbXBsYXRlIHtcbiAgICB0aGlzLmJsb2NrSGFzaGluZ0Jsb2IgPSBibG9ja0hhc2hpbmdCbG9iO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIFxuICBnZXREaWZmaWN1bHR5KCk6IGJpZ2ludCB7XG4gICAgcmV0dXJuIHRoaXMuZGlmZmljdWx0eTtcbiAgfVxuICBcbiAgc2V0RGlmZmljdWx0eShkaWZmaWN1bHR5OiBiaWdpbnQpOiBNb25lcm9CbG9ja1RlbXBsYXRlIHtcbiAgICB0aGlzLmRpZmZpY3VsdHkgPSBkaWZmaWN1bHR5O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIFxuICBnZXRFeHBlY3RlZFJld2FyZCgpOiBiaWdpbnQge1xuICAgIHJldHVybiB0aGlzLmV4cGVjdGVkUmV3YXJkO1xuICB9XG4gIFxuICBzZXRFeHBlY3RlZFJld2FyZChleHBlY3RlZFJld2FyZDogYmlnaW50KTogTW9uZXJvQmxvY2tUZW1wbGF0ZSB7XG4gICAgdGhpcy5leHBlY3RlZFJld2FyZCA9IGV4cGVjdGVkUmV3YXJkO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIFxuICBnZXRIZWlnaHQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5oZWlnaHQ7XG4gIH1cbiAgXG4gIHNldEhlaWdodChoZWlnaHQ6IG51bWJlcik6IE1vbmVyb0Jsb2NrVGVtcGxhdGUge1xuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIFxuICBnZXRQcmV2SGFzaCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnByZXZJZDtcbiAgfVxuICBcbiAgc2V0UHJldkhhc2gocHJldklkOiBzdHJpbmcpOiBNb25lcm9CbG9ja1RlbXBsYXRlIHtcbiAgICB0aGlzLnByZXZJZCA9IHByZXZJZDtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBcbiAgZ2V0UmVzZXJ2ZWRPZmZzZXQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5yZXNlcnZlZE9mZnNldDtcbiAgfVxuICBcbiAgc2V0UmVzZXJ2ZWRPZmZzZXQocmVzZXJ2ZWRPZmZzZXQ6IG51bWJlcik6IE1vbmVyb0Jsb2NrVGVtcGxhdGUge1xuICAgIHRoaXMucmVzZXJ2ZWRPZmZzZXQgPSByZXNlcnZlZE9mZnNldDtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBcbiAgZ2V0U2VlZEhlaWdodCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmhlaWdodDtcbiAgfVxuICBcbiAgc2V0U2VlZEhlaWdodChzZWVkSGVpZ2h0OiBudW1iZXIpOiBNb25lcm9CbG9ja1RlbXBsYXRlIHtcbiAgICB0aGlzLnNlZWRIZWlnaHQgPSBzZWVkSGVpZ2h0O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIFxuICBnZXRTZWVkSGFzaCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnNlZWRIYXNoO1xuICB9XG4gIFxuICBzZXRTZWVkSGFzaChzZWVkSGFzaDogc3RyaW5nKTogTW9uZXJvQmxvY2tUZW1wbGF0ZSB7XG4gICAgdGhpcy5zZWVkSGFzaCA9IHNlZWRIYXNoO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIFxuICBnZXROZXh0U2VlZEhhc2goKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5uZXh0U2VlZEhhc2hcbiAgfVxuICBcbiAgc2V0TmV4dFNlZWRIYXNoKG5leHRTZWVkSGFzaDogc3RyaW5nKTogTW9uZXJvQmxvY2tUZW1wbGF0ZSB7XG4gICAgdGhpcy5uZXh0U2VlZEhhc2ggPSBuZXh0U2VlZEhhc2g7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn0iXSwibWFwcGluZ3MiOiJxR0FBQTtBQUNBO0FBQ0E7QUFDZSxNQUFNQSxtQkFBbUIsQ0FBQzs7Ozs7Ozs7Ozs7OztFQWF2Q0MsV0FBV0EsQ0FBQ0MsUUFBdUMsRUFBRTtJQUNuREMsTUFBTSxDQUFDQyxNQUFNLENBQUMsSUFBSSxFQUFFRixRQUFRLENBQUM7SUFDN0IsSUFBSSxJQUFJLENBQUNHLGNBQWMsS0FBS0MsU0FBUyxJQUFJLE9BQU8sSUFBSSxDQUFDRCxjQUFjLEtBQUssUUFBUSxFQUFFLElBQUksQ0FBQ0EsY0FBYyxHQUFHRSxNQUFNLENBQUMsSUFBSSxDQUFDRixjQUFjLENBQUM7SUFDbkksSUFBSSxJQUFJLENBQUNHLFVBQVUsS0FBS0YsU0FBUyxJQUFJLE9BQU8sSUFBSSxDQUFDRSxVQUFVLEtBQUssUUFBUSxFQUFFLElBQUksQ0FBQ0EsVUFBVSxHQUFHRCxNQUFNLENBQUMsSUFBSSxDQUFDQyxVQUFVLENBQUM7RUFDckg7O0VBRUFDLE1BQU1BLENBQUEsRUFBUTtJQUNaLElBQUlDLElBQVMsR0FBR1AsTUFBTSxDQUFDQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDO0lBQ3ZDLElBQUksSUFBSSxDQUFDTyxpQkFBaUIsQ0FBQyxDQUFDLEtBQUtMLFNBQVMsRUFBRUksSUFBSSxDQUFDTCxjQUFjLEdBQUcsSUFBSSxDQUFDTSxpQkFBaUIsQ0FBQyxDQUFDLENBQUNDLFFBQVEsQ0FBQyxDQUFDO0lBQ3JHLElBQUksSUFBSSxDQUFDQyxhQUFhLENBQUMsQ0FBQyxLQUFLUCxTQUFTLEVBQUVJLElBQUksQ0FBQ0YsVUFBVSxHQUFHLElBQUksQ0FBQ0ssYUFBYSxDQUFDLENBQUMsQ0FBQ0QsUUFBUSxDQUFDLENBQUM7SUFDekYsT0FBT0YsSUFBSTtFQUNiOztFQUVBSSxvQkFBb0JBLENBQUEsRUFBVztJQUM3QixPQUFPLElBQUksQ0FBQ0MsaUJBQWlCO0VBQy9COztFQUVBQyxvQkFBb0JBLENBQUNELGlCQUF5QixFQUF1QjtJQUNuRSxJQUFJLENBQUNBLGlCQUFpQixHQUFHQSxpQkFBaUI7SUFDMUMsT0FBTyxJQUFJO0VBQ2I7O0VBRUFFLG1CQUFtQkEsQ0FBQSxFQUFXO0lBQzVCLE9BQU8sSUFBSSxDQUFDQyxnQkFBZ0I7RUFDOUI7O0VBRUFDLG1CQUFtQkEsQ0FBQ0QsZ0JBQXdCLEVBQXVCO0lBQ2pFLElBQUksQ0FBQ0EsZ0JBQWdCLEdBQUdBLGdCQUFnQjtJQUN4QyxPQUFPLElBQUk7RUFDYjs7RUFFQUwsYUFBYUEsQ0FBQSxFQUFXO0lBQ3RCLE9BQU8sSUFBSSxDQUFDTCxVQUFVO0VBQ3hCOztFQUVBWSxhQUFhQSxDQUFDWixVQUFrQixFQUF1QjtJQUNyRCxJQUFJLENBQUNBLFVBQVUsR0FBR0EsVUFBVTtJQUM1QixPQUFPLElBQUk7RUFDYjs7RUFFQUcsaUJBQWlCQSxDQUFBLEVBQVc7SUFDMUIsT0FBTyxJQUFJLENBQUNOLGNBQWM7RUFDNUI7O0VBRUFnQixpQkFBaUJBLENBQUNoQixjQUFzQixFQUF1QjtJQUM3RCxJQUFJLENBQUNBLGNBQWMsR0FBR0EsY0FBYztJQUNwQyxPQUFPLElBQUk7RUFDYjs7RUFFQWlCLFNBQVNBLENBQUEsRUFBVztJQUNsQixPQUFPLElBQUksQ0FBQ0MsTUFBTTtFQUNwQjs7RUFFQUMsU0FBU0EsQ0FBQ0QsTUFBYyxFQUF1QjtJQUM3QyxJQUFJLENBQUNBLE1BQU0sR0FBR0EsTUFBTTtJQUNwQixPQUFPLElBQUk7RUFDYjs7RUFFQUUsV0FBV0EsQ0FBQSxFQUFXO0lBQ3BCLE9BQU8sSUFBSSxDQUFDQyxNQUFNO0VBQ3BCOztFQUVBQyxXQUFXQSxDQUFDRCxNQUFjLEVBQXVCO0lBQy9DLElBQUksQ0FBQ0EsTUFBTSxHQUFHQSxNQUFNO0lBQ3BCLE9BQU8sSUFBSTtFQUNiOztFQUVBRSxpQkFBaUJBLENBQUEsRUFBVztJQUMxQixPQUFPLElBQUksQ0FBQ0MsY0FBYztFQUM1Qjs7RUFFQUMsaUJBQWlCQSxDQUFDRCxjQUFzQixFQUF1QjtJQUM3RCxJQUFJLENBQUNBLGNBQWMsR0FBR0EsY0FBYztJQUNwQyxPQUFPLElBQUk7RUFDYjs7RUFFQUUsYUFBYUEsQ0FBQSxFQUFXO0lBQ3RCLE9BQU8sSUFBSSxDQUFDUixNQUFNO0VBQ3BCOztFQUVBUyxhQUFhQSxDQUFDQyxVQUFrQixFQUF1QjtJQUNyRCxJQUFJLENBQUNBLFVBQVUsR0FBR0EsVUFBVTtJQUM1QixPQUFPLElBQUk7RUFDYjs7RUFFQUMsV0FBV0EsQ0FBQSxFQUFXO0lBQ3BCLE9BQU8sSUFBSSxDQUFDQyxRQUFRO0VBQ3RCOztFQUVBQyxXQUFXQSxDQUFDRCxRQUFnQixFQUF1QjtJQUNqRCxJQUFJLENBQUNBLFFBQVEsR0FBR0EsUUFBUTtJQUN4QixPQUFPLElBQUk7RUFDYjs7RUFFQUUsZUFBZUEsQ0FBQSxFQUFXO0lBQ3hCLE9BQU8sSUFBSSxDQUFDQyxZQUFZO0VBQzFCOztFQUVBQyxlQUFlQSxDQUFDRCxZQUFvQixFQUF1QjtJQUN6RCxJQUFJLENBQUNBLFlBQVksR0FBR0EsWUFBWTtJQUNoQyxPQUFPLElBQUk7RUFDYjtBQUNGLENBQUNFLE9BQUEsQ0FBQUMsT0FBQSxHQUFBekMsbUJBQUEifQ==