"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0; /**
 * Models the result of checking for a daemon update.
 */
class MoneroDaemonUpdateCheckResult {







  constructor(result) {
    Object.assign(this, result);
  }

  /**
   * Indicates if an update is available.
   * 
   * @return {boolean} true if an update is available, false otherwise
   */
  getIsUpdateAvailable() {
    return this.isUpdateAvailable;
  }

  setIsUpdateAvailable(isUpdateAvailable) {
    this.isUpdateAvailable = isUpdateAvailable;
    return this;
  }

  /**
   * Get the update's version.
   * 
   * @return {string} is the update's version
   */
  getVersion() {
    return this.version;
  }

  setVersion(version) {
    this.version = version;
    return this;
  }

  /**
   * Get the update's hash.
   * 
   * @return {string} is the update's hash
   */
  getHash() {
    return this.hash;
  }

  setHash(hash) {
    this.hash = hash;
    return this;
  }

  /**
   * Get the uri to automatically download the update.
   * 
   * @return {string} is the uri to automatically download the update
   */
  getAutoUri() {
    return this.autoUri;
  }

  setAutoUri(autoUri) {
    this.autoUri = autoUri;
    return this;
  }

  /**
   * Get the uri to manually download the update.
   * 
   * @return {string} is the uri to manually download the update
   */
  getUserUri() {
    return this.userUri;
  }

  setUserUri(userUri) {
    this.userUri = userUri;
    return this;
  }
}exports.default = MoneroDaemonUpdateCheckResult;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNb25lcm9EYWVtb25VcGRhdGVDaGVja1Jlc3VsdCIsImNvbnN0cnVjdG9yIiwicmVzdWx0IiwiT2JqZWN0IiwiYXNzaWduIiwiZ2V0SXNVcGRhdGVBdmFpbGFibGUiLCJpc1VwZGF0ZUF2YWlsYWJsZSIsInNldElzVXBkYXRlQXZhaWxhYmxlIiwiZ2V0VmVyc2lvbiIsInZlcnNpb24iLCJzZXRWZXJzaW9uIiwiZ2V0SGFzaCIsImhhc2giLCJzZXRIYXNoIiwiZ2V0QXV0b1VyaSIsImF1dG9VcmkiLCJzZXRBdXRvVXJpIiwiZ2V0VXNlclVyaSIsInVzZXJVcmkiLCJzZXRVc2VyVXJpIiwiZXhwb3J0cyIsImRlZmF1bHQiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi90cy9kYWVtb24vbW9kZWwvTW9uZXJvRGFlbW9uVXBkYXRlQ2hlY2tSZXN1bHQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBNb2RlbHMgdGhlIHJlc3VsdCBvZiBjaGVja2luZyBmb3IgYSBkYWVtb24gdXBkYXRlLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNb25lcm9EYWVtb25VcGRhdGVDaGVja1Jlc3VsdCB7XG5cbiAgaXNVcGRhdGVBdmFpbGFibGU6IGJvb2xlYW47XG4gIHZlcnNpb246IHN0cmluZztcbiAgaGFzaDogc3RyaW5nO1xuICBhdXRvVXJpOiBzdHJpbmc7XG4gIHVzZXJVcmk6IHN0cmluZztcbiAgXG4gIGNvbnN0cnVjdG9yKHJlc3VsdD86IE1vbmVyb0RhZW1vblVwZGF0ZUNoZWNrUmVzdWx0KSB7XG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLCByZXN1bHQpO1xuICB9XG4gIFxuICAvKipcbiAgICogSW5kaWNhdGVzIGlmIGFuIHVwZGF0ZSBpcyBhdmFpbGFibGUuXG4gICAqIFxuICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIGFuIHVwZGF0ZSBpcyBhdmFpbGFibGUsIGZhbHNlIG90aGVyd2lzZVxuICAgKi9cbiAgZ2V0SXNVcGRhdGVBdmFpbGFibGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaXNVcGRhdGVBdmFpbGFibGU7XG4gIH1cbiAgXG4gIHNldElzVXBkYXRlQXZhaWxhYmxlKGlzVXBkYXRlQXZhaWxhYmxlOiBib29sZWFuKTogTW9uZXJvRGFlbW9uVXBkYXRlQ2hlY2tSZXN1bHQge1xuICAgIHRoaXMuaXNVcGRhdGVBdmFpbGFibGUgPSBpc1VwZGF0ZUF2YWlsYWJsZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBcbiAgLyoqXG4gICAqIEdldCB0aGUgdXBkYXRlJ3MgdmVyc2lvbi5cbiAgICogXG4gICAqIEByZXR1cm4ge3N0cmluZ30gaXMgdGhlIHVwZGF0ZSdzIHZlcnNpb25cbiAgICovXG4gIGdldFZlcnNpb24oKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy52ZXJzaW9uO1xuICB9XG4gIFxuICBzZXRWZXJzaW9uKHZlcnNpb246IHN0cmluZyk6IE1vbmVyb0RhZW1vblVwZGF0ZUNoZWNrUmVzdWx0IHtcbiAgICB0aGlzLnZlcnNpb24gPSB2ZXJzaW9uO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIFxuICAvKipcbiAgICogR2V0IHRoZSB1cGRhdGUncyBoYXNoLlxuICAgKiBcbiAgICogQHJldHVybiB7c3RyaW5nfSBpcyB0aGUgdXBkYXRlJ3MgaGFzaFxuICAgKi9cbiAgZ2V0SGFzaCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmhhc2g7XG4gIH1cbiAgXG4gIHNldEhhc2goaGFzaDogc3RyaW5nKTogTW9uZXJvRGFlbW9uVXBkYXRlQ2hlY2tSZXN1bHQge1xuICAgIHRoaXMuaGFzaCA9IGhhc2g7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBHZXQgdGhlIHVyaSB0byBhdXRvbWF0aWNhbGx5IGRvd25sb2FkIHRoZSB1cGRhdGUuXG4gICAqIFxuICAgKiBAcmV0dXJuIHtzdHJpbmd9IGlzIHRoZSB1cmkgdG8gYXV0b21hdGljYWxseSBkb3dubG9hZCB0aGUgdXBkYXRlXG4gICAqL1xuICBnZXRBdXRvVXJpKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuYXV0b1VyaTtcbiAgfVxuICBcbiAgc2V0QXV0b1VyaShhdXRvVXJpOiBzdHJpbmcpOiBNb25lcm9EYWVtb25VcGRhdGVDaGVja1Jlc3VsdCB7XG4gICAgdGhpcy5hdXRvVXJpID0gYXV0b1VyaTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBcbiAgLyoqXG4gICAqIEdldCB0aGUgdXJpIHRvIG1hbnVhbGx5IGRvd25sb2FkIHRoZSB1cGRhdGUuXG4gICAqIFxuICAgKiBAcmV0dXJuIHtzdHJpbmd9IGlzIHRoZSB1cmkgdG8gbWFudWFsbHkgZG93bmxvYWQgdGhlIHVwZGF0ZVxuICAgKi9cbiAgZ2V0VXNlclVyaSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnVzZXJVcmk7XG4gIH1cbiAgXG4gIHNldFVzZXJVcmkodXNlclVyaTogc3RyaW5nKTogTW9uZXJvRGFlbW9uVXBkYXRlQ2hlY2tSZXN1bHQge1xuICAgIHRoaXMudXNlclVyaSA9IHVzZXJVcmk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn0iXSwibWFwcGluZ3MiOiJxR0FBQTtBQUNBO0FBQ0E7QUFDZSxNQUFNQSw2QkFBNkIsQ0FBQzs7Ozs7Ozs7RUFRakRDLFdBQVdBLENBQUNDLE1BQXNDLEVBQUU7SUFDbERDLE1BQU0sQ0FBQ0MsTUFBTSxDQUFDLElBQUksRUFBRUYsTUFBTSxDQUFDO0VBQzdCOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRUcsb0JBQW9CQSxDQUFBLEVBQVk7SUFDOUIsT0FBTyxJQUFJLENBQUNDLGlCQUFpQjtFQUMvQjs7RUFFQUMsb0JBQW9CQSxDQUFDRCxpQkFBMEIsRUFBaUM7SUFDOUUsSUFBSSxDQUFDQSxpQkFBaUIsR0FBR0EsaUJBQWlCO0lBQzFDLE9BQU8sSUFBSTtFQUNiOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRUUsVUFBVUEsQ0FBQSxFQUFXO0lBQ25CLE9BQU8sSUFBSSxDQUFDQyxPQUFPO0VBQ3JCOztFQUVBQyxVQUFVQSxDQUFDRCxPQUFlLEVBQWlDO0lBQ3pELElBQUksQ0FBQ0EsT0FBTyxHQUFHQSxPQUFPO0lBQ3RCLE9BQU8sSUFBSTtFQUNiOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRUUsT0FBT0EsQ0FBQSxFQUFXO0lBQ2hCLE9BQU8sSUFBSSxDQUFDQyxJQUFJO0VBQ2xCOztFQUVBQyxPQUFPQSxDQUFDRCxJQUFZLEVBQWlDO0lBQ25ELElBQUksQ0FBQ0EsSUFBSSxHQUFHQSxJQUFJO0lBQ2hCLE9BQU8sSUFBSTtFQUNiOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRUUsVUFBVUEsQ0FBQSxFQUFXO0lBQ25CLE9BQU8sSUFBSSxDQUFDQyxPQUFPO0VBQ3JCOztFQUVBQyxVQUFVQSxDQUFDRCxPQUFlLEVBQWlDO0lBQ3pELElBQUksQ0FBQ0EsT0FBTyxHQUFHQSxPQUFPO0lBQ3RCLE9BQU8sSUFBSTtFQUNiOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRUUsVUFBVUEsQ0FBQSxFQUFXO0lBQ25CLE9BQU8sSUFBSSxDQUFDQyxPQUFPO0VBQ3JCOztFQUVBQyxVQUFVQSxDQUFDRCxPQUFlLEVBQWlDO0lBQ3pELElBQUksQ0FBQ0EsT0FBTyxHQUFHQSxPQUFPO0lBQ3RCLE9BQU8sSUFBSTtFQUNiO0FBQ0YsQ0FBQ0UsT0FBQSxDQUFBQyxPQUFBLEdBQUFyQiw2QkFBQSJ9