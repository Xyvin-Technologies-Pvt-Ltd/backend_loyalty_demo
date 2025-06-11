const mongoose = require("mongoose");

/**
 * Safe transaction wrapper - works on both standalone and replica set MongoDB
 */
class SafeTransaction {
  constructor() {
    this.session = null;
    this.hasTransaction = false;
  }

  async start() {
    this.session = await mongoose.startSession();

    try {
      this.session.startTransaction();
      this.hasTransaction = true;
    } catch (error) {
      // Standalone MongoDB - continue without transaction
      this.hasTransaction = false;
    }

    return this.session;
  }

  async commit() {
    if (this.hasTransaction) {
      await this.session.commitTransaction();
    }
  }

  async abort() {
    if (this.hasTransaction) {
      await this.session.abortTransaction();
    }
  }

  async end() {
    if (this.session) {
      this.session.endSession();
    }
  }
}

module.exports = { SafeTransaction };
