"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0; /**
 * Models daemon mining status.
 */
class MoneroMiningStatus {







  constructor(status) {
    Object.assign(this, status);
  }

  toJson() {
    return Object.assign({}, this);
  }

  getIsActive() {
    return this.isActive;
  }

  setIsActive(isActive) {
    this.isActive = isActive;
    return this;
  }

  getAddress() {
    return this.address;
  }

  setAddress(address) {
    this.address = address;
    return this;
  }

  getSpeed() {
    return this.speed;
  }

  setSpeed(speed) {
    this.speed = speed;
    return this;
  }

  getNumThreads() {
    return this.numThreads;
  }

  setNumThreads(numThreads) {
    this.numThreads = numThreads;
    return this;
  }

  getIsBackground() {
    return this.isBackground;
  }

  setIsBackground(isBackground) {
    this.isBackground = isBackground;
    return this;
  }
}exports.default = MoneroMiningStatus;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNb25lcm9NaW5pbmdTdGF0dXMiLCJjb25zdHJ1Y3RvciIsInN0YXR1cyIsIk9iamVjdCIsImFzc2lnbiIsInRvSnNvbiIsImdldElzQWN0aXZlIiwiaXNBY3RpdmUiLCJzZXRJc0FjdGl2ZSIsImdldEFkZHJlc3MiLCJhZGRyZXNzIiwic2V0QWRkcmVzcyIsImdldFNwZWVkIiwic3BlZWQiLCJzZXRTcGVlZCIsImdldE51bVRocmVhZHMiLCJudW1UaHJlYWRzIiwic2V0TnVtVGhyZWFkcyIsImdldElzQmFja2dyb3VuZCIsImlzQmFja2dyb3VuZCIsInNldElzQmFja2dyb3VuZCIsImV4cG9ydHMiLCJkZWZhdWx0Il0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vdHMvZGFlbW9uL21vZGVsL01vbmVyb01pbmluZ1N0YXR1cy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIE1vZGVscyBkYWVtb24gbWluaW5nIHN0YXR1cy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTW9uZXJvTWluaW5nU3RhdHVzIHtcblxuICBpc0FjdGl2ZTogYm9vbGVhbjtcbiAgYWRkcmVzczogc3RyaW5nO1xuICBzcGVlZDogbnVtYmVyO1xuICBudW1UaHJlYWRzOiBudW1iZXI7XG4gIGlzQmFja2dyb3VuZDogYm9vbGVhbjtcbiAgXG4gIGNvbnN0cnVjdG9yKHN0YXR1cz86IFBhcnRpYWw8TW9uZXJvTWluaW5nU3RhdHVzPikge1xuICAgIE9iamVjdC5hc3NpZ24odGhpcywgc3RhdHVzKTtcbiAgfVxuICBcbiAgdG9Kc29uKCkge1xuICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCB0aGlzKTtcbiAgfVxuICBcbiAgZ2V0SXNBY3RpdmUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaXNBY3RpdmU7XG4gIH1cbiAgXG4gIHNldElzQWN0aXZlKGlzQWN0aXZlOiBib29sZWFuKTogTW9uZXJvTWluaW5nU3RhdHVzIHtcbiAgICB0aGlzLmlzQWN0aXZlID0gaXNBY3RpdmU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgXG4gIGdldEFkZHJlc3MoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5hZGRyZXNzO1xuICB9XG4gIFxuICBzZXRBZGRyZXNzKGFkZHJlc3M6IHN0cmluZyk6IE1vbmVyb01pbmluZ1N0YXR1cyB7XG4gICAgdGhpcy5hZGRyZXNzID0gYWRkcmVzcztcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBcbiAgZ2V0U3BlZWQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5zcGVlZDtcbiAgfVxuICBcbiAgc2V0U3BlZWQoc3BlZWQ6IG51bWJlcik6IE1vbmVyb01pbmluZ1N0YXR1cyB7XG4gICAgdGhpcy5zcGVlZCA9IHNwZWVkO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIFxuICBnZXROdW1UaHJlYWRzKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMubnVtVGhyZWFkcztcbiAgfVxuICBcbiAgc2V0TnVtVGhyZWFkcyhudW1UaHJlYWRzOiBudW1iZXIpOiBNb25lcm9NaW5pbmdTdGF0dXMge1xuICAgIHRoaXMubnVtVGhyZWFkcyA9IG51bVRocmVhZHM7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgXG4gIGdldElzQmFja2dyb3VuZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pc0JhY2tncm91bmQ7XG4gIH1cbiAgXG4gIHNldElzQmFja2dyb3VuZChpc0JhY2tncm91bmQ6IGJvb2xlYW4pOiBNb25lcm9NaW5pbmdTdGF0dXMge1xuICAgIHRoaXMuaXNCYWNrZ3JvdW5kID0gaXNCYWNrZ3JvdW5kO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG4iXSwibWFwcGluZ3MiOiJxR0FBQTtBQUNBO0FBQ0E7QUFDZSxNQUFNQSxrQkFBa0IsQ0FBQzs7Ozs7Ozs7RUFRdENDLFdBQVdBLENBQUNDLE1BQW9DLEVBQUU7SUFDaERDLE1BQU0sQ0FBQ0MsTUFBTSxDQUFDLElBQUksRUFBRUYsTUFBTSxDQUFDO0VBQzdCOztFQUVBRyxNQUFNQSxDQUFBLEVBQUc7SUFDUCxPQUFPRixNQUFNLENBQUNDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUM7RUFDaEM7O0VBRUFFLFdBQVdBLENBQUEsRUFBWTtJQUNyQixPQUFPLElBQUksQ0FBQ0MsUUFBUTtFQUN0Qjs7RUFFQUMsV0FBV0EsQ0FBQ0QsUUFBaUIsRUFBc0I7SUFDakQsSUFBSSxDQUFDQSxRQUFRLEdBQUdBLFFBQVE7SUFDeEIsT0FBTyxJQUFJO0VBQ2I7O0VBRUFFLFVBQVVBLENBQUEsRUFBVztJQUNuQixPQUFPLElBQUksQ0FBQ0MsT0FBTztFQUNyQjs7RUFFQUMsVUFBVUEsQ0FBQ0QsT0FBZSxFQUFzQjtJQUM5QyxJQUFJLENBQUNBLE9BQU8sR0FBR0EsT0FBTztJQUN0QixPQUFPLElBQUk7RUFDYjs7RUFFQUUsUUFBUUEsQ0FBQSxFQUFXO0lBQ2pCLE9BQU8sSUFBSSxDQUFDQyxLQUFLO0VBQ25COztFQUVBQyxRQUFRQSxDQUFDRCxLQUFhLEVBQXNCO0lBQzFDLElBQUksQ0FBQ0EsS0FBSyxHQUFHQSxLQUFLO0lBQ2xCLE9BQU8sSUFBSTtFQUNiOztFQUVBRSxhQUFhQSxDQUFBLEVBQVc7SUFDdEIsT0FBTyxJQUFJLENBQUNDLFVBQVU7RUFDeEI7O0VBRUFDLGFBQWFBLENBQUNELFVBQWtCLEVBQXNCO0lBQ3BELElBQUksQ0FBQ0EsVUFBVSxHQUFHQSxVQUFVO0lBQzVCLE9BQU8sSUFBSTtFQUNiOztFQUVBRSxlQUFlQSxDQUFBLEVBQVk7SUFDekIsT0FBTyxJQUFJLENBQUNDLFlBQVk7RUFDMUI7O0VBRUFDLGVBQWVBLENBQUNELFlBQXFCLEVBQXNCO0lBQ3pELElBQUksQ0FBQ0EsWUFBWSxHQUFHQSxZQUFZO0lBQ2hDLE9BQU8sSUFBSTtFQUNiO0FBQ0YsQ0FBQ0UsT0FBQSxDQUFBQyxPQUFBLEdBQUF0QixrQkFBQSJ9