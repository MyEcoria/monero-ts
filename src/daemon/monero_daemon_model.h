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

#pragma once

#include <boost/property_tree/ptree.hpp>
#include <boost/property_tree/json_parser.hpp>

using namespace std;

/**
 * Public interface for libmonero-cpp library.
 */
namespace monero {

  /**
   * Base struct which can be serialized.
   */
  struct serializable_struct {

    /**
     * Serializes the struct to a json string.
     *
     * @return the struct serialized to a json string
     */
    string serialize() const;

    /**
     * Convert the struct to a property tree.
     *
     * @return the converted property tree
     */
    virtual boost::property_tree::ptree to_property_tree() const = 0;
  };

  /**
   * Enumerates Monero network types.
   */
  enum monero_network_type : uint8_t {
      MAINNET = 0,
      TESTNET,
      STAGENET
  };

  /**
   * Models a connection to a daemon.
   *
   * TODO: switch to boost::optional<string>
   */
  struct monero_rpc_connection {
    string uri;
    boost::optional<string> username;
    boost::optional<string> password;
    monero_rpc_connection(const string& uri = "", const boost::optional<string>& username = boost::none, const boost::optional<string>& password = boost::none) : uri(uri), username(username), password(password) {}
  };

  // forward declarations
  struct monero_tx;
  struct monero_output;

  /**
   * Models a Monero block header which contains information about the block.
   *
   * TODO: a header that is transmitted may have fewer fields like cryptonote::block_header; separate?
   */
  struct monero_block_header : public serializable_struct {
    boost::optional<string> id;
    boost::optional<uint64_t> height;
    boost::optional<uint64_t> timestamp;
    boost::optional<uint64_t> size;
    boost::optional<uint64_t> weight;
    boost::optional<uint64_t> long_term_weight;
    boost::optional<uint64_t> depth;
    boost::optional<uint64_t> difficulty;
    boost::optional<uint64_t> cumulative_difficulty;
    boost::optional<uint32_t> major_version;
    boost::optional<uint32_t> minor_version;
    boost::optional<uint64_t> nonce;
    boost::optional<string> miner_tx_id;
    boost::optional<uint32_t> num_txs;
    boost::optional<bool> orphan_status;
    boost::optional<string> prev_id;
    boost::optional<uint64_t> reward;
    boost::optional<string> pow_hash;

    boost::property_tree::ptree to_property_tree() const;
    virtual void merge(const shared_ptr<monero_block_header>& self, const shared_ptr<monero_block_header>& other);
  };

  /**
   * Models a Monero block in the blockchain.
   */
  struct monero_block : public monero_block_header {
    boost::optional<string> hex;
    boost::optional<shared_ptr<monero_tx>> miner_tx;
    vector<shared_ptr<monero_tx>> txs;
    vector<string> tx_ids;

    boost::property_tree::ptree to_property_tree() const;
    void merge(const shared_ptr<monero_block_header>& self, const shared_ptr<monero_block_header>& other);
    void merge(const shared_ptr<monero_block>& self, const shared_ptr<monero_block>& other);
  };

  /**
   * Models a Monero transaction on the blockchain.
   */
  struct monero_tx : public serializable_struct {
    static const string DEFAULT_PAYMENT_ID;  // default payment id "0000000000000000"
    boost::optional<shared_ptr<monero_block>> block;
    boost::optional<string> id;
    boost::optional<uint32_t> version;
    boost::optional<bool> is_miner_tx;
    boost::optional<string> payment_id;
    boost::optional<uint64_t> fee;
    boost::optional<uint32_t> mixin;
    boost::optional<bool> do_not_relay;
    boost::optional<bool> is_relayed;
    boost::optional<bool> is_confirmed;
    boost::optional<bool> in_tx_pool;
    boost::optional<uint64_t> num_confirmations;
    boost::optional<uint64_t> unlock_time;
    boost::optional<uint64_t> last_relayed_timestamp;
    boost::optional<uint64_t> received_timestamp;
    boost::optional<bool> is_double_spend_seen;
    boost::optional<string> key;
    boost::optional<string> full_hex;
    boost::optional<string> pruned_hex;
    boost::optional<string> prunable_hex;
    boost::optional<string> prunable_hash;
    boost::optional<uint32_t> size;
    boost::optional<uint32_t> weight;
    vector<shared_ptr<monero_output>> vins;
    vector<shared_ptr<monero_output>> vouts;
    vector<uint32_t> m_output_indices;
    boost::optional<string> metadata;
    boost::optional<string> common_tx_sets;
    vector<uint8_t> extra;
    boost::optional<string> rct_signatures;   // TODO: implement
    boost::optional<string> rct_sig_prunable;  // TODO: implement
    boost::optional<bool> is_kept_by_block;
    boost::optional<bool> is_failed;
    boost::optional<uint32_t> last_failed_height;
    boost::optional<string> last_failed_id;
    boost::optional<uint32_t> max_used_block_height;
    boost::optional<string> max_used_block_id;
    vector<string> signatures;

    shared_ptr<monero_tx> copy(const shared_ptr<monero_tx>& src, const shared_ptr<monero_tx>& tgt) const;
    boost::property_tree::ptree to_property_tree() const;
    virtual void merge(const shared_ptr<monero_tx>& self, const shared_ptr<monero_tx>& other);
    boost::optional<uint64_t> get_height() const;
  };

  /**
   * Models a Monero key image.
   */
  struct monero_key_image : public serializable_struct {
    boost::optional<string> hex;
    boost::optional<string> signature;

    shared_ptr<monero_key_image> copy(const shared_ptr<monero_key_image>& src, const shared_ptr<monero_key_image>& tgt) const;
    boost::property_tree::ptree to_property_tree() const;
    void merge(const shared_ptr<monero_key_image>& self, const shared_ptr<monero_key_image>& other);
  };

  /**
   * Models a Monero transaction output.
   */
  struct monero_output : public serializable_struct {
    shared_ptr<monero_tx> tx;
    boost::optional<shared_ptr<monero_key_image>> key_image;
    boost::optional<uint64_t> amount;
    boost::optional<uint64_t> index;
    vector<uint64_t> ring_output_indices;
    boost::optional<string> stealth_public_key;

    shared_ptr<monero_output> copy(const shared_ptr<monero_output>& src, const shared_ptr<monero_output>& tgt) const;
    boost::property_tree::ptree to_property_tree() const;
    virtual void merge(const shared_ptr<monero_output>& self, const shared_ptr<monero_output>& other);
  };
}
