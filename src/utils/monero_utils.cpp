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

#include "monero_utils.h"
#include "rpc/core_rpc_server_commands_defs.h"
#include "storages/portable_storage_template_helper.h"
#include "cryptonote_basic/cryptonote_format_utils.h"

using namespace std;
using namespace cryptonote;
using namespace monero_utils;

// ------------------------------- INNER HELPERS ------------------------------

void nodeToTransfer(const boost::property_tree::ptree& node, shared_ptr<monero_transfer> transfer) {

  // initialize transfer from node
  for (boost::property_tree::ptree::const_iterator it = node.begin(); it != node.end(); ++it) {
    string key = it->first;
    if (key == string("accountIndex")) transfer->accountIndex = it->second.get_value<uint32_t>();
  }
}

shared_ptr<monero_transfer_request> nodeToTransferRequest(const boost::property_tree::ptree& node) {
  shared_ptr<monero_transfer_request> transferRequest = make_shared<monero_transfer_request>();
  nodeToTransfer(node, transferRequest);

  // initialize request from node
  for (boost::property_tree::ptree::const_iterator it = node.begin(); it != node.end(); ++it) {
    string key = it->first;
    if (key == string("isIncoming")) transferRequest->isIncoming = it->second.get_value<bool>();
    else if (key == string("address")) transferRequest->address = it->second.data();
    else if (key == string("addresses")) throw runtime_error("addresses not implemented");
    else if (key == string("subaddressIndex")) transferRequest->subaddressIndex = it->second.get_value<uint32_t>();
    else if (key == string("subaddressIndices")) {
      vector<uint32_t> subaddressIndices;
      for (const auto& child : it->second) subaddressIndices.push_back(child.second.get_value<uint32_t>());
      transferRequest->subaddressIndices = subaddressIndices;
    }
    else if (key == string("destinations")) throw runtime_error("destinations not implemented");
    else if (key == string("hasDestinations")) transferRequest->hasDestinations = it->second.get_value<bool>();
    else if (key == string("txRequest")) throw runtime_error("txRequest not implemented");
  }

  return transferRequest;
}

shared_ptr<monero_key_image> nodeToKeyImage(const boost::property_tree::ptree& node) {

  // initialize key image from node
  shared_ptr<monero_key_image> keyImage = make_shared<monero_key_image>();
  for (boost::property_tree::ptree::const_iterator it = node.begin(); it != node.end(); ++it) {
    string key = it->first;
    if (key == string("hex")) keyImage->hex = it->second.data();
    else if (key == string("signature")) keyImage->signature = it->second.data();
  }

  return keyImage;
}

void nodeToOutput(const boost::property_tree::ptree& node, shared_ptr<monero_output> output) {

  // initialize output from node
  for (boost::property_tree::ptree::const_iterator it = node.begin(); it != node.end(); ++it) {
    string key = it->first;
    if (key == string("keyImage")) output->keyImage = nodeToKeyImage(it->second);
    else if (key == string("amount")) output->amount = it->second.get_value<uint64_t>();
    else if (key == string("index")) output->index = it->second.get_value<uint32_t>();
    else if (key == string("ringOutputIndices")) throw runtime_error("nodeToTx() deserialize ringOutputIndices not implemented");
    else if (key == string("stealthPublicKey")) throw runtime_error("nodeToTx() deserialize stealthPublicKey not implemented");
  }
}

void nodeToOutputWallet(const boost::property_tree::ptree& node, shared_ptr<monero_output_wallet> outputWallet) {
  nodeToOutput(node, outputWallet);
  for (boost::property_tree::ptree::const_iterator it = node.begin(); it != node.end(); ++it) {
    string key = it->first;
    if (key == string("accountIndex")) outputWallet->accountIndex = it->second.get_value<uint32_t>();
    else if (key == string("subaddressIndex")) outputWallet->subaddressIndex = it->second.get_value<uint32_t>();
    else if (key == string("isSpent")) outputWallet->isSpent = it->second.get_value<bool>();
    else if (key == string("isUnlocked")) outputWallet->isUnlocked = it->second.get_value<bool>();
    else if (key == string("isFrozen")) outputWallet->isFrozen = it->second.get_value<bool>();
  }
}

shared_ptr<monero_output_request> nodeToOutputRequest(const boost::property_tree::ptree& node) {
  shared_ptr<monero_output_request> outputRequest = make_shared<monero_output_request>();
  nodeToOutputWallet(node, outputRequest);

  // initialize request from node
  for (boost::property_tree::ptree::const_iterator it = node.begin(); it != node.end(); ++it) {
    string key = it->first;
    if (key == string("subaddressIndices")) for (boost::property_tree::ptree::const_iterator it2 = it->second.begin(); it2 != it->second.end(); ++it2) outputRequest->subaddressIndices.push_back(it2->second.get_value<uint32_t>());
    else if (key == string("txRequest")) {} // ignored
  }

  return outputRequest;
}

void nodeToTx(const boost::property_tree::ptree& node, shared_ptr<monero_tx> tx) {

  // initialize tx from node
  for (boost::property_tree::ptree::const_iterator it = node.begin(); it != node.end(); ++it) {
    string key = it->first;
    if (key == string("id")) tx->id = it->second.data();
    else if (key == string("version")) throw runtime_error("version deserializationn not implemented");
    else if (key == string("isMinerTx")) tx->isMinerTx = it->second.get_value<bool>();
    else if (key == string("paymentId")) throw runtime_error("paymentId deserializationn not implemented");
    else if (key == string("fee")) throw runtime_error("fee deserialization not implemented");
    else if (key == string("mixin")) throw runtime_error("mixin deserialization not implemented");
    else if (key == string("doNotRelay")) tx->doNotRelay = it->second.get_value<bool>();
    else if (key == string("isRelayed")) tx->isRelayed = it->second.get_value<bool>();
    else if (key == string("isConfirmed")) tx->isConfirmed = it->second.get_value<bool>();
    else if (key == string("inTxPool")) tx->inTxPool = it->second.get_value<bool>();
    else if (key == string("numConfirmations")) throw runtime_error("numConfirmations deserialization not implemented");
    else if (key == string("unlockTime")) throw runtime_error("unlockTime deserialization not implemented");
    else if (key == string("lastRelayedTimestamp")) throw runtime_error("lastRelayedTimestamp deserialization not implemented");
    else if (key == string("receivedTimestamp")) throw runtime_error("receivedTimestamp deserializationn not implemented");
    else if (key == string("isDoubleSpendSeen")) tx->isDoubleSpendSeen = it->second.get_value<bool>();
    else if (key == string("key")) tx->key = it->second.data();
    else if (key == string("fullHex")) tx->fullHex = it->second.data();
    else if (key == string("prunedHex")) tx->prunedHex = it->second.data();
    else if (key == string("prunableHex")) tx->prunableHex = it->second.data();
    else if (key == string("prunableHash")) tx->prunableHash = it->second.data();
    else if (key == string("size")) throw runtime_error("size deserialization not implemented");
    else if (key == string("weight")) throw runtime_error("weight deserialization not implemented");
    else if (key == string("vins")) throw runtime_error("vins deserializationn not implemented");
    else if (key == string("vouts")) throw runtime_error("vouts deserializationn not implemented");
    else if (key == string("outputIndices")) throw runtime_error("outputIndices deserialization not implemented");
    else if (key == string("metadata")) throw runtime_error("metadata deserialization not implemented");
    else if (key == string("commonTxSets")) throw runtime_error("commonTxSets deserialization not implemented");
    else if (key == string("extra")) throw runtime_error("extra deserialization not implemented");
    else if (key == string("rctSignatures")) throw runtime_error("rctSignatures deserialization not implemented");
    else if (key == string("rctSigPrunable")) throw runtime_error("rctSigPrunable deserialization not implemented");
    else if (key == string("isKeptByBlock")) tx->isKeptByBlock = it->second.get_value<bool>();
    else if (key == string("isFailed")) tx->isFailed = it->second.get_value<bool>();
    else if (key == string("lastFailedHeight")) throw runtime_error("lastFailedHeight deserialization not implemented");
    else if (key == string("lastFailedId")) tx->lastFailedId = it->second.data();
    else if (key == string("maxUsedBlockHeight")) throw runtime_error("maxUsedBlockHeight deserialization not implemented");
    else if (key == string("maxUsedBlockId")) tx->maxUsedBlockId = it->second.data();
    else if (key == string("signatures")) throw runtime_error("signatures deserialization not implemented");
  }
}

// TODO: fill this out
void nodeToTxWallet(const boost::property_tree::ptree& node, shared_ptr<monero_tx_wallet> txWallet) {
  nodeToTx(node, txWallet);

  for (boost::property_tree::ptree::const_iterator it = node.begin(); it != node.end(); ++it) {
    string key = it->first;
    //if (key == string("id")) tx->id = it->second.data();
  }
}

shared_ptr<monero_tx_request> nodeToTxRequest(const boost::property_tree::ptree& node) {
  shared_ptr<monero_tx_request> txRequest = make_shared<monero_tx_request>();
  nodeToTxWallet(node, txRequest);

  // initialize request from node
  for (boost::property_tree::ptree::const_iterator it = node.begin(); it != node.end(); ++it) {
    string key = it->first;
    if (key == string("isOutgoing")) txRequest->isOutgoing = it->second.get_value<bool>();
    else if (key == string("isIncoming")) txRequest->isIncoming = it->second.get_value<bool>();
    else if (key == string("txIds")) for (boost::property_tree::ptree::const_iterator it2 = it->second.begin(); it2 != it->second.end(); ++it2) txRequest->txIds.push_back(it2->second.data());
    else if (key == string("hasPaymentId")) txRequest->hasPaymentId = it->second.get_value<bool>();
    else if (key == string("paymentIds")) for (boost::property_tree::ptree::const_iterator it2 = it->second.begin(); it2 != it->second.end(); ++it2) txRequest->paymentIds.push_back(it2->second.data());
    else if (key == string("height")) txRequest->height = it->second.get_value<uint64_t>();
    else if (key == string("minHeight")) txRequest->minHeight = it->second.get_value<uint64_t>();
    else if (key == string("maxHeight")) txRequest->maxHeight = it->second.get_value<uint64_t>();
    else if (key == string("includeOutputs")) txRequest->includeOutputs = it->second.get_value<bool>();
    else if (key == string("transferRequest")) txRequest->transferRequest = nodeToTransferRequest(it->second);
    else if (key == string("outputRequest")) txRequest->outputRequest = nodeToOutputRequest(it->second);
  }

  return txRequest;
}

shared_ptr<monero_block> nodeToBlockRequest(const boost::property_tree::ptree& node) {
  shared_ptr<monero_block> block = make_shared<monero_block>();
  for (boost::property_tree::ptree::const_iterator it = node.begin(); it != node.end(); ++it) {
    string key = it->first;
    if (key == string("txs")) {
      boost::property_tree::ptree txsNode = it->second;
      for (boost::property_tree::ptree::const_iterator it2 = txsNode.begin(); it2 != txsNode.end(); ++it2) {
        block->txs.push_back(nodeToTxRequest(it2->second));
      }
    }
  }
  return block;
}

shared_ptr<monero_destination> nodeToDestination(const boost::property_tree::ptree& node) {
  shared_ptr<monero_destination> destination = make_shared<monero_destination>();
  for (boost::property_tree::ptree::const_iterator it = node.begin(); it != node.end(); ++it) {
    string key = it->first;
    if (key == string("address")) destination->address = it->second.data();
    else if (key == string("amount")) destination->amount = it->second.get_value<uint64_t>();
  }
  return destination;
}

// ------------------------- PUBLIC STATIC UTILITIES --------------------------

void monero_utils::jsonToBinary(const std::string &json, std::string &bin) {
  epee::serialization::portable_storage ps;
  ps.load_from_json(json);
  ps.store_to_binary(bin);
}

void monero_utils::binaryToJson(const std::string &bin, std::string &json) {
  epee::serialization::portable_storage ps;
  ps.load_from_binary(bin);
  ps.dump_as_json(json);
}

void monero_utils::binaryBlocksToJson(const std::string &bin, std::string &json) {

  // load binary rpc response to struct
  cryptonote::COMMAND_RPC_GET_BLOCKS_BY_HEIGHT::response resp_struct;
  epee::serialization::load_t_from_binary(resp_struct, bin);

  // build property tree from deserialized blocks and transactions
  boost::property_tree::ptree root;
  boost::property_tree::ptree blocksNode;	// array of block strings
  boost::property_tree::ptree txsNodes;		// array of txs per block (array of array)
  for (int blockIdx = 0; blockIdx < resp_struct.blocks.size(); blockIdx++) {

    // parse and validate block
    cryptonote::block block;
    if (cryptonote::parse_and_validate_block_from_blob(resp_struct.blocks[blockIdx].block, block)) {

      // add block node to blocks node
      boost::property_tree::ptree blockNode;
      blockNode.put("", cryptonote::obj_to_json_str(block));	// TODO: no pretty print
      blocksNode.push_back(std::make_pair("", blockNode));
    } else {
      throw std::runtime_error("failed to parse block blob at index " + std::to_string(blockIdx));
    }

    // parse and validate txs
    boost::property_tree::ptree txsNode;
    for (int txIdx = 0; txIdx < resp_struct.blocks[blockIdx].txs.size(); txIdx++) {
      cryptonote::transaction tx;
      if (cryptonote::parse_and_validate_tx_from_blob(resp_struct.blocks[blockIdx].txs[txIdx], tx)) {

        // add tx node to txs node
        boost::property_tree::ptree txNode;
        MTRACE("PRUNED:\n" << monero_utils::get_pruned_tx_json(tx));
        txNode.put("", monero_utils::get_pruned_tx_json(tx));	// TODO: no pretty print
        txsNode.push_back(std::make_pair("", txNode));
      } else {
	      throw std::runtime_error("failed to parse tx blob at index " + std::to_string(txIdx));
      }
    }
    txsNodes.push_back(std::make_pair("", txsNode));	// array of array of transactions, one array per block
  }
  root.add_child("blocks", blocksNode);
  root.add_child("txs", txsNodes);
  root.put("status", resp_struct.status);
  root.put("untrusted", resp_struct.untrusted);	// TODO: loss of ints and bools

  // convert root to string // TODO: common utility with serial_bridge
  std::stringstream ss;
  boost::property_tree::write_json(ss, root, false/*pretty*/);
  json = ss.str();
}

shared_ptr<monero_tx_request> monero_utils::deserializeTxRequest(const string& txRequestStr) {

  // deserialize tx request string to property rooted at block
  std::istringstream iss = txRequestStr.empty() ? std::istringstream() : std::istringstream(txRequestStr);
  boost::property_tree::ptree blockNode;
  boost::property_tree::read_json(iss, blockNode);

  // convert request property tree to block
  shared_ptr<monero_block> block = nodeToBlockRequest(blockNode);

  // get tx request
  shared_ptr<monero_tx_request> txRequest = static_pointer_cast<monero_tx_request>(block->txs[0]);

  // return deserialized request
  return txRequest;
}

shared_ptr<monero_transfer_request> monero_utils::deserializeTransferRequest(const string& transferRequestStr) {

  // deserialize transfer request string to property rooted at block
  std::istringstream iss = transferRequestStr.empty() ? std::istringstream() : std::istringstream(transferRequestStr);
  boost::property_tree::ptree blockNode;
  boost::property_tree::read_json(iss, blockNode);

  // convert request property tree to block
  shared_ptr<monero_block> block = nodeToBlockRequest(blockNode);

  // return mpty request if no txs
  if (block->txs.empty()) return make_shared<monero_transfer_request>();

  // get tx request
  shared_ptr<monero_tx_request> txRequest = static_pointer_cast<monero_tx_request>(block->txs[0]);

  // get / create transfer request
  shared_ptr<monero_transfer_request> transferRequest = txRequest->transferRequest == boost::none ? make_shared<monero_transfer_request>() : *txRequest->transferRequest;

  // transfer request references tx request but not the other way around to avoid circular loop // TODO: could add check within meetsCriterias()
  transferRequest->txRequest = txRequest;
  txRequest->transferRequest = boost::none;

  // return deserialized request
  return transferRequest;
}

shared_ptr<monero_output_request> monero_utils::deserializeOutputRequest(const string& outputRequestStr) {

  // deserialize output request string to property rooted at block
  std::istringstream iss = outputRequestStr.empty() ? std::istringstream() : std::istringstream(outputRequestStr);
  boost::property_tree::ptree blockNode;
  boost::property_tree::read_json(iss, blockNode);

  // convert request property tree to block
  shared_ptr<monero_block> block = nodeToBlockRequest(blockNode);

  // empty request if no txs
  if (block->txs.empty()) return make_shared<monero_output_request>();

  // get tx request
  shared_ptr<monero_tx_request> txRequest = static_pointer_cast<monero_tx_request>(block->txs[0]);

  // get / create output request
  shared_ptr<monero_output_request> outputRequest = txRequest->outputRequest == boost::none ? make_shared<monero_output_request>() : *txRequest->outputRequest;

  // output request references tx request but not the other way around to avoid circular loop // TODO: could add check within meetsCriterias()
  outputRequest->txRequest = txRequest;
  txRequest->outputRequest = boost::none;

  // return deserialized request
  return outputRequest;
}

shared_ptr<monero_send_request> monero_utils::deserializeSendRequest(const string& sendRequestStr) {

  // deserialize send request json to property node
  std::istringstream iss = sendRequestStr.empty() ? std::istringstream() : std::istringstream(sendRequestStr);
  boost::property_tree::ptree node;
  boost::property_tree::read_json(iss, node);

  // convert request property tree to monero_send_request
  shared_ptr<monero_send_request> sendRequest = make_shared<monero_send_request>();
  for (boost::property_tree::ptree::const_iterator it = node.begin(); it != node.end(); ++it) {
    string key = it->first;
    if (key == string("destinations")) {
      boost::property_tree::ptree destinationsNode = it->second;
      for (boost::property_tree::ptree::const_iterator it2 = destinationsNode.begin(); it2 != destinationsNode.end(); ++it2) {
        sendRequest->destinations.push_back(nodeToDestination(it2->second));
      }
    }
    else if (key == string("paymentId")) sendRequest->paymentId = it->second.data();
    else if (key == string("priority")) throw runtime_error("deserializeSendRequest() paymentId not implemented");
    else if (key == string("mixin")) sendRequest->mixin = it->second.get_value<uint32_t>();
    else if (key == string("ringSize")) sendRequest->ringSize = it->second.get_value<uint32_t>();
    else if (key == string("fee")) sendRequest->fee = it->second.get_value<uint64_t>();
    else if (key == string("accountIndex")) sendRequest->accountIndex = it->second.get_value<uint32_t>();
    else if (key == string("subaddressIndices")) for (boost::property_tree::ptree::const_iterator it2 = it->second.begin(); it2 != it->second.end(); ++it2) sendRequest->subaddressIndices.push_back(it2->second.get_value<uint32_t>());
    else if (key == string("unlockTime")) sendRequest->unlockTime = it->second.get_value<uint64_t>();
    else if (key == string("canSplit")) sendRequest->canSplit = it->second.get_value<bool>();
    else if (key == string("doNotRelay")) sendRequest->doNotRelay = it->second.get_value<bool>();
    else if (key == string("note")) sendRequest->note = it->second.data();
    else if (key == string("recipientName")) sendRequest->recipientName = it->second.data();
    else if (key == string("belowAmount")) sendRequest->belowAmount = it->second.get_value<uint64_t>();
    else if (key == string("sweepEachSubaddress")) sendRequest->sweepEachSubaddress = it->second.get_value<bool>();
    else if (key == string("keyImage")) sendRequest->keyImage = it->second.data();
  }

  return sendRequest;
}

vector<shared_ptr<monero_key_image>> monero_utils::deserializeKeyImages(const string& keyImagesJson) {

  // deserialize json to property node
  std::istringstream iss = keyImagesJson.empty() ? std::istringstream() : std::istringstream(keyImagesJson);
  boost::property_tree::ptree node;
  boost::property_tree::read_json(iss, node);

  // convert property tree to key images
  vector<shared_ptr<monero_key_image>> keyImages;
  for (boost::property_tree::ptree::const_iterator it = node.begin(); it != node.end(); ++it) {
    string key = it->first;
    if (key == string("keyImages")) {
      for (boost::property_tree::ptree::const_iterator it2 = it->second.begin(); it2 != it->second.end(); ++it2) {
        keyImages.push_back(nodeToKeyImage(it2->second));
      }
    }
    else MWARNING("WARNING MoneroWalletJni::deserializeKeyImages() unrecognized key: " << key);
  }
  return keyImages;
}

string monero_utils::serialize(const boost::property_tree::ptree& node) {
  std::stringstream ss;
  boost::property_tree::write_json(ss, node, false);
  string str = ss.str();
  return str.substr(0, str.size() - 1); // strip newline
}

boost::property_tree::ptree monero_utils::to_property_tree(const vector<string>& strs) {
  boost::property_tree::ptree strsNode;
  for (const auto& str : strs)  {
    boost::property_tree::ptree strNode;
    strNode.put("", str);
    strsNode.push_back(std::make_pair("", strNode));
  }
  return strsNode;
}

boost::property_tree::ptree monero_utils::to_property_tree(const vector<uint8_t>& nums) {
  boost::property_tree::ptree numsNode;
  for (const auto& num : nums)  {
    boost::property_tree::ptree numNode;
    numNode.put("", num);
    numsNode.push_back(std::make_pair("", numNode));
  }
  return numsNode;
}

// TODO: remove these redundant implementations for different sizes?
boost::property_tree::ptree monero_utils::to_property_tree(const vector<uint32_t>& nums) {
  boost::property_tree::ptree numsNode;
  for (const auto& num : nums)  {
    boost::property_tree::ptree numNode;
    numNode.put("", num);
    numsNode.push_back(std::make_pair("", numNode));
  }
  return numsNode;
}

boost::property_tree::ptree monero_utils::to_property_tree(const vector<uint64_t>& nums) {
  boost::property_tree::ptree numsNode;
  for (const auto& num : nums)  {
    boost::property_tree::ptree numNode;
    numNode.put("", num);
    numsNode.push_back(std::make_pair("", numNode));
  }
  return numsNode;
}

shared_ptr<monero_block> monero_utils::cnBlockToBlock(const cryptonote::block& cnBlock) {
  cryptonote::block temp = cnBlock;
  cout << cryptonote::obj_to_json_str(temp) << endl;
  shared_ptr<monero_block> block = make_shared<monero_block>();
  block->majorVersion = cnBlock.major_version;
  block->minorVersion = cnBlock.minor_version;
  block->timestamp = cnBlock.timestamp;
  block->prevId = epee::string_tools::pod_to_hex(cnBlock.prev_id);
  block->nonce = cnBlock.nonce;
  block->minerTx = monero_utils::cnTxToTx(cnBlock.miner_tx);
  for (const crypto::hash& txHash : cnBlock.tx_hashes) {
    block->txIds.push_back(epee::string_tools::pod_to_hex(txHash));
  }
  return block;
}

shared_ptr<monero_tx> monero_utils::cnTxToTx(const cryptonote::transaction& cnTx, bool initAsTxWallet) {
  shared_ptr<monero_tx> tx = initAsTxWallet ? make_shared<monero_tx_wallet>() : make_shared<monero_tx>();
  tx->version = cnTx.version;
  tx->unlockTime = cnTx.unlock_time;
  tx->id = epee::string_tools::pod_to_hex(cnTx.hash);
  tx->extra = cnTx.extra;

  // init vins
  for (const txin_v& cnVin : cnTx.vin) {
    if (cnVin.which() != 0 && cnVin.which() != 3) throw runtime_error("Unsupported variant type");
    if (tx->isMinerTx == boost::none) tx->isMinerTx = cnVin.which() == 0;
    if (cnVin.which() != 3) continue; // only process txin_to_key of variant  TODO: support other types, like 0 "gen" which is miner tx?
    shared_ptr<monero_output> vin = initAsTxWallet ? make_shared<monero_output_wallet>() : make_shared<monero_output>();
    vin->tx = tx;
    tx->vins.push_back(vin);
    const txin_to_key& txin = boost::get<txin_to_key>(cnVin);
    vin->amount = txin.amount;
    vin->ringOutputIndices = txin.key_offsets;
    crypto::key_image cnKeyImage = txin.k_image;
    vin->keyImage = make_shared<monero_key_image>();
    vin->keyImage.get()->hex = epee::string_tools::pod_to_hex(cnKeyImage);
  }

  // init vouts
  for (const tx_out& cnVout : cnTx.vout) {
    shared_ptr<monero_output> vout = initAsTxWallet ? make_shared<monero_output_wallet>() : make_shared<monero_output>();
    vout->tx = tx;
    tx->vouts.push_back(vout);
    vout->amount = cnVout.amount;
    const crypto::public_key& cnStealthPublicKey = boost::get<txout_to_key>(cnVout.target).key;
    vout->stealthPublicKey = epee::string_tools::pod_to_hex(cnStealthPublicKey);
  }

  return tx;

  // TODO: finish this, cryptonote::transaction has:
//  std::vector<std::vector<crypto::signature> > signatures;
//  rct::rctSig rct_signatures;
//  mutable size_t blob_size;
}