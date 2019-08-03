/**
 * Copyright (c) 2017-2019 woodser
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * Parts of this file are originally copyright (c) 2014-2019, The Monero Project
 *
 * Redistribution and use in source and binary forms, with or without modification, are
 * permitted provided that the following conditions are met:
 *
 * All rights reserved.
 *
 * 1. Redistributions of source code must retain the above copyright notice, this list of
 *    conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice, this list
 *    of conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors may be
 *    used to endorse or promote products derived from this software without specific
 *    prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL
 * THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF
 * THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * Parts of this file are originally copyright (c) 2012-2013 The Cryptonote developers
 */

#include "monero_wallet.h"

#include "utils/monero_utils.h"
#include <chrono>
#include <stdio.h>
#include <iostream>
#include "mnemonics/electrum-words.h"
#include "mnemonics/english.h"
#include "wallet/wallet_rpc_server_commands_defs.h"

#ifdef WIN32
#include <boost/locale.hpp>
#include <boost/filesystem.hpp>
#endif

using namespace std;
using namespace cryptonote;
using namespace epee;
using namespace tools;

/**
 * Public library interface.
 */
namespace monero {

  // ------------------------- INITIALIZE CONSTANTS ---------------------------

  static const int DEFAULT_SYNC_INTERVAL_MILLIS = 1000 * 10;   // default refresh interval 10 sec
  static const int DEFAULT_CONNECTION_TIMEOUT_MILLIS = 1000 * 30; // default connection timeout 30 sec

  // ----------------------- INTERNAL PRIVATE HELPERS -----------------------

  bool boolEquals(bool val, const boost::optional<bool>& optVal) {
    return optVal == boost::none ? false : val == *optVal;
  }

  shared_ptr<monero_tx_wallet> buildTxWithIncomingTransfer(const tools::wallet2& wallet2, uint64_t height, const crypto::hash &payment_id, const tools::wallet2::payment_details &pd) {

    // construct block
    shared_ptr<monero_block> block = make_shared<monero_block>();
    block->height = pd.m_block_height;
    block->timestamp = pd.m_timestamp;

    // construct tx
    shared_ptr<monero_tx_wallet> tx = make_shared<monero_tx_wallet>();
    tx->block = block;
    block->txs.push_back(tx);
    tx->id = string_tools::pod_to_hex(pd.m_tx_hash);
    tx->paymentId = string_tools::pod_to_hex(payment_id);
    if (tx->paymentId->substr(16).find_first_not_of('0') == std::string::npos) tx->paymentId = tx->paymentId->substr(0, 16);  // TODO monero core: this should be part of core wallet
    if (tx->paymentId == monero_tx::DEFAULT_PAYMENT_ID) tx->paymentId = boost::none;  // clear default payment id
    tx->unlockTime = pd.m_unlock_time;
    tx->fee = pd.m_fee;
    tx->note = wallet2.get_tx_note(pd.m_tx_hash);
    if (tx->note->empty()) tx->note = boost::none; // clear empty note
    tx->isMinerTx = pd.m_coinbase ? true : false;
    tx->isConfirmed = true;
    tx->isFailed = false;
    tx->isRelayed = true;
    tx->inTxPool = false;
    tx->doNotRelay = false;
    tx->isDoubleSpendSeen = false;

    // compute numConfirmations TODO monero core: this logic is based on wallet_rpc_server.cpp:87 but it should be encapsulated in wallet2
    // TODO: factor out this duplicate code with buildTxWithOutgoingTransfer()
    if (*block->height >= height || (*block->height == 0 && !*tx->inTxPool)) tx->numConfirmations = 0;
    else tx->numConfirmations = height - *block->height;

    // construct transfer
    shared_ptr<monero_incoming_transfer> incomingTransfer = make_shared<monero_incoming_transfer>();
    incomingTransfer->tx = tx;
    tx->incomingTransfers.push_back(incomingTransfer);
    incomingTransfer->amount = pd.m_amount;
    incomingTransfer->accountIndex = pd.m_subaddr_index.major;
    incomingTransfer->subaddressIndex = pd.m_subaddr_index.minor;
    incomingTransfer->address = wallet2.get_subaddress_as_str(pd.m_subaddr_index);

    // compute numSuggestedConfirmations  TODO monero core: this logic is based on wallet_rpc_server.cpp:87 `set_confirmations` but it should be encapsulated in wallet2
    // TODO: factor out this duplicate code with buildTxWithOutgoingTransfer()
    uint64_t blockReward = wallet2.get_last_block_reward();
    if (blockReward == 0) incomingTransfer->numSuggestedConfirmations = 0;
    else incomingTransfer->numSuggestedConfirmations = (*incomingTransfer->amount + blockReward - 1) / blockReward;

    // return pointer to new tx
    return tx;
  }

  shared_ptr<monero_tx_wallet> buildTxWithOutgoingTransfer(const tools::wallet2& wallet2, uint64_t height, const crypto::hash &txid, const tools::wallet2::confirmed_transfer_details &pd) {

    // construct block
    shared_ptr<monero_block> block = make_shared<monero_block>();
    block->height = pd.m_block_height;
    block->timestamp = pd.m_timestamp;

    // construct tx
    shared_ptr<monero_tx_wallet> tx = make_shared<monero_tx_wallet>();
    tx->block = block;
    block->txs.push_back(tx);
    tx->id = string_tools::pod_to_hex(txid);
    tx->paymentId = string_tools::pod_to_hex(pd.m_payment_id);
    if (tx->paymentId->substr(16).find_first_not_of('0') == std::string::npos) tx->paymentId = tx->paymentId->substr(0, 16);  // TODO monero core: this should be part of core wallet
    if (tx->paymentId == monero_tx::DEFAULT_PAYMENT_ID) tx->paymentId = boost::none;  // clear default payment id
    tx->unlockTime = pd.m_unlock_time;
    tx->fee = pd.m_amount_in - pd.m_amount_out;
    tx->note = wallet2.get_tx_note(txid);
    if (tx->note->empty()) tx->note = boost::none; // clear empty note
    tx->isMinerTx = false;
    tx->isConfirmed = true;
    tx->isFailed = false;
    tx->isRelayed = true;
    tx->inTxPool = false;
    tx->doNotRelay = false;
    tx->isDoubleSpendSeen = false;

    // compute numConfirmations TODO monero core: this logic is based on wallet_rpc_server.cpp:87 but it should be encapsulated in wallet2
    if (*block->height >= height || (*block->height == 0 && !*tx->inTxPool)) tx->numConfirmations = 0;
    else tx->numConfirmations = height - *block->height;

    // construct transfer
    shared_ptr<monero_outgoing_transfer> outgoingTransfer = make_shared<monero_outgoing_transfer>();
    outgoingTransfer->tx = tx;
    tx->outgoingTransfer = outgoingTransfer;
    uint64_t change = pd.m_change == (uint64_t)-1 ? 0 : pd.m_change; // change may not be known
    outgoingTransfer->amount = pd.m_amount_in - change - *tx->fee;
    outgoingTransfer->accountIndex = pd.m_subaddr_account;
    vector<uint32_t> subaddressIndices;
    vector<string> addresses;
    for (uint32_t i: pd.m_subaddr_indices) {
      subaddressIndices.push_back(i);
      addresses.push_back(wallet2.get_subaddress_as_str({pd.m_subaddr_account, i}));
    }
    outgoingTransfer->subaddressIndices = subaddressIndices;
    outgoingTransfer->addresses = addresses;

    // initialize destinations
    for (const auto &d: pd.m_dests) {
      shared_ptr<monero_destination> destination = make_shared<monero_destination>();
      destination->amount = d.amount;
      destination->address = d.original.empty() ? cryptonote::get_account_address_as_str(wallet2.nettype(), d.is_subaddress, d.addr) : d.original;
      outgoingTransfer->destinations.push_back(destination);
    }

    // replace transfer amount with destination sum
    // TODO monero core: confirmed tx from/to same account has amount 0 but cached transfer destinations
    if (*outgoingTransfer->amount == 0 && !outgoingTransfer->destinations.empty()) {
      uint64_t amount = 0;
      for (const shared_ptr<monero_destination>& destination : outgoingTransfer->destinations) amount += *destination->amount;
      outgoingTransfer->amount = amount;
    }

    // compute numSuggestedConfirmations  TODO monero core: this logic is based on wallet_rpc_server.cpp:87 but it should be encapsulated in wallet2
    uint64_t blockReward = wallet2.get_last_block_reward();
    if (blockReward == 0) outgoingTransfer->numSuggestedConfirmations = 0;
    else outgoingTransfer->numSuggestedConfirmations = (*outgoingTransfer->amount + blockReward - 1) / blockReward;

    // return pointer to new tx
    return tx;
  }

  shared_ptr<monero_tx_wallet> buildTxWithIncomingTransferUnconfirmed(const tools::wallet2& wallet2, const crypto::hash &payment_id, const tools::wallet2::pool_payment_details &ppd) {

    // construct tx
    const tools::wallet2::payment_details &pd = ppd.m_pd;
    shared_ptr<monero_tx_wallet> tx = make_shared<monero_tx_wallet>();
    tx->id = string_tools::pod_to_hex(pd.m_tx_hash);
    tx->paymentId = string_tools::pod_to_hex(payment_id);
    if (tx->paymentId->substr(16).find_first_not_of('0') == std::string::npos) tx->paymentId = tx->paymentId->substr(0, 16);  // TODO monero core: this should be part of core wallet
    if (tx->paymentId == monero_tx::DEFAULT_PAYMENT_ID) tx->paymentId = boost::none;  // clear default payment id
    tx->unlockTime = pd.m_unlock_time;
    tx->fee = pd.m_fee;
    tx->note = wallet2.get_tx_note(pd.m_tx_hash);
    if (tx->note->empty()) tx->note = boost::none; // clear empty note
    tx->isMinerTx = false;
    tx->isConfirmed = false;
    tx->isFailed = false;
    tx->isRelayed = true;
    tx->inTxPool = true;
    tx->doNotRelay = false;
    tx->isDoubleSpendSeen = ppd.m_double_spend_seen;
    tx->numConfirmations = 0;

    // construct transfer
    shared_ptr<monero_incoming_transfer> incomingTransfer = make_shared<monero_incoming_transfer>();
    incomingTransfer->tx = tx;
    tx->incomingTransfers.push_back(incomingTransfer);
    incomingTransfer->amount = pd.m_amount;
    incomingTransfer->accountIndex = pd.m_subaddr_index.major;
    incomingTransfer->subaddressIndex = pd.m_subaddr_index.minor;
    incomingTransfer->address = wallet2.get_subaddress_as_str(pd.m_subaddr_index);

    // compute numSuggestedConfirmations  TODO monero core: this logic is based on wallet_rpc_server.cpp:87 but it should be encapsulated in wallet2
    uint64_t blockReward = wallet2.get_last_block_reward();
    if (blockReward == 0) incomingTransfer->numSuggestedConfirmations = 0;
    else incomingTransfer->numSuggestedConfirmations = (*incomingTransfer->amount + blockReward - 1) / blockReward;

    // return pointer to new tx
    return tx;
  }

  shared_ptr<monero_tx_wallet> buildTxWithOutgoingTransferUnconfirmed(const tools::wallet2& wallet2, const crypto::hash &txid, const tools::wallet2::unconfirmed_transfer_details &pd) {

    // construct tx
    shared_ptr<monero_tx_wallet> tx = make_shared<monero_tx_wallet>();
    tx->isFailed = pd.m_state == tools::wallet2::unconfirmed_transfer_details::failed;
    tx->id = string_tools::pod_to_hex(txid);
    tx->paymentId = string_tools::pod_to_hex(pd.m_payment_id);
    if (tx->paymentId->substr(16).find_first_not_of('0') == std::string::npos) tx->paymentId = tx->paymentId->substr(0, 16);  // TODO monero core: this should be part of core wallet
    if (tx->paymentId == monero_tx::DEFAULT_PAYMENT_ID) tx->paymentId = boost::none;  // clear default payment id
    tx->unlockTime = pd.m_tx.unlock_time;
    tx->fee = pd.m_amount_in - pd.m_amount_out;
    tx->note = wallet2.get_tx_note(txid);
    if (tx->note->empty()) tx->note = boost::none; // clear empty note
    tx->isMinerTx = false;
    tx->isConfirmed = false;
    tx->isRelayed = !tx->isFailed.get();
    tx->inTxPool = !tx->isFailed.get();
    tx->doNotRelay = false;
    if (!tx->isFailed.get() && tx->isRelayed.get()) tx->isDoubleSpendSeen = false;  // TODO: test and handle if true
    tx->numConfirmations = 0;

    // construct transfer
    shared_ptr<monero_outgoing_transfer> outgoingTransfer = make_shared<monero_outgoing_transfer>();
    outgoingTransfer->tx = tx;
    tx->outgoingTransfer = outgoingTransfer;
    outgoingTransfer->amount = pd.m_amount_in - pd.m_change - tx->fee.get();
    outgoingTransfer->accountIndex = pd.m_subaddr_account;
    vector<uint32_t> subaddressIndices;
    vector<string> addresses;
    for (uint32_t i: pd.m_subaddr_indices) {
      subaddressIndices.push_back(i);
      addresses.push_back(wallet2.get_subaddress_as_str({pd.m_subaddr_account, i}));
    }
    outgoingTransfer->subaddressIndices = subaddressIndices;
    outgoingTransfer->addresses = addresses;

    // initialize destinations
    for (const auto &d: pd.m_dests) {
      shared_ptr<monero_destination> destination = make_shared<monero_destination>();
      destination->amount = d.amount;
      destination->address = d.original.empty() ? cryptonote::get_account_address_as_str(wallet2.nettype(), d.is_subaddress, d.addr) : d.original;
      outgoingTransfer->destinations.push_back(destination);
    }

    // replace transfer amount with destination sum
    // TODO monero core: confirmed tx from/to same account has amount 0 but cached transfer destinations
    if (*outgoingTransfer->amount == 0 && !outgoingTransfer->destinations.empty()) {
      uint64_t amount = 0;
      for (const shared_ptr<monero_destination>& destination : outgoingTransfer->destinations) amount += *destination->amount;
      outgoingTransfer->amount = amount;
    }

    // compute numSuggestedConfirmations  TODO monero core: this logic is based on wallet_rpc_server.cpp:87 but it should be encapsulated in wallet2
    uint64_t blockReward = wallet2.get_last_block_reward();
    if (blockReward == 0) outgoingTransfer->numSuggestedConfirmations = 0;
    else outgoingTransfer->numSuggestedConfirmations = (*outgoingTransfer->amount + blockReward - 1) / blockReward;

    // return pointer to new tx
    return tx;
  }

  shared_ptr<monero_tx_wallet> buildTxWithVout(const tools::wallet2& wallet2, const tools::wallet2::transfer_details& td) {

    // construct block
    shared_ptr<monero_block> block = make_shared<monero_block>();
    block->height = td.m_block_height;

    // construct tx
    shared_ptr<monero_tx_wallet> tx = make_shared<monero_tx_wallet>();
    tx->block = block;
    block->txs.push_back(tx);
    tx->id = epee::string_tools::pod_to_hex(td.m_txid);
    tx->isConfirmed = true;
    tx->isFailed = false;
    tx->isRelayed = true;
    tx->inTxPool = false;
    tx->doNotRelay = false;
    tx->isDoubleSpendSeen = false;

    // construct vout
    shared_ptr<monero_output_wallet> vout = make_shared<monero_output_wallet>();
    vout->tx = tx;
    tx->vouts.push_back(vout);
    vout->amount = td.amount();
    vout->index = td.m_global_output_index;
    vout->accountIndex = td.m_subaddr_index.major;
    vout->subaddressIndex = td.m_subaddr_index.minor;
    vout->isSpent = td.m_spent;
    vout->isUnlocked = wallet2.is_transfer_unlocked(td);
    vout->isFrozen = td.m_frozen;
    if (td.m_key_image_known) {
      vout->keyImage = make_shared<monero_key_image>();
      vout->keyImage.get()->hex = epee::string_tools::pod_to_hex(td.m_key_image);
    }

    // return pointer to new tx
    return tx;
  }

  /**
   * Merges a transaction into a unique set of transactions.
   *
   * TODO monero-core: skipIfAbsent only necessary because incoming payments not returned
   * when sent from/to same account #4500
   *
   * @param tx is the transaction to merge into the existing txs
   * @param txMap maps tx ids to txs
   * @param blockMap maps block heights to blocks
   * @param skipIfAbsent specifies if the tx should not be added if it doesn't already exist
   */
  void merge_tx(const shared_ptr<monero_tx_wallet>& tx, map<string, shared_ptr<monero_tx_wallet>>& txMap, map<uint64_t, shared_ptr<monero_block>>& blockMap, bool skipIfAbsent) {
    if (tx->id == boost::none) throw runtime_error("Tx id is not initialized");

    // if tx doesn't exist, add it (unless skipped)
    map<string, shared_ptr<monero_tx_wallet>>::const_iterator txIter = txMap.find(*tx->id);
    if (txIter == txMap.end()) {
      if (!skipIfAbsent) {
        txMap[*tx->id] = tx;
      } else {
        MWARNING("WARNING: tx does not already exist");
      }
    }

    // otherwise merge with existing tx
    else {
      shared_ptr<monero_tx_wallet>& aTx = txMap[*tx->id];
      aTx->merge(aTx, tx);
    }

    // if confirmed, merge tx's block
    if (tx->get_height() != boost::none) {
      map<uint64_t, shared_ptr<monero_block>>::const_iterator blockIter = blockMap.find(tx->get_height().get());
      if (blockIter == blockMap.end()) {
        blockMap[tx->get_height().get()] = tx->block.get();
      } else {
        shared_ptr<monero_block>& aBlock = blockMap[tx->get_height().get()];
        aBlock->merge(aBlock, tx->block.get());
      }
    }
  }

  /**
   * Returns true iff tx1's height is known to be less than tx2's height for sorting.
   */
  bool txHeightLessThan(const shared_ptr<monero_tx>& tx1, const shared_ptr<monero_tx>& tx2) {
    if (tx1->block != boost::none && tx2->block != boost::none) return tx1->get_height() < tx2->get_height();
    else if (tx1->block == boost::none) return false;
    else return true;
  }

  /**
   * Returns true iff transfer1 is ordered before transfer2 by ascending account and subaddress indices.
   */
  bool incomingTransferBefore(const shared_ptr<monero_incoming_transfer>& transfer1, const shared_ptr<monero_incoming_transfer>& transfer2) {

    // compare by height
    if (txHeightLessThan(transfer1->tx, transfer2->tx)) return true;

    // compare by account and subaddress index
    if (transfer1->accountIndex.get() < transfer2->accountIndex.get()) return true;
    else if (transfer1->accountIndex.get() == transfer2->accountIndex.get()) return transfer1->subaddressIndex.get() < transfer2->subaddressIndex.get();
    else return false;
  }

  /**
   * Returns true iff wallet vout1 is ordered before vout2 by ascending account and subaddress indices then index.
   */
  bool voutBefore(const shared_ptr<monero_output>& o1, const shared_ptr<monero_output>& o2) {
    shared_ptr<monero_output_wallet> ow1 = static_pointer_cast<monero_output_wallet>(o1);
    shared_ptr<monero_output_wallet> ow2 = static_pointer_cast<monero_output_wallet>(o2);

    // compare by height
    if (txHeightLessThan(ow1->tx, ow2->tx)) return true;

    // compare by account index, subaddress index, and output
    if (ow1->accountIndex.get() < ow2->accountIndex.get()) return true;
    else if (ow1->accountIndex.get() == ow2->accountIndex.get()) {
      if (ow1->subaddressIndex.get() < ow2->subaddressIndex.get()) return true;
      if (ow1->subaddressIndex.get() == ow2->subaddressIndex.get() && ow1->index.get() < ow2->index.get()) return true;
    }
    return false;
  }

  /**
   * ---------------- DUPLICATED WALLET RPC TRANSFER CODE ---------------------
   *
   * These functions are duplicated from private functions in wallet rpc
   * on_transfer/on_transfer_split, with minor modifications to not be class members.
   *
   * This code is used to generate and send transactions with equivalent functionality as
   * wallet rpc.
   *
   * Duplicated code is not ideal.  Solutions considered:
   *
   * (1) Duplicate wallet rpc code as done here.
   * (2) Modify monero-wallet-rpc on_transfer() / on_transfer_split() to be public.
   * (3) Modify monero-wallet-rpc to make this class a friend.
   * (4) Move all logic in monero-wallet-rpc to wallet2 so all users can access.
   *
   * Options 2-4 require modification of Monero Core C++.  Of those, (4) is probably ideal.
   * TODO: open patch on Monero core which moves common wallet rpc logic (e.g. on_transfer, on_transfer_split) to wallet2.
   *
   * Until then, option (1) is used because it allows Monero Core binaries to be used without modification, it's easy, and
   * anything other than (4) is temporary.
   */
  //------------------------------------------------------------------------------------------------------------------------------
  bool validate_transfer(wallet2* wallet2, const std::list<wallet_rpc::transfer_destination>& destinations, const std::string& payment_id, std::vector<cryptonote::tx_destination_entry>& dsts, std::vector<uint8_t>& extra, bool at_least_one_destination, epee::json_rpc::error& er)
  {
    crypto::hash8 integrated_payment_id = crypto::null_hash8;
    std::string extra_nonce;
    for (auto it = destinations.begin(); it != destinations.end(); it++)
    {
      cryptonote::address_parse_info info;
      cryptonote::tx_destination_entry de;
      er.message = "";
      if(!get_account_address_from_str_or_url(info, wallet2->nettype(), it->address,
        [&er](const std::string &url, const std::vector<std::string> &addresses, bool dnssec_valid)->std::string {
          if (!dnssec_valid)
          {
            er.message = std::string("Invalid DNSSEC for ") + url;
            return {};
          }
          if (addresses.empty())
          {
            er.message = std::string("No Monero address found at ") + url;
            return {};
          }
          return addresses[0];
        }))
      {
        er.code = WALLET_RPC_ERROR_CODE_WRONG_ADDRESS;
        if (er.message.empty())
          er.message = std::string("WALLET_RPC_ERROR_CODE_WRONG_ADDRESS: ") + it->address;
        return false;
      }

      de.original = it->address;
      de.addr = info.address;
      de.is_subaddress = info.is_subaddress;
      de.amount = it->amount;
      de.is_integrated = info.has_payment_id;
      dsts.push_back(de);

      if (info.has_payment_id)
      {
        if (!payment_id.empty() || integrated_payment_id != crypto::null_hash8)
        {
          er.code = WALLET_RPC_ERROR_CODE_WRONG_PAYMENT_ID;
          er.message = "A single payment id is allowed per transaction";
          return false;
        }
        integrated_payment_id = info.payment_id;
        cryptonote::set_encrypted_payment_id_to_tx_extra_nonce(extra_nonce, integrated_payment_id);

        /* Append Payment ID data into extra */
        if (!cryptonote::add_extra_nonce_to_tx_extra(extra, extra_nonce)) {
          er.code = WALLET_RPC_ERROR_CODE_WRONG_PAYMENT_ID;
          er.message = "Something went wrong with integrated payment_id.";
          return false;
        }
      }
    }

    if (at_least_one_destination && dsts.empty())
    {
      er.code = WALLET_RPC_ERROR_CODE_ZERO_DESTINATION;
      er.message = "No destinations for this transfer";
      return false;
    }

    if (!payment_id.empty())
    {

      /* Just to clarify */
      const std::string& payment_id_str = payment_id;

      crypto::hash long_payment_id;
      crypto::hash8 short_payment_id;

      /* Parse payment ID */
      if (wallet2::parse_long_payment_id(payment_id_str, long_payment_id)) {
        cryptonote::set_payment_id_to_tx_extra_nonce(extra_nonce, long_payment_id);
      }
      else {
        er.code = WALLET_RPC_ERROR_CODE_WRONG_PAYMENT_ID;
        er.message = "Payment id has invalid format: \"" + payment_id_str + "\", expected 64 character string";
        return false;
      }

      /* Append Payment ID data into extra */
      if (!cryptonote::add_extra_nonce_to_tx_extra(extra, extra_nonce)) {
        er.code = WALLET_RPC_ERROR_CODE_WRONG_PAYMENT_ID;
        er.message = "Something went wrong with payment_id. Please check its format: \"" + payment_id_str + "\", expected 64-character string";
        return false;
      }

    }
    return true;
  }
  //------------------------------------------------------------------------------------------------------------------------------
  static std::string ptx_to_string(const tools::wallet2::pending_tx &ptx)
  {
    std::ostringstream oss;
    boost::archive::portable_binary_oarchive ar(oss);
    try
    {
      ar << ptx;
    }
    catch (...)
    {
      return "";
    }
    return epee::string_tools::buff_to_hex_nodelimer(oss.str());
  }
  //------------------------------------------------------------------------------------------------------------------------------
  template<typename T> static bool is_error_value(const T &val) { return false; }
  static bool is_error_value(const std::string &s) { return s.empty(); }
  //------------------------------------------------------------------------------------------------------------------------------
  template<typename T, typename V>
  static bool fill(T &where, V s)
  {
    if (is_error_value(s)) return false;
    where = std::move(s);
    return true;
  }
  //------------------------------------------------------------------------------------------------------------------------------
  template<typename T, typename V>
  static bool fill(std::list<T> &where, V s)
  {
    if (is_error_value(s)) return false;
    where.emplace_back(std::move(s));
    return true;
  }
  //------------------------------------------------------------------------------------------------------------------------------
  static uint64_t total_amount(const tools::wallet2::pending_tx &ptx)
  {
    uint64_t amount = 0;
    for (const auto &dest: ptx.dests) amount += dest.amount;
    return amount;
  }
  //------------------------------------------------------------------------------------------------------------------------------
  template<typename Ts, typename Tu>
  bool fill_response(wallet2* wallet2, std::vector<tools::wallet2::pending_tx> &ptx_vector,
      bool get_tx_key, Ts& tx_key, Tu &amount, Tu &fee, std::string &multisig_txset, std::string &unsigned_txset, bool do_not_relay,
      Ts &tx_hash, bool get_tx_hex, Ts &tx_blob, bool get_tx_metadata, Ts &tx_metadata, epee::json_rpc::error &er)
  {
    for (const auto & ptx : ptx_vector)
    {
      if (get_tx_key)
      {
        epee::wipeable_string s = epee::to_hex::wipeable_string(ptx.tx_key);
        for (const crypto::secret_key& additional_tx_key : ptx.additional_tx_keys)
          s += epee::to_hex::wipeable_string(additional_tx_key);
        fill(tx_key, std::string(s.data(), s.size()));
      }
      // Compute amount leaving wallet in tx. By convention dests does not include change outputs
      fill(amount, total_amount(ptx));
      fill(fee, ptx.fee);
    }

    if (wallet2->multisig())
    {
      multisig_txset = epee::string_tools::buff_to_hex_nodelimer(wallet2->save_multisig_tx(ptx_vector));
      if (multisig_txset.empty())
      {
        er.code = WALLET_RPC_ERROR_CODE_UNKNOWN_ERROR;
        er.message = "Failed to save multisig tx set after creation";
        return false;
      }
    }
    else
    {
      if (wallet2->watch_only()){
        unsigned_txset = epee::string_tools::buff_to_hex_nodelimer(wallet2->dump_tx_to_str(ptx_vector));
        if (unsigned_txset.empty())
        {
          er.code = WALLET_RPC_ERROR_CODE_UNKNOWN_ERROR;
          er.message = "Failed to save unsigned tx set after creation";
          return false;
        }
      }
      else if (!do_not_relay)
        wallet2->commit_tx(ptx_vector);

      // populate response with tx hashes
      for (auto & ptx : ptx_vector)
      {
        bool r = fill(tx_hash, epee::string_tools::pod_to_hex(cryptonote::get_transaction_hash(ptx.tx)));
        r = r && (!get_tx_hex || fill(tx_blob, epee::string_tools::buff_to_hex_nodelimer(tx_to_blob(ptx.tx))));
        r = r && (!get_tx_metadata || fill(tx_metadata, ptx_to_string(ptx)));
        if (!r)
        {
          er.code = WALLET_RPC_ERROR_CODE_UNKNOWN_ERROR;
          er.message = "Failed to save tx info";
          return false;
        }
      }
    }
    return true;
  }

  // ----------------------------- WALLET LISTENER ----------------------------

  /**
   * Listens to wallet2 notifications in order to facilitate external wallet notifications.
   */
  struct Wallet2Listener : public tools::i_wallet2_callback {

  public:

    /**
     * Constructs the listener.
     *
     * @param wallet provides context to inform external notifications
     * @param wallet2 provides source notifications which this listener propagates to external listeners
     */
    Wallet2Listener(monero_wallet& wallet, tools::wallet2& wallet2) : wallet(wallet), wallet2(wallet2) {
      this->listener = boost::none;
      this->syncStartHeight = boost::none;
      this->syncEndHeight = boost::none;
      this->syncListener = boost::none;
    }

    ~Wallet2Listener() {
      MTRACE("~Wallet2Listener()");
    }

    void setWalletListener(boost::optional<MoneroWalletListener&> listener) {
      this->listener = listener;
      updateListening();
    }

    void onSyncStart(uint64_t startHeight, boost::optional<monero_sync_listener&> syncListener) {
      if (syncStartHeight != boost::none || syncEndHeight != boost::none) throw runtime_error("Sync start or end height should not already be allocated, is previous sync in progress?");
      syncStartHeight = startHeight;
      syncEndHeight = wallet.getChainHeight();
      this->syncListener = syncListener;
      updateListening();
    }

    void onSyncEnd() {
      syncStartHeight = boost::none;
      syncEndHeight = boost::none;
      syncListener = boost::none;
      updateListening();
    }

    virtual void on_new_block(uint64_t height, const cryptonote::block& cnBlock) {

      // notify listener of block
      if (listener != boost::none) listener->on_new_block(height);

      // notify listeners of sync progress
      if (syncStartHeight != boost::none && height >= *syncStartHeight) {
        if (height >= *syncEndHeight) syncEndHeight = height + 1;	// increase end height if necessary
        double percentDone = (double) (height - *syncStartHeight + 1) / (double) (*syncEndHeight - *syncStartHeight);
        string message = string("Synchronizing");
        if (listener != boost::none) listener.get().on_sync_progress(height, *syncStartHeight, *syncEndHeight, percentDone, message);
        if (syncListener != boost::none) syncListener.get().on_sync_progress(height, *syncStartHeight, *syncEndHeight, percentDone, message);
      }
    }

    virtual void on_money_received(uint64_t height, const crypto::hash &txid, const cryptonote::transaction& cnTx, uint64_t amount, const cryptonote::subaddress_index& subaddr_index, uint64_t unlock_time) {
      MTRACE("Wallet2Listener::on_money_received()");
      if (listener == boost::none) return;

      // create native library tx
      shared_ptr<monero_block> block = make_shared<monero_block>();
      block->height = height;
      shared_ptr<monero_tx_wallet> tx = static_pointer_cast<monero_tx_wallet>(monero_utils::cnTxToTx(cnTx, true));
      block->txs.push_back(tx);
      tx->block = block;
      tx->id = epee::string_tools::pod_to_hex(txid);
      tx->unlockTime = unlock_time;
      shared_ptr<monero_output_wallet> output = make_shared<monero_output_wallet>();
      tx->vouts.push_back(output);
      output->tx = tx;
      output->amount = amount;
      output->accountIndex = subaddr_index.major;
      output->subaddressIndex = subaddr_index.minor;

      // notify listener of output
      listener->on_output_received(*output);
    }

    virtual void on_money_spent(uint64_t height, const crypto::hash &txid, const cryptonote::transaction& cnTxIn, uint64_t amount, const cryptonote::transaction& cnTxOut, const cryptonote::subaddress_index& subaddr_index) {
      MTRACE("Wallet2Listener::on_money_spent()");
      if (&cnTxIn != &cnTxOut) throw runtime_error("on_money_spent() in tx is different than out tx");

      // create native library tx
      shared_ptr<monero_block> block = make_shared<monero_block>();
      block->height = height;
      shared_ptr<monero_tx_wallet> tx = static_pointer_cast<monero_tx_wallet>(monero_utils::cnTxToTx(cnTxIn, true));
      block->txs.push_back(tx);
      tx->block = block;
      tx->id = epee::string_tools::pod_to_hex(txid);
      shared_ptr<monero_output_wallet> output = make_shared<monero_output_wallet>();
      tx->vins.push_back(output);
      output->tx = tx;
      output->amount = amount;
      output->accountIndex = subaddr_index.major;
      output->subaddressIndex = subaddr_index.minor;

      // notify listener of output
      listener->on_output_spent(*output);

      // TODO **: to notify or not to notify?
//        std::string tx_hash = epee::string_tools::pod_to_hex(txid);
//        LOG_PRINT_L3(__FUNCTION__ << ": money spent. height:  " << height
//                     << ", tx: " << tx_hash
//                     << ", amount: " << print_money(amount)
//                     << ", idx: " << subaddr_index);
//        // do not signal on sent tx if wallet is not syncronized completely
//        if (m_listener && m_wallet->synchronized()) {
//            m_listener->moneySpent(tx_hash, amount);
//            m_listener->updated();
//        }
    }

  private:
    monero_wallet& wallet;     // wallet to provide context for notifications
    tools::wallet2& wallet2;  // internal wallet implementation to listen to
    boost::optional<MoneroWalletListener&> listener; // target listener to invoke with notifications
    boost::optional<monero_sync_listener&> syncListener;
    boost::optional<uint64_t> syncStartHeight;
    boost::optional<uint64_t> syncEndHeight;

    void updateListening() {
      wallet2.callback(listener == boost::none && syncListener == boost::none ? nullptr : this);
    }
  };

  // ---------------------------- WALLET MANAGEMENT ---------------------------

  bool monero_wallet::walletExists(const string& path) {
    MTRACE("walletExists(" << path << ")");
    bool keyFileExists;
    bool walletFileExists;
    tools::wallet2::wallet_exists(path, keyFileExists, walletFileExists);
    return walletFileExists;
  }

  monero_wallet* monero_wallet::open_wallet(const string& path, const string& password, const MoneroNetworkType networkType) {
    MTRACE("open_wallet(" << path << ", " << password << ", " << networkType << ")");
    monero_wallet* wallet = new monero_wallet();
    wallet->wallet2 = unique_ptr<tools::wallet2>(new tools::wallet2(static_cast<network_type>(networkType), 1, true));
    wallet->wallet2->load(path, password);
    wallet->wallet2->init("");
    wallet->initCommon();
    return wallet;
  }

  monero_wallet* monero_wallet::create_wallet_random(const string& path, const string& password) {
    MTRACE("create_wallet_random(path, password)");
    throw runtime_error("Not implemented");
  }

  monero_wallet* monero_wallet::create_wallet_random(const string& path, const string& password, const MoneroNetworkType networkType, const monero_rpc_connection& daemonConnection, const string& language) {
    MTRACE("create_wallet_random(path, password, networkType, daemonConnection, language)");
    monero_wallet* wallet = new monero_wallet();
    wallet->wallet2 = unique_ptr<tools::wallet2>(new tools::wallet2(static_cast<network_type>(networkType), 1, true));
    wallet->set_daemon_connection(daemonConnection);
    wallet->wallet2->set_seed_language(language);
    crypto::secret_key secret_key;
    wallet->wallet2->generate(path, password, secret_key, false, false);
    wallet->initCommon();
    return wallet;
  }

  monero_wallet* monero_wallet::create_wallet_from_mnemonic(const string& path, const string& password, const MoneroNetworkType networkType, const string& mnemonic) {
    MTRACE("create_wallet_from_mnemonic(path, password, networkType, mnemonic)");
    throw runtime_error("Not implemented");
  }

  monero_wallet* monero_wallet::create_wallet_from_mnemonic(const string& path, const string& password, const MoneroNetworkType networkType, const string& mnemonic, const monero_rpc_connection& daemonConnection, uint64_t restoreHeight) {
    MTRACE("create_wallet_from_mnemonic(path, password, mnemonic, networkType, daemonConnection, restoreHeight)");
    monero_wallet* wallet = new monero_wallet();

    // validate mnemonic and get recovery key and language
    crypto::secret_key recoveryKey;
    std::string language;
    bool isValid = crypto::ElectrumWords::words_to_bytes(mnemonic, recoveryKey, language);
    if (!isValid) throw runtime_error("Invalid mnemonic");
    if (language == crypto::ElectrumWords::old_language_name) language = Language::English().get_language_name();

    // initialize wallet
    wallet->wallet2 = unique_ptr<tools::wallet2>(new tools::wallet2(static_cast<cryptonote::network_type>(networkType), 1, true));
    wallet->set_daemon_connection(daemonConnection);
    wallet->wallet2->set_seed_language(language);
    wallet->wallet2->generate(path, password, recoveryKey, true, false);
    wallet->wallet2->set_refresh_from_block_height(restoreHeight);
    wallet->initCommon();
    return wallet;
  }

  monero_wallet* monero_wallet::create_wallet_from_keys(const string& path, const string& password, const MoneroNetworkType networkType, const string& address, const string& viewKey, const string& spendKey) {
    MTRACE("create_wallet_from_keys(path, password, address, viewKey, spendKey, networkType)");
    throw runtime_error("Not implemented");
  }

  monero_wallet* monero_wallet::create_wallet_from_keys(const string& path, const string& password, const MoneroNetworkType networkType, const string& address, const string& viewKey, const string& spendKey, const monero_rpc_connection& daemonConnection, uint64_t restoreHeight) {
    MTRACE("create_wallet_from_keys(path, password, address, viewKey, spendKey, networkType, daemonConnection, restoreHeight)");
    throw runtime_error("Not implemented");
  }

  monero_wallet* monero_wallet::create_wallet_from_keys(const string& path, const string& password, const MoneroNetworkType networkType, const string& address, const string& viewKey, const string& spendKey, const monero_rpc_connection& daemonConnection, uint64_t restoreHeight, const string& language) {
    MTRACE("create_wallet_from_keys(path, password, address, viewKey, spendKey, networkType, daemonConnection, restoreHeight, language)");
    monero_wallet* wallet = new monero_wallet();

    // validate and parse address
    cryptonote::address_parse_info info;
    if (!get_account_address_from_str(info, static_cast<cryptonote::network_type>(networkType), address)) throw runtime_error("failed to parse address");

    // validate and parse optional private spend key
    crypto::secret_key spendKeySK;
    bool hasSpendKey = false;
    if (!spendKey.empty()) {
      cryptonote::blobdata spendKeyData;
      if (!epee::string_tools::parse_hexstr_to_binbuff(spendKey, spendKeyData) || spendKeyData.size() != sizeof(crypto::secret_key)) {
        throw runtime_error("failed to parse secret spend key");
      }
      hasSpendKey = true;
      spendKeySK = *reinterpret_cast<const crypto::secret_key*>(spendKeyData.data());
    }

    // validate and parse private view key
    bool hasViewKey = true;
    crypto::secret_key viewKeySK;
    if (!viewKey.empty()) {
      if (hasSpendKey) hasViewKey = false;
      else throw runtime_error("Neither view key nor spend key supplied, cancelled");
    }
    if (hasViewKey) {
      cryptonote::blobdata viewKeyData;
      if (!epee::string_tools::parse_hexstr_to_binbuff(viewKey, viewKeyData) || viewKeyData.size() != sizeof(crypto::secret_key)) {
        throw runtime_error("failed to parse secret view key");
      }
      viewKeySK = *reinterpret_cast<const crypto::secret_key*>(viewKeyData.data());
    }

    // check the spend and view keys match the given address
    crypto::public_key pkey;
    if (hasSpendKey) {
      if (!crypto::secret_key_to_public_key(spendKeySK, pkey)) throw runtime_error("failed to verify secret spend key");
      if (info.address.m_spend_public_key != pkey) throw runtime_error("spend key does not match address");
    }
    if (hasViewKey) {
      if (!crypto::secret_key_to_public_key(viewKeySK, pkey)) throw runtime_error("failed to verify secret view key");
      if (info.address.m_view_public_key != pkey) throw runtime_error("view key does not match address");
    }

    // initialize wallet
    wallet->wallet2 = unique_ptr<tools::wallet2>(new tools::wallet2(static_cast<cryptonote::network_type>(networkType), 1, true));
    if (hasSpendKey && hasViewKey) wallet->wallet2->generate(path, password, info.address, spendKeySK, viewKeySK);
    if (!hasSpendKey && hasViewKey) wallet->wallet2->generate(path, password, info.address, viewKeySK);
    if (hasSpendKey && !hasViewKey) wallet->wallet2->generate(path, password, spendKeySK, true, false);
    wallet->set_daemon_connection(daemonConnection);
    wallet->wallet2->set_refresh_from_block_height(restoreHeight);
    wallet->wallet2->set_seed_language(language);
    wallet->initCommon();
    return wallet;
  }

  monero_wallet::~monero_wallet() {
    MTRACE("~monero_wallet()");
    close();
  }

  // ----------------------------- WALLET METHODS -----------------------------

  void monero_wallet::set_daemon_connection(const string& uri, const string& username, const string& password) {
    MTRACE("set_daemon_connection(" << uri << ", " << username << ", " << password << ")");

    // prepare uri, login, and isTrusted for wallet2
    boost::optional<epee::net_utils::http::login> login{};
    login.emplace(username, password);
    bool isTrusted = false;
    try { isTrusted = tools::is_local_address(uri); }	// wallet is trusted iff local
    catch (const exception &e) { }

    // init wallet2 and set daemon connection
    if (!wallet2->init(uri, login)) throw runtime_error("Failed to initialize wallet with daemon connection");
    get_is_connected(); // update isConnected cache // TODO: better naming?
  }

  void monero_wallet::set_daemon_connection(const monero_rpc_connection& connection) {
    set_daemon_connection(connection.uri, connection.username == boost::none ? "" : connection.username.get(), connection.password == boost::none ? "" : connection.password.get());
  }

  shared_ptr<monero_rpc_connection> monero_wallet::get_daemon_connection() const {
    MTRACE("monero_wallet::get_daemon_connection()");
    if (wallet2->get_daemon_address().empty()) return nullptr;
    shared_ptr<monero_rpc_connection> connection = make_shared<monero_rpc_connection>();
    if (!wallet2->get_daemon_address().empty()) connection->uri = wallet2->get_daemon_address();
    if (wallet2->get_daemon_login()) {
      if (!wallet2->get_daemon_login()->username.empty()) connection->username = wallet2->get_daemon_login()->username;
      epee::wipeable_string wipeablePassword = wallet2->get_daemon_login()->password;
      string password = string(wipeablePassword.data(), wipeablePassword.size());
      if (!password.empty()) connection->password = password;
    }
    return connection;
  }

  // TODO: could return Wallet::ConnectionStatus_Disconnected, Wallet::ConnectionStatus_WrongVersion, Wallet::ConnectionStatus_Connected like wallet.cpp::connected()
  bool monero_wallet::get_is_connected() const {
    uint32_t version = 0;
    isConnected = wallet2->check_connection(&version, NULL, DEFAULT_CONNECTION_TIMEOUT_MILLIS); // TODO: should this be updated elsewhere?
    if (!isConnected) return false;
    if (!wallet2->light_wallet() && (version >> 16) != CORE_RPC_VERSION_MAJOR) isConnected = false;
    return isConnected;
  }

  uint64_t monero_wallet::get_daemon_height() const {
    if (!isConnected) throw runtime_error("wallet is not connected to daemon");
    std::string err;
    uint64_t result = wallet2->get_daemon_blockchain_height(err);
    if (!err.empty()) throw runtime_error(err);
    return result;
  }

  uint64_t monero_wallet::get_daemon_target_height() const {
    if (!isConnected) throw runtime_error("wallet is not connected to daemon");
    std::string err;
    uint64_t result = wallet2->get_daemon_blockchain_target_height(err);
    if (!err.empty()) throw runtime_error(err);
    if (result == 0) result = get_daemon_height();  // TODO monero core: target height can be 0 when daemon is synced.  Use blockchain height instead
    return result;
  }

  bool monero_wallet::get_is_daemon_synced() const {
    if (!isConnected) throw runtime_error("wallet is not connected to daemon");
    uint64_t daemonHeight = get_daemon_height();
    return daemonHeight >= get_daemon_target_height() && daemonHeight > 1;
  }

  bool monero_wallet::get_is_synced() const {
    return isSynced;
  }

  string monero_wallet::get_path() const {
    return wallet2->path();
  }

  MoneroNetworkType monero_wallet::get_network_type() const {
    return static_cast<MoneroNetworkType>(wallet2->nettype());
  }

  string monero_wallet::get_language() const {
    return wallet2->get_seed_language();
  }

  vector<string> monero_wallet::get_languages() const {
    vector<string> languages;
    crypto::ElectrumWords::get_language_list(languages, true);
    return languages;
  }

  // get primary address (default impl?)

  string monero_wallet::get_address(uint32_t accountIdx, uint32_t subaddressIdx) const {
    return wallet2->get_subaddress_as_str({accountIdx, subaddressIdx});
  }

  monero_subaddress monero_wallet::get_address_index(const string& address) const {
    MTRACE("get_address_index(" << address << ")");

    // validate address
    cryptonote::address_parse_info info;
    if (!get_account_address_from_str(info, wallet2->nettype(), address)) {
      throw runtime_error("Invalid address");
    }

    // get index of address in wallet
    auto index = wallet2->get_subaddress_index(info.address);
    if (!index) throw runtime_error("Address doesn't belong to the wallet");

    // return indices in subaddress
    monero_subaddress subaddress;
    cryptonote::subaddress_index cnIndex = *index;
    subaddress.accountIndex = cnIndex.major;
    subaddress.index = cnIndex.minor;
    return subaddress;
  }

  monero_integrated_address monero_wallet::get_integrated_address(const string& standardAddress, const string& paymentId) const {
    MTRACE("get_integrated_address(" << standardAddress << ", " << paymentId << ")");

    // TODO monero-core: this logic is based on wallet_rpc_server::on_make_integrated_address() and should be moved to wallet so this is unecessary for api users

    // randomly generate payment id if not given, else validate
    crypto::hash8 paymentIdH8;
    if (paymentId.empty()) {
      paymentIdH8 = crypto::rand<crypto::hash8>();
    } else {
      if (!tools::wallet2::parse_short_payment_id(paymentId, paymentIdH8)) throw runtime_error("Invalid payment ID: " + paymentId);
    }

    // use primary address if standard address not given, else validate
    if (standardAddress.empty()) {
      return decode_integrated_address(wallet2->get_integrated_address_as_str(paymentIdH8));
    } else {

      // validate standard address
      cryptonote::address_parse_info info;
      if (!cryptonote::get_account_address_from_str(info, wallet2->nettype(), standardAddress)) throw runtime_error("Invalid address: " + standardAddress);
      if (info.is_subaddress) throw runtime_error("Subaddress shouldn't be used");
      if (info.has_payment_id) throw runtime_error("Already integrated address");
      if (paymentId.empty()) throw runtime_error("Payment ID shouldn't be left unspecified");

      // create integrated address from given standard address
      return decode_integrated_address(cryptonote::get_account_integrated_address_as_str(wallet2->nettype(), info.address, paymentIdH8));
    }
  }

  monero_integrated_address monero_wallet::decode_integrated_address(const string& integratedAddress) const {
    MTRACE("decode_integrated_address(" << integratedAddress << ")");

    // validate integrated address
    cryptonote::address_parse_info info;
    if (!cryptonote::get_account_address_from_str(info, wallet2->nettype(), integratedAddress)) throw runtime_error("Invalid integrated address: " + integratedAddress);
    if (!info.has_payment_id) throw runtime_error("Address is not an integrated address");

    // initialize and return result
    monero_integrated_address result;
    result.standardAddress = cryptonote::get_account_address_as_str(wallet2->nettype(), info.is_subaddress, info.address);
    result.paymentId = epee::string_tools::pod_to_hex(info.payment_id);
    result.integratedAddress = integratedAddress;
    return result;
  }

  string monero_wallet::get_mnemonic() const {
    epee::wipeable_string wipeablePassword;
    wallet2->get_seed(wipeablePassword);
    return string(wipeablePassword.data(), wipeablePassword.size());
  }

  string monero_wallet::get_public_view_key() const {
    MTRACE("get_private_view_key()");
    return epee::string_tools::pod_to_hex(wallet2->get_account().get_keys().m_account_address.m_view_public_key);
  }

  string monero_wallet::get_private_view_key() const {
    MTRACE("get_private_view_key()");
    return epee::string_tools::pod_to_hex(wallet2->get_account().get_keys().m_view_secret_key);
  }

  string monero_wallet::get_public_spend_key() const {
    MTRACE("get_private_spend_key()");
    return epee::string_tools::pod_to_hex(wallet2->get_account().get_keys().m_account_address.m_spend_public_key);
  }

  string monero_wallet::get_private_spend_key() const {
    MTRACE("get_private_spend_key()");
    return epee::string_tools::pod_to_hex(wallet2->get_account().get_keys().m_spend_secret_key);
  }

  void monero_wallet::set_listener(const boost::optional<MoneroWalletListener&> listener) {
    MTRACE("set_listener()");
    wallet2Listener->setWalletListener(listener);
  }

  monero_sync_result monero_wallet::sync() {
    MTRACE("sync()");
    if (!isConnected) throw runtime_error("No connection to daemon");
    return lockAndSync();
  }

  monero_sync_result monero_wallet::sync(monero_sync_listener& listener) {
    MTRACE("sync(listener)");
    if (!isConnected) throw runtime_error("No connection to daemon");
    return lockAndSync(boost::none, listener);
  }

  monero_sync_result monero_wallet::sync(uint64_t startHeight) {
    MTRACE("sync(" << startHeight << ")");
    if (!isConnected) throw runtime_error("No connection to daemon");
    return lockAndSync(startHeight);
  }

  monero_sync_result monero_wallet::sync(uint64_t startHeight, monero_sync_listener& listener) {
    MTRACE("sync(" << startHeight << ", listener)");
    if (!isConnected) throw runtime_error("No connection to daemon");
    return lockAndSync(startHeight, listener);
  }

  /**
   * Start automatic syncing as its own thread.
   */
  void monero_wallet::start_syncing() {
    if (!syncingEnabled) {
      syncingEnabled = true;
      syncCV.notify_one();
    }
  }

  /**
   * Stop automatic syncing as its own thread.
   */
  void monero_wallet::stop_syncing() {
    if (!syncingThreadDone) {
      syncingEnabled = false;
    }
  }

  // TODO: support arguments bool hard, bool refresh = true, bool keep_key_images = false
  void monero_wallet::rescan_blockchain() {
    MTRACE("rescan_blockchain()");
    if (!isConnected) throw runtime_error("No connection to daemon");
    rescanOnSync = true;
    lockAndSync();
  }

  // isMultisigImportNeeded

  uint64_t monero_wallet::get_height() const {
    return wallet2->get_blockchain_current_height();
  }

  uint64_t monero_wallet::getChainHeight() const {
    string err;
    if (!isConnected) throw runtime_error("No connection to daemon");
    uint64_t chainHeight = wallet2->get_daemon_blockchain_height(err);
    if (!err.empty()) throw runtime_error(err);
    return chainHeight;
  }

  uint64_t monero_wallet::get_restore_height() const {
    return wallet2->get_refresh_from_block_height();
  }

  void monero_wallet::set_restore_height(uint64_t restoreHeight) {
    wallet2->set_refresh_from_block_height(restoreHeight);
  }

  uint64_t monero_wallet::get_balance() const {
    return wallet2->balance_all();
  }

  uint64_t monero_wallet::get_balance(uint32_t accountIdx) const {
    return wallet2->balance(accountIdx);
  }

  uint64_t monero_wallet::get_balance(uint32_t accountIdx, uint32_t subaddressIdx) const {
    map<uint32_t, uint64_t> balancePerSubaddress = wallet2->balance_per_subaddress(accountIdx);
    auto iter = balancePerSubaddress.find(subaddressIdx);
    return iter == balancePerSubaddress.end() ? 0 : iter->second;
  }

  uint64_t monero_wallet::get_unlocked_balance() const {
    return wallet2->unlocked_balance_all();
  }

  uint64_t monero_wallet::get_unlocked_balance(uint32_t accountIdx) const {
    return wallet2->unlocked_balance(accountIdx);
  }

  uint64_t monero_wallet::get_unlocked_balance(uint32_t accountIdx, uint32_t subaddressIdx) const {
    map<uint32_t, std::pair<uint64_t, uint64_t>> unlockedBalancePerSubaddress = wallet2->unlocked_balance_per_subaddress(accountIdx);
    auto iter = unlockedBalancePerSubaddress.find(subaddressIdx);
    return iter == unlockedBalancePerSubaddress.end() ? 0 : iter->second.first;
  }

  vector<monero_account> monero_wallet::get_accounts() const {
    MTRACE("get_accounts()");
    return get_accounts(false, string(""));
  }

  vector<monero_account> monero_wallet::get_accounts(bool includeSubaddresses) const {
    MTRACE("get_accounts(" << includeSubaddresses << ")");
    throw runtime_error("Not implemented");
  }

  vector<monero_account> monero_wallet::get_accounts(const string& tag) const {
    MTRACE("get_accounts(" << tag << ")");
    throw runtime_error("Not implemented");
  }

  vector<monero_account> monero_wallet::get_accounts(bool includeSubaddresses, const string& tag) const {
    MTRACE("get_accounts(" << includeSubaddresses << ", " << tag << ")");

    // need transfers to inform if subaddresses used
    vector<tools::wallet2::transfer_details> transfers;
    if (includeSubaddresses) wallet2->get_transfers(transfers);

    // build accounts
    vector<monero_account> accounts;
    for (uint32_t accountIdx = 0; accountIdx < wallet2->get_num_subaddress_accounts(); accountIdx++) {
      monero_account account;
      account.index = accountIdx;
      account.primaryAddress = get_address(accountIdx, 0);
      account.balance = wallet2->balance(accountIdx);
      account.unlockedBalance = wallet2->unlocked_balance(accountIdx);
      if (includeSubaddresses) account.subaddresses = getSubaddressesAux(accountIdx, vector<uint32_t>(), transfers);
      accounts.push_back(account);
    }

    return accounts;
  }

  monero_account monero_wallet::get_account(const uint32_t accountIdx) const {
    return get_account(accountIdx, false);
  }

  monero_account monero_wallet::get_account(uint32_t accountIdx, bool includeSubaddresses) const {
    MTRACE("get_account(" << accountIdx << ", " << includeSubaddresses << ")");

    // need transfers to inform if subaddresses used
    vector<tools::wallet2::transfer_details> transfers;
    if (includeSubaddresses) wallet2->get_transfers(transfers);

    // build and return account
    monero_account account;
    account.index = accountIdx;
    account.primaryAddress = get_address(accountIdx, 0);
    account.balance = wallet2->balance(accountIdx);
    account.unlockedBalance = wallet2->unlocked_balance(accountIdx);
    if (includeSubaddresses) account.subaddresses = getSubaddressesAux(accountIdx, vector<uint32_t>(), transfers);
    return account;
  }

  monero_account monero_wallet::create_account(const string& label) {
    MTRACE("create_account(" << label << ")");

    // create account
    wallet2->add_subaddress_account(label);

    // initialize and return result
    monero_account account;
    account.index = wallet2->get_num_subaddress_accounts() - 1;
    account.primaryAddress = wallet2->get_subaddress_as_str({account.index.get(), 0});
    account.balance = 0;
    account.unlockedBalance = 0;
    return account;
  }

  vector<monero_subaddress> monero_wallet::get_subaddresses(const uint32_t accountIdx) const {
    return get_subaddresses(accountIdx, vector<uint32_t>());
  }

  vector<monero_subaddress> monero_wallet::get_subaddresses(const uint32_t accountIdx, const vector<uint32_t>& subaddressIndices) const {
    MTRACE("get_subaddresses(" << accountIdx << ", ...)");
    MTRACE("Subaddress indices size: " << subaddressIndices.size());

    vector<tools::wallet2::transfer_details> transfers;
    wallet2->get_transfers(transfers);
    return getSubaddressesAux(accountIdx, subaddressIndices, transfers);
  }

  monero_subaddress monero_wallet::getSubaddress(const uint32_t accountIdx, const uint32_t subaddressIdx) const {
    throw runtime_error("Not implemented");
  }

  // get_subaddresses

  monero_subaddress monero_wallet::create_subaddress(const uint32_t accountIdx, const string& label) {
    MTRACE("create_subaddress(" << accountIdx << ", " << label << ")");

    // create subaddress
    wallet2->add_subaddress(accountIdx, label);

    // initialize and return result
    monero_subaddress subaddress;
    subaddress.accountIndex = accountIdx;
    subaddress.index = wallet2->get_num_subaddresses(accountIdx) - 1;
    subaddress.address = wallet2->get_subaddress_as_str({accountIdx, subaddress.index.get()});
    subaddress.label = label;
    subaddress.balance = 0;
    subaddress.unlockedBalance = 0;
    subaddress.numUnspentOutputs = 0;
    subaddress.isUsed = false;
    subaddress.numBlocksToUnlock = 0;
    return subaddress;
  }

  vector<shared_ptr<monero_tx_wallet>> monero_wallet::get_txs() const {
    monero_tx_request request;
    return get_txs(request);
  }

  vector<shared_ptr<monero_tx_wallet>> monero_wallet::get_txs(const monero_tx_request& request) const {
    MTRACE("get_txs(request)");
    
    // copy and normalize tx request
    shared_ptr<monero_tx_request> requestSp = make_shared<monero_tx_request>(request); // convert to shared pointer for copy
    shared_ptr<monero_tx_request> req = requestSp->copy(requestSp, make_shared<monero_tx_request>());
    if (req->transferRequest == boost::none) req->transferRequest = make_shared<monero_transfer_request>();
    shared_ptr<monero_transfer_request> transferReq = req->transferRequest.get();

    // print req
    if (req->block != boost::none) MTRACE("Tx req's rooted at [block]: " << req->block.get()->serialize());
    else MTRACE("Tx req: " << req->serialize());
    
    // temporarily disable transfer request
    req->transferRequest = boost::none;

    // fetch all transfers that meet tx request
    monero_transfer_request tempTransferReq;
    tempTransferReq.txRequest = make_shared<monero_tx_request>(*req);
    vector<shared_ptr<monero_transfer>> transfers = get_transfers(tempTransferReq);

    // collect unique txs from transfers while retaining order
    vector<shared_ptr<monero_tx_wallet>> txs = vector<shared_ptr<monero_tx_wallet>>();
    unordered_set<shared_ptr<monero_tx_wallet>> txsSet;
    for (const shared_ptr<monero_transfer>& transfer : transfers) {
      if (txsSet.find(transfer->tx) == txsSet.end()) {
        txs.push_back(transfer->tx);
        txsSet.insert(transfer->tx);
      }
    }

    // cache types into maps for merging and lookup
    map<string, shared_ptr<monero_tx_wallet>> txMap;
    map<uint64_t, shared_ptr<monero_block>> blockMap;
    for (const shared_ptr<monero_tx_wallet>& tx : txs) {
      merge_tx(tx, txMap, blockMap, false);
    }

    // fetch and merge outputs if requested
    monero_output_request tempOutputReq;
    tempOutputReq.txRequest = make_shared<monero_tx_request>(*req);
    if (req->includeOutputs != boost::none && *req->includeOutputs) {

      // fetch outputs
      vector<shared_ptr<monero_output_wallet>> outputs = get_outputs(tempOutputReq);

      // merge output txs one time while retaining order
      unordered_set<shared_ptr<monero_tx_wallet>> outputTxs;
      for (const shared_ptr<monero_output_wallet>& output : outputs) {
        shared_ptr<monero_tx_wallet> tx = static_pointer_cast<monero_tx_wallet>(output->tx);
        if (outputTxs.find(tx) == outputTxs.end()) {
          merge_tx(tx, txMap, blockMap, true);
          outputTxs.insert(tx);
        }
      }
    }

    // filter txs that don't meet transfer req  // TODO: port this updated version to js
    req->transferRequest = transferReq;
    vector<shared_ptr<monero_tx_wallet>> txsRequested;
    vector<shared_ptr<monero_tx_wallet>>::iterator txIter = txs.begin();
    while (txIter != txs.end()) {
      shared_ptr<monero_tx_wallet> tx = *txIter;
      if (req->meetsCriteria(tx.get())) {
        txsRequested.push_back(tx);
        txIter++;
      } else {
        txIter = txs.erase(txIter);
        if (tx->block != boost::none) tx->block.get()->txs.erase(std::remove(tx->block.get()->txs.begin(), tx->block.get()->txs.end(), tx), tx->block.get()->txs.end()); // TODO, no way to use txIter?
      }
    }
    txs = txsRequested;

    // verify all specified tx ids found
    if (!req->txIds.empty()) {
      for (const string& txId : req->txIds) {
        bool found = false;
        for (const shared_ptr<monero_tx_wallet>& tx : txs) {
          if (txId == *tx->id) {
            found = true;
            break;
          }
        }
        if (!found) throw runtime_error("Tx not found in wallet: " + txId);
      }
    }

    // special case: re-fetch txs if inconsistency caused by needing to make multiple wallet calls
    // TODO monero core: offer wallet.get_txs(...)
    for (const shared_ptr<monero_tx_wallet>& tx : txs) {
      if (*tx->isConfirmed && tx->block == boost::none) return get_txs(*req);
    }

    // otherwise order txs if tx ids given then return
    if (!req->txIds.empty()) {
      vector<shared_ptr<monero_tx_wallet>> orderedTxs;
      for (const string& txId : req->txIds) {
        map<string, shared_ptr<monero_tx_wallet>>::const_iterator txIter = txMap.find(txId);
        orderedTxs.push_back(txIter->second);
      }
      txs = orderedTxs;
    }
    return txs;
  }

  vector<shared_ptr<monero_transfer>> monero_wallet::get_transfers(const monero_transfer_request& request) const {
    MTRACE("monero_wallet::get_transfers(request)");

    // LOG request
    if (request.txRequest != boost::none) {
      if ((*request.txRequest)->block == boost::none) MTRACE("Transfer request's tx request rooted at [tx]:" << (*request.txRequest)->serialize());
      else MTRACE("Transfer request's tx request rooted at [block]: " << (*(*request.txRequest)->block)->serialize());
    }

    // copy and normalize request
    shared_ptr<monero_transfer_request> req;
    if (request.txRequest == boost::none) req = request.copy(make_shared<monero_transfer_request>(request), make_shared<monero_transfer_request>());
    else {
      shared_ptr<monero_tx_request> txReq = request.txRequest.get()->copy(request.txRequest.get(), make_shared<monero_tx_request>());
      if (request.txRequest.get()->transferRequest != boost::none && request.txRequest.get()->transferRequest.get().get() == &request) {
        req = txReq->transferRequest.get();
      } else {
        if (request.txRequest.get()->transferRequest != boost::none) throw new runtime_error("Transfer request's tx request must be a circular reference or null");
        shared_ptr<monero_transfer_request> requestSp = make_shared<monero_transfer_request>(request);  // convert request to shared pointer for copy
        req = requestSp->copy(requestSp, make_shared<monero_transfer_request>());
        req->txRequest = txReq;
      }
    }
    if (req->txRequest == boost::none) req->txRequest = make_shared<monero_tx_request>();
    shared_ptr<monero_tx_request> txReq = req->txRequest.get();
    txReq->transferRequest = boost::none; // break circular link for meetsCriteria()

    // build parameters for wallet2->get_payments()
    uint64_t minHeight = txReq->minHeight == boost::none ? 0 : *txReq->minHeight;
    uint64_t maxHeight = txReq->maxHeight == boost::none ? CRYPTONOTE_MAX_BLOCK_NUMBER : min((uint64_t) CRYPTONOTE_MAX_BLOCK_NUMBER, *txReq->maxHeight);
    if (minHeight > 0) minHeight--; // TODO monero core: wallet2::get_payments() min_height is exclusive, so manually offset to match intended range (issues 5751, #5598)
    boost::optional<uint32_t> accountIndex = boost::none;
    if (req->accountIndex != boost::none) accountIndex = *req->accountIndex;
    std::set<uint32_t> subaddressIndices;
    for (int i = 0; i < req->subaddressIndices.size(); i++) {
      subaddressIndices.insert(req->subaddressIndices[i]);
    }

    // translate from monero_tx_request to in, out, pending, pool, failed terminology used by monero-wallet-rpc
    bool canBeConfirmed = !boolEquals(false, txReq->isConfirmed) && !boolEquals(true, txReq->inTxPool) && !boolEquals(true, txReq->isFailed) && !boolEquals(false, txReq->isRelayed);
    bool canBeInTxPool = !boolEquals(true, txReq->isConfirmed) && !boolEquals(false, txReq->inTxPool) && !boolEquals(true, txReq->isFailed) && !boolEquals(false, txReq->isRelayed) && txReq->get_height() == boost::none && txReq->minHeight == boost::none;
    bool canBeIncoming = !boolEquals(false, req->isIncoming) && !boolEquals(true, req->getIsOutgoing()) && !boolEquals(true, req->hasDestinations);
    bool canBeOutgoing = !boolEquals(false, req->getIsOutgoing()) && !boolEquals(true, req->isIncoming);
    bool isIn = canBeIncoming && canBeConfirmed;
    bool isOut = canBeOutgoing && canBeConfirmed;
    bool isPending = canBeOutgoing && canBeInTxPool;
    bool isPool = canBeIncoming && canBeInTxPool;
    bool isFailed = !boolEquals(false, txReq->isFailed) && !boolEquals(true, txReq->isConfirmed) && !boolEquals(true, txReq->inTxPool);

    // cache unique txs and blocks
    uint64_t height = get_height();
    map<string, shared_ptr<monero_tx_wallet>> txMap;
    map<uint64_t, shared_ptr<monero_block>> blockMap;

    // get confirmed incoming transfers
    if (isIn) {
      std::list<std::pair<crypto::hash, tools::wallet2::payment_details>> payments;
      wallet2->get_payments(payments, minHeight, maxHeight, accountIndex, subaddressIndices);
      for (std::list<std::pair<crypto::hash, tools::wallet2::payment_details>>::const_iterator i = payments.begin(); i != payments.end(); ++i) {
        shared_ptr<monero_tx_wallet> tx = buildTxWithIncomingTransfer(*wallet2, height, i->first, i->second);
        merge_tx(tx, txMap, blockMap, false);
      }
    }

    // get confirmed outgoing transfers
    if (isOut) {
      std::list<std::pair<crypto::hash, tools::wallet2::confirmed_transfer_details>> payments;
      wallet2->get_payments_out(payments, minHeight, maxHeight, accountIndex, subaddressIndices);
      for (std::list<std::pair<crypto::hash, tools::wallet2::confirmed_transfer_details>>::const_iterator i = payments.begin(); i != payments.end(); ++i) {
        shared_ptr<monero_tx_wallet> tx = buildTxWithOutgoingTransfer(*wallet2, height, i->first, i->second);
        merge_tx(tx, txMap, blockMap, false);
      }
    }

    // get unconfirmed or failed outgoing transfers
    if (isPending || isFailed) {
      std::list<std::pair<crypto::hash, tools::wallet2::unconfirmed_transfer_details>> upayments;
      wallet2->get_unconfirmed_payments_out(upayments, accountIndex, subaddressIndices);
      for (std::list<std::pair<crypto::hash, tools::wallet2::unconfirmed_transfer_details>>::const_iterator i = upayments.begin(); i != upayments.end(); ++i) {
        shared_ptr<monero_tx_wallet> tx = buildTxWithOutgoingTransferUnconfirmed(*wallet2, i->first, i->second);
        if (txReq->isFailed != boost::none && txReq->isFailed.get() != tx->isFailed.get()) continue; // skip merging if tx unrequested
        merge_tx(tx, txMap, blockMap, false);
      }
    }

    // get unconfirmed incoming transfers
    if (isPool) {
      wallet2->update_pool_state(); // TODO monero-core: this should be encapsulated in wallet when unconfirmed transfers requested
      std::list<std::pair<crypto::hash, tools::wallet2::pool_payment_details>> payments;
      wallet2->get_unconfirmed_payments(payments, accountIndex, subaddressIndices);
      for (std::list<std::pair<crypto::hash, tools::wallet2::pool_payment_details>>::const_iterator i = payments.begin(); i != payments.end(); ++i) {
        shared_ptr<monero_tx_wallet> tx = buildTxWithIncomingTransferUnconfirmed(*wallet2, i->first, i->second);
        merge_tx(tx, txMap, blockMap, false);
      }
    }

    // sort txs by block height
    vector<shared_ptr<monero_tx_wallet>> txs ;
    for (map<string, shared_ptr<monero_tx_wallet>>::const_iterator txIter = txMap.begin(); txIter != txMap.end(); txIter++) {
      txs.push_back(txIter->second);
    }
    sort(txs.begin(), txs.end(), txHeightLessThan);

    // filter and return transfers
    vector<shared_ptr<monero_transfer>> transfers;
    for (const shared_ptr<monero_tx_wallet>& tx : txs) {

      // sort transfers
      sort(tx->incomingTransfers.begin(), tx->incomingTransfers.end(), incomingTransferBefore);

      // collect outgoing transfer, erase if filtered TODO: js does not erase unrequested data, port to js
      if (tx->outgoingTransfer != boost::none && req->meetsCriteria(tx->outgoingTransfer.get().get())) transfers.push_back(tx->outgoingTransfer.get());
      else tx->outgoingTransfer = boost::none;

      // collect incoming transfers, erase if unrequested
      vector<shared_ptr<monero_incoming_transfer>>::iterator iter = tx->incomingTransfers.begin();
      while (iter != tx->incomingTransfers.end()) {
        if (req->meetsCriteria((*iter).get())) {
          transfers.push_back(*iter);
          iter++;
        } else {
          iter = tx->incomingTransfers.erase(iter);
        }
      }

      // remove unrequested txs from block
      if (tx->block != boost::none && tx->outgoingTransfer == boost::none && tx->incomingTransfers.empty()) {
        tx->block.get()->txs.erase(std::remove(tx->block.get()->txs.begin(), tx->block.get()->txs.end(), tx), tx->block.get()->txs.end()); // TODO, no way to use const_iterator?
      }
    }
    MTRACE("monero_wallet.cpp get_transfers() returning " << transfers.size() << " transfers");

    return transfers;
  }

  vector<shared_ptr<monero_output_wallet>> monero_wallet::get_outputs(const monero_output_request& request) const {
    MTRACE("monero_wallet::get_outputs(request)");

    // print request
    MTRACE("Output request: " << request.serialize());
    if (request.txRequest != boost::none) {
      if ((*request.txRequest)->block == boost::none) MTRACE("Output request's tx request rooted at [tx]:" << (*request.txRequest)->serialize());
      else MTRACE("Output request's tx request rooted at [block]: " << (*(*request.txRequest)->block)->serialize());
    }

    // copy and normalize request
    shared_ptr<monero_output_request> req;
    if (request.txRequest == boost::none) req = request.copy(make_shared<monero_output_request>(request), make_shared<monero_output_request>());
    else {
      shared_ptr<monero_tx_request> txReq = request.txRequest.get()->copy(request.txRequest.get(), make_shared<monero_tx_request>());
      if (request.txRequest.get()->outputRequest != boost::none && request.txRequest.get()->outputRequest.get().get() == &request) {
        req = txReq->outputRequest.get();
      } else {
        if (request.txRequest.get()->outputRequest != boost::none) throw new runtime_error("Output request's tx request must be a circular reference or null");
        shared_ptr<monero_output_request> requestSp = make_shared<monero_output_request>(request);  // convert request to shared pointer for copy
        req = requestSp->copy(requestSp, make_shared<monero_output_request>());
        req->txRequest = txReq;
      }
    }
    if (req->txRequest == boost::none) req->txRequest = make_shared<monero_tx_request>();
    shared_ptr<monero_tx_request> txReq = req->txRequest.get();
    txReq->outputRequest = boost::none; // break circular link for meetsCriteria()

    // get output data from wallet2
    tools::wallet2::transfer_container outputsW2;
    wallet2->get_transfers(outputsW2);

    // cache unique txs and blocks
    map<string, shared_ptr<monero_tx_wallet>> txMap;
    map<uint64_t, shared_ptr<monero_block>> blockMap;
    for (const auto& outputW2 : outputsW2) {
      // TODO: skip tx building if w2 output filtered by indices, etc
      shared_ptr<monero_tx_wallet> tx = buildTxWithVout(*wallet2, outputW2);
      merge_tx(tx, txMap, blockMap, false);
    }

    // sort txs by block height
    vector<shared_ptr<monero_tx_wallet>> txs ;
    for (map<string, shared_ptr<monero_tx_wallet>>::const_iterator txIter = txMap.begin(); txIter != txMap.end(); txIter++) {
      txs.push_back(txIter->second);
    }
    sort(txs.begin(), txs.end(), txHeightLessThan);

    // filter and return outputs
    vector<shared_ptr<monero_output_wallet>> vouts;
    for (const shared_ptr<monero_tx_wallet>& tx : txs) {

      // sort outputs
      sort(tx->vouts.begin(), tx->vouts.end(), voutBefore);

      // collect requested outputs, remove unrequested outputs
      vector<shared_ptr<monero_output>>::iterator voutIter = tx->vouts.begin();
      while (voutIter != tx->vouts.end()) {
        shared_ptr<monero_output_wallet> voutWallet = static_pointer_cast<monero_output_wallet>(*voutIter);
        if (req->meetsCriteria(voutWallet.get())) {
          vouts.push_back(voutWallet);
          voutIter++;
        } else {
          voutIter = tx->vouts.erase(voutIter); // remove unrequested vouts
        }
      }

      // remove txs without requested vout
      if (tx->vouts.empty() && tx->block != boost::none) tx->block.get()->txs.erase(std::remove(tx->block.get()->txs.begin(), tx->block.get()->txs.end(), tx), tx->block.get()->txs.end()); // TODO, no way to use const_iterator?
    }
    return vouts;
  }

  string monero_wallet::get_outputs_hex() const {
    return epee::string_tools::buff_to_hex_nodelimer(wallet2->export_outputs_to_str(true));
  }

  int monero_wallet::import_outputs_hex(const string& outputsHex) {

    // validate and parse hex data
    cryptonote::blobdata blob;
    if (!epee::string_tools::parse_hexstr_to_binbuff(outputsHex, blob)) {
      throw runtime_error("Failed to parse hex.");
    }

    // import hex and return result
    return wallet2->import_outputs_from_str(blob);
  }

  vector<shared_ptr<monero_key_image>> monero_wallet::get_key_images() const {
    MTRACE("monero_wallet::get_key_images()");

    // build key images from wallet2 types
    vector<shared_ptr<monero_key_image>> keyImages;
    std::pair<size_t, std::vector<std::pair<crypto::key_image, crypto::signature>>> ski = wallet2->export_key_images(true);
    for (size_t n = 0; n < ski.second.size(); ++n) {
      shared_ptr<monero_key_image> keyImage = make_shared<monero_key_image>();
      keyImages.push_back(keyImage);
      keyImage->hex = epee::string_tools::pod_to_hex(ski.second[n].first);
      keyImage->signature = epee::string_tools::pod_to_hex(ski.second[n].second);
    }
    return keyImages;
  }

  shared_ptr<monero_key_image_import_result> monero_wallet::import_key_images(const vector<shared_ptr<monero_key_image>>& keyImages) {
    MTRACE("monero_wallet::import_key_images()");

    // validate and prepare key images for wallet2
    std::vector<std::pair<crypto::key_image, crypto::signature>> ski;
    ski.resize(keyImages.size());
    for (size_t n = 0; n < ski.size(); ++n) {
      if (!epee::string_tools::hex_to_pod(keyImages[n]->hex.get(), ski[n].first)) {
        throw runtime_error("failed to parse key image");
      }
      if (!epee::string_tools::hex_to_pod(keyImages[n]->signature.get(), ski[n].second)) {
        throw runtime_error("failed to parse signature");
      }
    }

    // import key images
    uint64_t spent = 0, unspent = 0;
    uint64_t height = wallet2->import_key_images(ski, 0, spent, unspent); // TODO: use offset? refer to wallet_rpc_server::on_import_key_images() req.offset

    // translate results
    shared_ptr<monero_key_image_import_result> result = make_shared<monero_key_image_import_result>();
    result->height = height;
    result->spentAmount = spent;
    result->unspentAmount = unspent;
    return result;
  }

  vector<shared_ptr<monero_tx_wallet>> monero_wallet::send_split(const monero_send_request& request) {
    MTRACE("monero_wallet::send_split(request)");
    MTRACE("monero_send_request: " << request.serialize());

    wallet_rpc::COMMAND_RPC_TRANSFER::request req;
    wallet_rpc::COMMAND_RPC_TRANSFER::response res;
    epee::json_rpc::error err;

    // prepare parameters for wallet rpc's validate_transfer()
    string paymentId = request.paymentId == boost::none ? string("") : request.paymentId.get();
    list<tools::wallet_rpc::transfer_destination> trDestinations;
    for (const shared_ptr<monero_destination>& destination : request.destinations) {
      tools::wallet_rpc::transfer_destination trDestination;
      trDestination.amount = destination->amount.get();
      trDestination.address = destination->address.get();
      trDestinations.push_back(trDestination);
    }

    // validate the requested txs and populate dsts & extra
    std::vector<cryptonote::tx_destination_entry> dsts;
    std::vector<uint8_t> extra;
    if (!validate_transfer(wallet2.get(), trDestinations, paymentId, dsts, extra, true, err)) {
      throw runtime_error("Need to handle send_split() validate_transfer error");  // TODO
    }

    // prepare parameters for wallet2's create_transactions_2()
    uint64_t mixin = wallet2->adjust_mixin(request.ringSize == boost::none ? 0 : request.ringSize.get() - 1);
    uint32_t priority = wallet2->adjust_priority(request.priority == boost::none ? 0 : request.priority.get());
    uint64_t unlockTime = request.unlockTime == boost::none ? 0 : request.unlockTime.get();
    if (request.accountIndex == boost::none) throw runtime_error("Must specify the account index to send from");
    uint32_t accountIndex = request.accountIndex.get();
    std::set<uint32_t> subaddressIndices;
    for (const uint32_t& subaddressIdx : request.subaddressIndices) subaddressIndices.insert(subaddressIdx);

    // prepare transactions
    vector<wallet2::pending_tx> ptx_vector = wallet2->create_transactions_2(dsts, mixin, unlockTime, priority, extra, accountIndex, subaddressIndices);
    if (ptx_vector.empty()) throw runtime_error("No transaction created");

    // check if request cannot be fulfilled due to splitting
    if (request.canSplit != boost::none && request.canSplit.get() == false && ptx_vector.size() != 1) {
      throw runtime_error("Transaction would be too large.  Try send_split()");
    }

    // config for fill_response()
    bool getTxKeys = true;
    bool getTxHex = true;
    bool getTxMetadata = true;
    bool doNotRelay = request.doNotRelay == boost::none ? false : request.doNotRelay.get();

    // commit txs (if relaying) and get response using wallet rpc's fill_response()
    list<string> txKeys;
    list<uint64_t> txAmounts;
    list<uint64_t> txFees;
    string multisigTxSet;
    string unsignedTxSet;
    list<string> txIds;
    list<string> txBlobs;
    list<string> txMetadatas;
    if (!fill_response(wallet2.get(), ptx_vector, getTxKeys, txKeys, txAmounts, txFees, multisigTxSet, unsignedTxSet, doNotRelay, txIds, getTxHex, txBlobs, getTxMetadata, txMetadatas, err)) {
      throw runtime_error("need to handle error filling response!");  // TODO
    }

    // build sent txs from results  // TODO: break this into separate utility function
    vector<shared_ptr<monero_tx_wallet>> txs;
    auto txIdsIter = txIds.begin();
    auto txKeysIter = txKeys.begin();
    auto txAmountsIter = txAmounts.begin();
    auto txFeesIter = txFees.begin();
    auto txBlobsIter = txBlobs.begin();
    auto txMetadatasIter = txMetadatas.begin();
    while (txIdsIter != txIds.end()) {

      // init tx with outgoing transfer from filled values
      shared_ptr<monero_tx_wallet> tx = make_shared<monero_tx_wallet>();
      txs.push_back(tx);
      tx->id = *txIdsIter;
      tx->key = *txKeysIter;
      tx->fee = *txFeesIter;
      tx->fullHex = *txBlobsIter;
      tx->metadata = *txMetadatasIter;
      shared_ptr<monero_outgoing_transfer> outTransfer = make_shared<monero_outgoing_transfer>();
      tx->outgoingTransfer = outTransfer;
      outTransfer->amount = *txAmountsIter;

      // init other known fields
      tx->paymentId = request.paymentId;
      tx->isConfirmed = false;
      tx->isMinerTx = false;
      tx->isFailed = false;   // TODO: test and handle if true
      tx->doNotRelay = request.doNotRelay != boost::none && request.doNotRelay.get() == true;
      tx->isRelayed = tx->doNotRelay.get() != true;
      tx->inTxPool = !tx->doNotRelay.get();
      if (!tx->isFailed.get() && tx->isRelayed.get()) tx->isDoubleSpendSeen = false;  // TODO: test and handle if true
      tx->numConfirmations = 0;
      tx->mixin = request.mixin;
      tx->unlockTime = request.unlockTime == boost::none ? 0 : request.unlockTime.get();
      if (tx->isRelayed.get()) tx->lastRelayedTimestamp = static_cast<uint64_t>(time(NULL));  // set last relayed timestamp to current time iff relayed  // TODO monero core: this should be encapsulated in wallet2
      outTransfer->accountIndex = request.accountIndex;
      if (request.subaddressIndices.size() == 1) outTransfer->subaddressIndices.push_back(request.subaddressIndices[0]);  // subaddress index is known iff 1 requested  // TODO: get all known subaddress indices here
      outTransfer->destinations = request.destinations;

      // iterate to next element
      txKeysIter++;
      txAmountsIter++;
      txFeesIter++;
      txIdsIter++;
      txBlobsIter++;
      txMetadatasIter++;
    }
    return txs;
  }

  shared_ptr<monero_tx_wallet> monero_wallet::sweep_output(const monero_send_request& request) const  {
    MTRACE("sweep_output()");
    MTRACE("monero_send_request: " << request.serialize());

    // validate input request
    if (request.keyImage == boost::none || request.keyImage.get().empty()) throw runtime_error("Must provide key image of output to sweep");
    if (request.destinations.size() != 1 || request.destinations[0]->address == boost::none || request.destinations[0]->address.get().empty()) throw runtime_error("Must provide exactly one destination to sweep output to");

    // validate the transfer requested and populate dsts & extra
    string paymentId = request.paymentId == boost::none ? string("") : request.paymentId.get();
    std::vector<cryptonote::tx_destination_entry> dsts;
    std::vector<uint8_t> extra;
    std::list<wallet_rpc::transfer_destination> destination;
    destination.push_back(wallet_rpc::transfer_destination());
    destination.back().amount = 0;
    destination.back().address = request.destinations[0]->address.get();
    epee::json_rpc::error er;
    if (!validate_transfer(wallet2.get(), destination, paymentId, dsts, extra, true, er)) {
      //throw runtime_error(er);  // TODO
      throw runtime_error("Handle validate_transfer error!");
    }

    // validate key image
    crypto::key_image ki;
    if (!epee::string_tools::hex_to_pod(request.keyImage.get(), ki)) {
      throw runtime_error("failed to parse key image");
    }

    // create transaction
    uint64_t mixin = wallet2->adjust_mixin(request.ringSize == boost::none ? 0 : request.ringSize.get() - 1);
    uint32_t priority = wallet2->adjust_priority(request.priority == boost::none ? 0 : request.priority.get());
    uint64_t unlockTime = request.unlockTime == boost::none ? 0 : request.unlockTime.get();
    std::vector<wallet2::pending_tx> ptx_vector = wallet2->create_transactions_single(ki, dsts[0].addr, dsts[0].is_subaddress, 1, mixin, unlockTime, priority, extra);

    // validate created transaction
    if (ptx_vector.empty()) throw runtime_error("No outputs found");
    if (ptx_vector.size() > 1) throw runtime_error("Multiple transactions are created, which is not supposed to happen");
    const wallet2::pending_tx &ptx = ptx_vector[0];
    if (ptx.selected_transfers.size() > 1) throw runtime_error("The transaction uses multiple inputs, which is not supposed to happen");

    // config for fill_response()
    bool getTxKeys = true;
    bool getTxHex = true;
    bool getTxMetadata = true;
    bool doNotRelay = request.doNotRelay == boost::none ? false : request.doNotRelay.get();

    // commit txs (if relaying) and get response using wallet rpc's fill_response()
    list<string> txKeys;
    list<uint64_t> txAmounts;
    list<uint64_t> txFees;
    string multisigTxSet;
    string unsignedTxSet;
    list<string> txIds;
    list<string> txBlobs;
    list<string> txMetadatas;
    if (!fill_response(wallet2.get(), ptx_vector, getTxKeys, txKeys, txAmounts, txFees, multisigTxSet, unsignedTxSet, doNotRelay, txIds, getTxHex, txBlobs, getTxMetadata, txMetadatas, er)) {
      throw runtime_error("need to handle error filling response!");  // TODO: return err message
    }

    // build sent txs from results  // TODO: use common utility with send_split() to avoid code duplication
    vector<shared_ptr<monero_tx_wallet>> txs;
    auto txIdsIter = txIds.begin();
    auto txKeysIter = txKeys.begin();
    auto txAmountsIter = txAmounts.begin();
    auto txFeesIter = txFees.begin();
    auto txBlobsIter = txBlobs.begin();
    auto txMetadatasIter = txMetadatas.begin();
    while (txIdsIter != txIds.end()) {

      // init tx with outgoing transfer from filled values
      shared_ptr<monero_tx_wallet> tx = make_shared<monero_tx_wallet>();
      txs.push_back(tx);
      tx->id = *txIdsIter;
      tx->key = *txKeysIter;
      tx->fee = *txFeesIter;
      tx->fullHex = *txBlobsIter;
      tx->metadata = *txMetadatasIter;
      shared_ptr<monero_outgoing_transfer> outTransfer = make_shared<monero_outgoing_transfer>();
      tx->outgoingTransfer = outTransfer;
      outTransfer->amount = *txAmountsIter;

      // init other known fields
      tx->paymentId = request.paymentId;
      tx->isConfirmed = false;
      tx->isMinerTx = false;
      tx->isFailed = false;   // TODO: test and handle if true
      tx->doNotRelay = request.doNotRelay != boost::none && request.doNotRelay.get() == true;
      tx->isRelayed = tx->doNotRelay.get() != true;
      tx->inTxPool = !tx->doNotRelay.get();
      if (!tx->isFailed.get() && tx->isRelayed.get()) tx->isDoubleSpendSeen = false;  // TODO: test and handle if true
      tx->numConfirmations = 0;
      tx->mixin = request.mixin;
      tx->unlockTime = request.unlockTime == boost::none ? 0 : request.unlockTime.get();
      if (tx->isRelayed.get()) tx->lastRelayedTimestamp = static_cast<uint64_t>(time(NULL));  // set last relayed timestamp to current time iff relayed  // TODO monero core: this should be encapsulated in wallet2
      outTransfer->accountIndex = request.accountIndex;
      if (request.subaddressIndices.size() == 1) outTransfer->subaddressIndices.push_back(request.subaddressIndices[0]);  // subaddress index is known iff 1 requested  // TODO: get all known subaddress indices here
      outTransfer->destinations = request.destinations;
      outTransfer->destinations[0]->amount = *txAmountsIter;

      // iterate to next element
      txKeysIter++;
      txAmountsIter++;
      txFeesIter++;
      txIdsIter++;
      txBlobsIter++;
      txMetadatasIter++;
    }

    // return tx
    if (txs.size() != 1) throw runtime_error("Expected 1 transaction but was " + boost::lexical_cast<std::string>(txs.size()));
    return txs[0];
  }

  vector<shared_ptr<monero_tx_wallet>> monero_wallet::sweep_dust(bool doNotRelay) {
    MTRACE("monero_wallet::sweep_dust()");

    // create transaction to fill
    std::vector<wallet2::pending_tx> ptx_vector = wallet2->create_unmixable_sweep_transactions();

    // config for fill_response
    bool getTxKeys = true;
    bool getTxHex = true;
    bool getTxMetadata = true;

    // commit txs (if relaying) and get response using wallet rpc's fill_response()
    list<string> txKeys;
    list<uint64_t> txAmounts;
    list<uint64_t> txFees;
    string multisigTxSet;
    string unsignedTxSet;
    list<string> txIds;
    list<string> txBlobs;
    list<string> txMetadatas;
    epee::json_rpc::error er;
    if (!fill_response(wallet2.get(), ptx_vector, getTxKeys, txKeys, txAmounts, txFees, multisigTxSet, unsignedTxSet, doNotRelay, txIds, getTxHex, txBlobs, getTxMetadata, txMetadatas, er)) {
      throw runtime_error("need to handle error filling response!");  // TODO: return err message
    }

    // build sent txs from results  // TODO: use common utility with send_split() to avoid code duplication
    vector<shared_ptr<monero_tx_wallet>> txs;
    auto txIdsIter = txIds.begin();
    auto txKeysIter = txKeys.begin();
    auto txAmountsIter = txAmounts.begin();
    auto txFeesIter = txFees.begin();
    auto txBlobsIter = txBlobs.begin();
    auto txMetadatasIter = txMetadatas.begin();
    while (txIdsIter != txIds.end()) {

      // init tx with outgoing transfer from filled values
      shared_ptr<monero_tx_wallet> tx = make_shared<monero_tx_wallet>();
      txs.push_back(tx);
      tx->id = *txIdsIter;
      tx->key = *txKeysIter;
      tx->fee = *txFeesIter;
      tx->fullHex = *txBlobsIter;
      tx->metadata = *txMetadatasIter;
      shared_ptr<monero_outgoing_transfer> outTransfer = make_shared<monero_outgoing_transfer>();
      tx->outgoingTransfer = outTransfer;
      outTransfer->amount = *txAmountsIter;

      // init other known fields
      tx->isConfirmed = false;
      tx->isMinerTx = false;
      tx->isFailed = false;   // TODO: test and handle if true
      tx->doNotRelay = doNotRelay;
      tx->isRelayed = tx->doNotRelay.get() != true;
      tx->inTxPool = !tx->doNotRelay.get();
      if (!tx->isFailed.get() && tx->isRelayed.get()) tx->isDoubleSpendSeen = false;  // TODO: test and handle if true
      tx->numConfirmations = 0;
      //tx->mixin = request.mixin;  // TODO: how to get?
      tx->unlockTime = 0;
      if (tx->isRelayed.get()) tx->lastRelayedTimestamp = static_cast<uint64_t>(time(NULL));  // set last relayed timestamp to current time iff relayed  // TODO monero core: this should be encapsulated in wallet2
      outTransfer->destinations[0]->amount = *txAmountsIter;

      // iterate to next element
      txKeysIter++;
      txAmountsIter++;
      txFeesIter++;
      txIdsIter++;
      txBlobsIter++;
      txMetadatasIter++;
    }

    return txs;
  }

  vector<string> monero_wallet::relay_txs(const vector<string>& txMetadatas) {
    MTRACE("relay_txs()");

    // relay each metadata as a tx
    vector<string> txIds;
    for (const auto& txMetadata : txMetadatas) {

      // parse tx metadata hex
      cryptonote::blobdata blob;
      if (!epee::string_tools::parse_hexstr_to_binbuff(txMetadata, blob)) {
        throw runtime_error("Failed to parse hex.");
      }

      // deserialize tx
      tools::wallet2::pending_tx ptx;
      try {
        std::istringstream iss(blob);
        boost::archive::portable_binary_iarchive ar(iss);
        ar >> ptx;
      } catch (...) {
        throw runtime_error("Failed to parse tx metadata.");
      }

      // commit tx
      try {
        wallet2->commit_tx(ptx);
      } catch (const std::exception& e) {
        throw runtime_error("Failed to commit tx.");
      }

      // collect resulting id
      txIds.push_back(epee::string_tools::pod_to_hex(cryptonote::get_transaction_hash(ptx.tx)));
    }

    // return relayed tx ids
    return txIds;
  }

  string monero_wallet::get_tx_note(const string& txId) const {
    MTRACE("monero_wallet::get_tx_note()");
    cryptonote::blobdata txBlob;
    if (!epee::string_tools::parse_hexstr_to_binbuff(txId, txBlob) || txBlob.size() != sizeof(crypto::hash)) {
      throw runtime_error("TX ID has invalid format");
    }
    crypto::hash txHash = *reinterpret_cast<const crypto::hash*>(txBlob.data());
    return wallet2->get_tx_note(txHash);
  }

  vector<string> monero_wallet::get_tx_notes(const vector<string>& txIds) const {
    MTRACE("monero_wallet::get_tx_notes()");
    vector<string> txNotes;
    for (const auto& txId : txIds) txNotes.push_back(get_tx_note(txId));
    return txNotes;
  }

  void monero_wallet::set_tx_note(const string& txId, const string& note) {
    MTRACE("monero_wallet::set_tx_note()");
    cryptonote::blobdata txBlob;
    if (!epee::string_tools::parse_hexstr_to_binbuff(txId, txBlob) || txBlob.size() != sizeof(crypto::hash)) {
      throw runtime_error("TX ID has invalid format");
    }
    crypto::hash txHash = *reinterpret_cast<const crypto::hash*>(txBlob.data());
    wallet2->set_tx_note(txHash, note);
  }

  void monero_wallet::set_tx_notes(const vector<string>& txIds, const vector<string>& txNotes) {
    MTRACE("monero_wallet::set_tx_notes()");
    if (txIds.size() != txNotes.size()) throw runtime_error("Different amount of txids and notes");
    for (int i = 0; i < txIds.size(); i++) {
      set_tx_note(txIds[i], txNotes[i]);
    }
  }

  string monero_wallet::sign(const string& msg) const {
    return wallet2->sign(msg);
  }

  bool monero_wallet::verify(const string& msg, const string& address, const string& signature) const {

    // validate and parse address or url
    cryptonote::address_parse_info info;
    string err;
    if (!get_account_address_from_str_or_url(info, wallet2->nettype(), address,
      [&err](const std::string &url, const std::vector<std::string> &addresses, bool dnssec_valid)->std::string {
        if (!dnssec_valid) {
          err = std::string("Invalid DNSSEC for ") + url;
          return {};
        }
        if (addresses.empty()) {
          err = std::string("No Monero address found at ") + url;
          return {};
        }
        return addresses[0];
      }))
    {
      throw runtime_error(err);
    }

    // verify and return result
    return wallet2->verify(msg, info.address, signature);
  }

  string monero_wallet::get_tx_key(const string& txId) const {
    MTRACE("monero_wallet::get_tx_key()");

    // validate and parse tx id hash
    crypto::hash txHash;
    if (!epee::string_tools::hex_to_pod(txId, txHash)) {
      throw runtime_error("TX ID has invalid format");
    }

    // get tx key and additional keys
    crypto::secret_key txKey;
    std::vector<crypto::secret_key> additionalTxKeys;
    if (!wallet2->get_tx_key(txHash, txKey, additionalTxKeys)) {
      throw runtime_error("No tx secret key is stored for this tx");
    }

    // build and return tx key with additional keys
    epee::wipeable_string s;
    s += epee::to_hex::wipeable_string(txKey);
    for (size_t i = 0; i < additionalTxKeys.size(); ++i) {
      s += epee::to_hex::wipeable_string(additionalTxKeys[i]);
    }
    return std::string(s.data(), s.size());
  }

  shared_ptr<monero_check_tx> monero_wallet::check_tx_key(const string& txId, const string& txKey, const string& address) const {
    MTRACE("monero_wallet::check_tx_key()");

    // validate and parse tx id
    crypto::hash txHash;
    if (!epee::string_tools::hex_to_pod(txId, txHash)) {
      throw runtime_error("TX ID has invalid format");
    }

    // validate and parse tx key
    epee::wipeable_string tx_key_str = txKey;
    if (tx_key_str.size() < 64 || tx_key_str.size() % 64) {
      throw runtime_error("Tx key has invalid format");
    }
    const char *data = tx_key_str.data();
    crypto::secret_key tx_key;
    if (!epee::wipeable_string(data, 64).hex_to_pod(unwrap(unwrap(tx_key)))) {
      throw runtime_error("Tx key has invalid format");
    }

    // get additional keys
    size_t offset = 64;
    std::vector<crypto::secret_key> additionalTxKeys;
    while (offset < tx_key_str.size()) {
      additionalTxKeys.resize(additionalTxKeys.size() + 1);
      if (!epee::wipeable_string(data + offset, 64).hex_to_pod(unwrap(unwrap(additionalTxKeys.back())))) {
        throw runtime_error("Tx key has invalid format");
      }
      offset += 64;
    }

    // validate and parse address
    cryptonote::address_parse_info info;
    if (!get_account_address_from_str(info, wallet2->nettype(), address)) {
      throw runtime_error("Invalid address");
    }

    // initialize and return tx check using wallet2
    uint64_t receivedAmount;
    bool inTxPool;
    uint64_t numConfirmations;
    wallet2->check_tx_key(txHash, tx_key, additionalTxKeys, info.address, receivedAmount, inTxPool, numConfirmations);
    shared_ptr<monero_check_tx> checkTx = make_shared<monero_check_tx>();
    checkTx->isGood = true; // check is good if we get this far
    checkTx->receivedAmount = receivedAmount;
    checkTx->inTxPool = inTxPool;
    checkTx->numConfirmations = numConfirmations;
    return checkTx;
  }

  string monero_wallet::get_tx_proof(const string& txId, const string& address, const string& message) const {

    // validate and parse tx id hash
    crypto::hash txHash;
    if (!epee::string_tools::hex_to_pod(txId, txHash)) {
      throw runtime_error("TX ID has invalid format");
    }

    // validate and parse address
    cryptonote::address_parse_info info;
    if (!get_account_address_from_str(info, wallet2->nettype(), address)) {
      throw runtime_error("Invalid address");
    }

    // get tx proof
    return wallet2->get_tx_proof(txHash, info.address, info.is_subaddress, message);
  }

  shared_ptr<monero_check_tx> monero_wallet::check_tx_proof(const string& txId, const string& address, const string& message, const string& signature) const {
    MTRACE("monero_wallet::check_tx_proof()");

    // validate and parse tx id
    crypto::hash txHash;
    if (!epee::string_tools::hex_to_pod(txId, txHash)) {
      throw runtime_error("TX ID has invalid format");
    }

    // validate and parse address
    cryptonote::address_parse_info info;
    if (!get_account_address_from_str(info, wallet2->nettype(), address)) {
      throw runtime_error("Invalid address");
    }

    // initialize and return tx check using wallet2
    shared_ptr<monero_check_tx> checkTx = make_shared<monero_check_tx>();
    uint64_t receivedAmount;
    bool inTxPool;
    uint64_t numConfirmations;
    checkTx->isGood = wallet2->check_tx_proof(txHash, info.address, info.is_subaddress, message, signature, receivedAmount, inTxPool, numConfirmations);
    if (checkTx->isGood) {
      checkTx->receivedAmount = receivedAmount;
      checkTx->inTxPool = inTxPool;
      checkTx->numConfirmations = numConfirmations;
    }
    return checkTx;
  }

  string monero_wallet::get_spend_proof(const string& txId, const string& message) const {
    MTRACE("monero_wallet::get_spend_proof()");

    // validate and parse tx id
    crypto::hash txHash;
    if (!epee::string_tools::hex_to_pod(txId, txHash)) {
      throw runtime_error("TX ID has invalid format");
    }

    // return spend proof signature
    return wallet2->get_spend_proof(txHash, message);
  }

  bool monero_wallet::check_spend_proof(const string& txId, const string& message, const string& signature) const {
    MTRACE("monero_wallet::check_spend_proof()");

    // validate and parse tx id
    crypto::hash txHash;
    if (!epee::string_tools::hex_to_pod(txId, txHash)) {
      throw runtime_error("TX ID has invalid format");
    }

    // check spend proof
    return wallet2->check_spend_proof(txHash, message, signature);
  }

  string monero_wallet::get_reserve_proof_wallet(const string& message) const {
    MTRACE("monero_wallet::get_reserve_proof_wallet()");
    boost::optional<std::pair<uint32_t, uint64_t>> account_minreserve;
    return wallet2->get_reserve_proof(account_minreserve, message);
  }

  string monero_wallet::get_reserve_proof_account(uint32_t accountIdx, uint64_t amount, const string& message) const {
    MTRACE("monero_wallet::get_reserve_proof_account()");
    boost::optional<std::pair<uint32_t, uint64_t>> account_minreserve;
    if (accountIdx >= wallet2->get_num_subaddress_accounts()) throw runtime_error("Account index is out of bound");
    account_minreserve = std::make_pair(accountIdx, amount);
    return wallet2->get_reserve_proof(account_minreserve, message);
  }

  shared_ptr<monero_check_reserve> monero_wallet::check_reserve_proof(const string& address, const string& message, const string& signature) const {
    MTRACE("monero_wallet::check_reserve_proof()");

    // validate and parse input
    cryptonote::address_parse_info info;
    if (!get_account_address_from_str(info, wallet2->nettype(), address)) throw runtime_error("Invalid address");
    if (info.is_subaddress) throw runtime_error("Address must not be a subaddress");

    // initialize check reserve using wallet2
    shared_ptr<monero_check_reserve> checkReserve = make_shared<monero_check_reserve>();
    uint64_t totalAmount;
    uint64_t unconfirmedSpentAmount;
    checkReserve->isGood = wallet2->check_reserve_proof(info.address, message, signature, totalAmount, unconfirmedSpentAmount);
    if (checkReserve->isGood) {
      checkReserve->totalAmount = totalAmount;
      checkReserve->unconfirmedSpentAmount = unconfirmedSpentAmount;
    }
    return checkReserve;
  }

  string monero_wallet::create_payment_uri(const monero_send_request& request) const {
    MTRACE("create_payment_uri()");

    // validate request
    if (request.destinations.size() != 1) throw runtime_error("Cannot make URI from supplied parameters: must provide exactly one destination to send funds");
    if (request.destinations.at(0)->address == boost::none) throw runtime_error("Cannot make URI from supplied parameters: must provide destination address");
    if (request.destinations.at(0)->amount == boost::none) throw runtime_error("Cannot make URI from supplied parameters: must provide destination amount");

    // prepare wallet2 params
    string address = request.destinations.at(0)->address.get();
    string paymentId = request.paymentId == boost::none ? "" : request.paymentId.get();
    uint64_t amount = request.destinations.at(0)->amount.get();
    string note = request.note == boost::none ? "" : request.note.get();
    string recipientName = request.recipientName == boost::none ? "" : request.recipientName.get();

    // make uri using wallet2
    std::string error;
    string uri = wallet2->make_uri(address, paymentId, amount, note, recipientName, error);
    if (uri.empty()) throw runtime_error("Cannot make URI from supplied parameters: " + error);
    return uri;
  }

  shared_ptr<monero_send_request> monero_wallet::parse_payment_uri(const string& uri) const {
    MTRACE("parse_payment_uri(" << uri << ")");

    // decode uri to parameters
    string address;
    string paymentId;
    uint64_t amount = 0;
    string note;
    string recipientName;
    vector<string> unknownParameters;
    string error;
    if (!wallet2->parse_uri(uri, address, paymentId, amount, note, recipientName, unknownParameters, error)) {
      throw runtime_error("Error parsing URI: " + error);
    }

    // initialize send request
    shared_ptr<monero_send_request> sendRequest = make_shared<monero_send_request>();
    shared_ptr<monero_destination> destination = make_shared<monero_destination>();
    sendRequest->destinations.push_back(destination);
    if (!address.empty()) destination->address = address;
    destination->amount = amount;
    if (!paymentId.empty()) sendRequest->paymentId = paymentId;
    if (!note.empty()) sendRequest->note = note;
    if (!recipientName.empty()) sendRequest->recipientName = recipientName;
    if (!unknownParameters.empty()) MWARNING("WARNING in monero_wallet::parse_payment_uri: URI contains unknown parameters which are discarded"); // TODO: return unknown parameters?
    return sendRequest;
  }

  void monero_wallet::set_attribute(const string& key, const string& val) {
    wallet2->set_attribute(key, val);
  }

  string monero_wallet::get_attribute(const string& key) const {
    return wallet2->get_attribute(key);
  }

  void monero_wallet::start_mining(boost::optional<uint64_t> numThreads, boost::optional<bool> backgroundMining, boost::optional<bool> ignoreBattery) {
    MTRACE("start_mining()");

    // only mine on trusted daemon
    if (!wallet2->is_trusted_daemon()) throw runtime_error("This command requires a trusted daemon.");

    // set defaults
    if (numThreads == boost::none || numThreads.get() == 0) numThreads = 1;  // TODO: how to autodetect optimal number of threads which daemon supports?
    if (backgroundMining == boost::none) backgroundMining = false;
    if (ignoreBattery == boost::none) ignoreBattery = false;

    // validate num threads
    size_t max_mining_threads_count = (std::max)(tools::get_max_concurrency(), static_cast<unsigned>(2));
    if (numThreads.get() < 1 || max_mining_threads_count < numThreads.get()) {
      throw runtime_error("The specified number of threads is inappropriate.");
    }

    // start mining on daemon
    cryptonote::COMMAND_RPC_START_MINING::request daemon_req = AUTO_VAL_INIT(daemon_req);
    daemon_req.miner_address = wallet2->get_account().get_public_address_str(wallet2->nettype());
    daemon_req.threads_count = numThreads.get();
    daemon_req.do_background_mining = backgroundMining.get();
    daemon_req.ignore_battery       = ignoreBattery.get();
    cryptonote::COMMAND_RPC_START_MINING::response daemon_res;
    bool r = wallet2->invoke_http_json("/start_mining", daemon_req, daemon_res);
    if (!r || daemon_res.status != CORE_RPC_STATUS_OK) {
      throw runtime_error("Couldn't start mining due to unknown error.");
    }
  }

  void monero_wallet::stop_mining() {
    MTRACE("stop_mining()");
    cryptonote::COMMAND_RPC_STOP_MINING::request daemon_req;
    cryptonote::COMMAND_RPC_STOP_MINING::response daemon_res;
    bool r = wallet2->invoke_http_json("/stop_mining", daemon_req, daemon_res);
    if (!r || daemon_res.status != CORE_RPC_STATUS_OK) {
      throw runtime_error("Couldn't stop mining due to unknown error.");
    }
  }

  void monero_wallet::save() {
    MTRACE("save()");
    wallet2->store();
  }

  void monero_wallet::move_to(string path, string password) {
    MTRACE("move_to(" << path << ", " << password << ")");
    wallet2->store_to(path, password);
  }

  void monero_wallet::close() {
    MTRACE("close()");
    syncingEnabled = false;
    syncingThreadDone = true;
    syncCV.notify_one();
    syncingThread.join();
    wallet2->stop();
    wallet2->deinit();
  }

  // ------------------------------- PRIVATE HELPERS ----------------------------

  void monero_wallet::initCommon() {
    MTRACE("monero_wallet.cpp initCommon()");
    wallet2Listener = unique_ptr<Wallet2Listener>(new Wallet2Listener(*this, *wallet2));
    if (get_daemon_connection() == nullptr) isConnected = false;
    isSynced = false;
    rescanOnSync = false;
    syncingEnabled = false;
    syncingThreadDone = false;
    syncingInterval = DEFAULT_SYNC_INTERVAL_MILLIS;

    // start auto sync loop
    syncingThread = boost::thread([this]() {
      this->syncingThreadFunc();
    });
  }

  void monero_wallet::syncingThreadFunc() {
    MTRACE("syncingThreadFunc()");
    while (true) {
      boost::mutex::scoped_lock lock(syncingMutex);
      if (syncingThreadDone) break;
      if (syncingEnabled) {
        boost::posix_time::milliseconds wait_for_ms(syncingInterval.load());
        syncCV.timed_wait(lock, wait_for_ms);
      } else {
        syncCV.wait(lock);
      }
      if (syncingEnabled) {
        lockAndSync();
      }
    }
  }

  monero_sync_result monero_wallet::lockAndSync(boost::optional<uint64_t> startHeight, boost::optional<monero_sync_listener&> listener) {
    bool rescan = rescanOnSync.exchange(false);
    boost::lock_guard<boost::mutex> guarg(syncMutex); // synchronize sync() and syncAsync()
    monero_sync_result result;
    result.numBlocksFetched = 0;
    result.receivedMoney = false;
    do {
      // skip if daemon is not connected or synced
      if (isConnected && get_is_daemon_synced()) {

        // rescan blockchain if requested
        if (rescan) wallet2->rescan_blockchain(false);

        // sync wallet
        result = syncAux(startHeight, listener);

        // find and save rings
        wallet2->find_and_save_rings(false);
      }
    } while (!rescan && (rescan = rescanOnSync.exchange(false))); // repeat if not rescanned and rescan was requested
    return result;
  }

  monero_sync_result monero_wallet::syncAux(boost::optional<uint64_t> startHeight, boost::optional<monero_sync_listener&> listener) {
    MTRACE("syncAux()");

    // determine sync start height
    uint64_t syncStartHeight = startHeight == boost::none ? max(get_height(), get_restore_height()) : *startHeight;
    if (syncStartHeight < get_restore_height()) set_restore_height(syncStartHeight); // TODO monero core: start height processed > requested start height unless restore height manually set

    // sync wallet and return result
    wallet2Listener->onSyncStart(syncStartHeight, listener);
    monero_sync_result result;
    wallet2->refresh(wallet2->is_trusted_daemon(), syncStartHeight, result.numBlocksFetched, result.receivedMoney, true);
    if (!isSynced) isSynced = true;
    wallet2Listener->onSyncEnd();
    return result;
  }

  // private helper to initialize subaddresses using transfer details
  vector<monero_subaddress> monero_wallet::getSubaddressesAux(const uint32_t accountIdx, const vector<uint32_t>& subaddressIndices, const vector<tools::wallet2::transfer_details>& transfers) const {
    vector<monero_subaddress> subaddresses;

    // get balances per subaddress as maps
    map<uint32_t, uint64_t> balancePerSubaddress = wallet2->balance_per_subaddress(accountIdx);
    map<uint32_t, std::pair<uint64_t, uint64_t>> unlockedBalancePerSubaddress = wallet2->unlocked_balance_per_subaddress(accountIdx);

    // get all indices if no indices given
    vector<uint32_t> subaddressIndicesReq;
    if (subaddressIndices.empty()) {
      for (uint32_t subaddressIdx = 0; subaddressIdx < wallet2->get_num_subaddresses(accountIdx); subaddressIdx++) {
        subaddressIndicesReq.push_back(subaddressIdx);
      }
    } else {
      subaddressIndicesReq = subaddressIndices;
    }

    // initialize subaddresses at indices
    for (uint32_t subaddressIndicesIdx = 0; subaddressIndicesIdx < subaddressIndicesReq.size(); subaddressIndicesIdx++) {
      monero_subaddress subaddress;
      subaddress.accountIndex = accountIdx;
      uint32_t subaddressIdx = subaddressIndicesReq.at(subaddressIndicesIdx);
      subaddress.index = subaddressIdx;
      subaddress.address = get_address(accountIdx, subaddressIdx);
      subaddress.label = wallet2->get_subaddress_label({accountIdx, subaddressIdx});
      auto iter1 = balancePerSubaddress.find(subaddressIdx);
      subaddress.balance = iter1 == balancePerSubaddress.end() ? 0 : iter1->second;
      auto iter2 = unlockedBalancePerSubaddress.find(subaddressIdx);
      subaddress.unlockedBalance = iter2 == unlockedBalancePerSubaddress.end() ? 0 : iter2->second.first;
      cryptonote::subaddress_index index = {accountIdx, subaddressIdx};
      subaddress.numUnspentOutputs = count_if(transfers.begin(), transfers.end(), [&](const tools::wallet2::transfer_details& td) { return !td.m_spent && td.m_subaddr_index == index; });
      subaddress.isUsed = find_if(transfers.begin(), transfers.end(), [&](const tools::wallet2::transfer_details& td) { return td.m_subaddr_index == index; }) != transfers.end();
      subaddress.numBlocksToUnlock = iter1 == balancePerSubaddress.end() ? 0 : iter2->second.second;
      subaddresses.push_back(subaddress);
    }

    return subaddresses;
  }
}