var fs = require('fs');
var request = require("request");
var d3 = require('d3');
var queue = require('queue-async');
var sb = require('satoshi-bitcoin');

// the bitcoin addresses associated with wcrypt
var addresses = [
  "115p7UMMngoj1pMvkpHijcRdfJNXj6LrLn",
  "12t9YDPgwueZ9NyMgw519p7AA8isjr6SMw",
  "13AM4VW2dhxYgXeQepoHkHSQuy6NgaEb94"
];

// load saved transactions
var transactions = JSON.parse(fs.readFileSync(__dirname+"/tx.json", 'utf8'));

// get current combined total of all three wallets in BTC
var current_total = getTotalBTC(transactions);

// to keep new txs separate from current until later
var new_transactions = [];

// for number formatting
var addCommas = d3.format("0,000");

// create queue
var q = queue(3);

// defer API calls for each address to check for new payments
for (var i = 0; i < addresses.length; i++) {
  q.defer(checkWallets, i);
}

// when all is done
q.await(function(e,d){
  // tweet new transactions
  if (new_transactions.length > 0) {
    // to add new txs to total if new incoming tx
    var new_total_satoshi = sb.toSatoshi(current_total);
    new_transactions.forEach(function(tx){
      // merge in new transaction
      transactions.push(tx);
      var val_satoshi = Math.abs(tx.val_satoshi);
      // get current USD value
      getUSDRate(function(rate){
        var usd = (sb.toBitcoin(val_satoshi)*rate).toFixed(2);
        if (tx.val_satoshi < 0) {
          // outgoing transaction
          var str = "🚨 "+sb.toBitcoin(val_satoshi)+" BTC ($"+addCommas(usd)+" USD) has just been withdrawn from a bitcoin wallet tied to #wcry ransomware. https://blockchain.info/address/"+tx.address;
          doTweet(str);
        } else if (tx.val_satoshi > 0) {
          // incoming transaction
          new_total_satoshi += val_satoshi;
          var new_usd = (sb.toBitcoin(new_total_satoshi)*rate).toFixed(2);
          var str = "New payment:\n"
          str += +sb.toBitcoin(val_satoshi)+" BTC ($"+addCommas(usd)+")\n";
          str += "https://blockchain.info/address/"+tx.address+"\n";
          str += "Combined total of #WannaCry bitcoin wallets:\n";
          str += sb.toBitcoin(new_total_satoshi)+" BTC ($"+addCommas(new_usd)+")";
          doTweet(str);

          // this was used before payments mostly stopped
          // var str = "Someone just paid "+sb.toBitcoin(val_satoshi)+" BTC ($"+addCommas(usd)+" USD) to a bitcoin wallet tied to #wcry ransomware. https://blockchain.info/address/"+tx.address;
        }
      });
    });
    // save new transactions
    fs.writeFileSync(__dirname+"/tx.json", JSON.stringify(transactions), 'utf8');
  }
  // check and tweet current totals if 'check' argument was used
  if (process.argv[2] == "check") {
    // get new combined total of all three wallets in BTC
    var latest_total = getTotalBTC(transactions);
    getUSDRate(function(rate){
      var usd = (latest_total*rate).toFixed(2);
      var str = "The three bitcoin wallets tied to #WannaCry ransomware have received "+transactions.length+" payments totaling "+getTotalBTC(transactions)+" BTC ($"+addCommas(usd)+" USD).";
      doTweet(str);
    });
  }
});

// do blockchain API call
function checkWallets(i,cb) {
  request({url:"https://blockchain.info/rawaddr/"+addresses[i],json: true},function (e, r, body) {
    if (!e && r.statusCode === 200) {
      // loop through all of this wallet's transactions
      body.txs.forEach(function(tx){
        // have we already saved this transaction to transactions?
        if (transactions.filter(function(d) { return d.tx_hash == tx.hash; }).length == 0) {
          // we have not, so it's new
          // check if this is a withdraw by looking at inputs
          var outgoing_satoshi = d3.sum(tx.inputs, function(input){
            // if the input address matches this wallet, add it to sum
            if (input.prev_out.addr == addresses[i]) {
              return +input.prev_out.value;
            }
          });
          // which way is this transaction going
          var from_addresses = [];
          var val_satoshi = 0;
          if (outgoing_satoshi > 0) {
            // it's a withdraw/ outgoing btc
            val_satoshi = -outgoing_satoshi;
          } else {
            // this is a new payment
            // search outs array for address matching this wallet
            // there should only be one, and its value = value of new payment
            val_satoshi = tx.out.filter(function(d){
              return d.addr == addresses[i];
            })[0].value;
            // since it's incoming, collect the
            // addresses it's coming from
            tx.inputs.forEach(function(input){
              from_addresses.push(input.prev_out.addr);
            });
          }
          // save new transaction to array
          new_transactions.push({
            address_to: addresses[i],
            addresses_from: from_addresses.join("|"),
            num_addresses_from: from_addresses.length,
            tx_hash: tx.hash,
            val_satoshi: val_satoshi,
            val_btc: sb.toBitcoin(val_satoshi),
            unix_time: tx.time
          });
        }
      });
      cb(null);
    }
  });
}

function getUSDRate(cb) {
  request({url: "http://api.coindesk.com/v1/bpi/currentprice.json",json: true},function (e, r, body) {
    if (!e && r.statusCode === 200) {
      cb(+body.bpi.USD.rate_float);
    }
  });
}

function getTotalBTC(transactions) {
  // get total payments in satoshi
  var total_satoshi = d3.sum(transactions,function(d){ return +d.val_satoshi });
  // convert sotashi to btc
  return sb.toBitcoin(total_satoshi);
}

function doTweet(str) {
  // here's the string we've come up with to tweet.
  // to get it out, implement the twitter API however you'd like
  console.log(str);
}
