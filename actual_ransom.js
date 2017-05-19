var fs = require('fs');
var request = require("request");
var d3 = require('d3');
var queue = require('queue-async');
var sb = require('satoshi-bitcoin');
var Twit = require('twit');

var T = new Twit({
  consumer_key: '',
  consumer_secret: '',
  access_token: '',
  access_token_secret: ''
});

// for number formatting
var addCommas = d3.format("0,000");

// create queue
var q = queue(3);

// the bitcoin addresses associated with wcrypt
var addresses = [
  "115p7UMMngoj1pMvkpHijcRdfJNXj6LrLn",
  "12t9YDPgwueZ9NyMgw519p7AA8isjr6SMw",
  "13AM4VW2dhxYgXeQepoHkHSQuy6NgaEb94"
];

// load saved transactions
var transactions = JSON.parse(fs.readFileSync(__dirname+"/tx.json", 'utf8'));

// get total payments in satoshi
var totalSatoshi = d3.sum(transactions,function(d){ return +d.val_satoshi });

// convert sotashit to btc
var totalPaid = sb.toBitcoin(totalSatoshi);

// convert total to USD, tweet if 'check' argument used
if (process.argv[2] == "check") {
  getPrice(totalPaid,function(usd){
    var str = "The three bitcoin wallets tied to #WannaCry ransomware have received "+transactions.length+" payments totaling "+totalPaid+" BTC ($"+addCommas(usd)+" USD).";
    doTweet(str);
  });
} else if (process.argv.length == 2) {
  // defer API calls for each address to check for new payments
  for (var i = 0; i < addresses.length; i++) {
    q.defer(checkWallets, i);
  }
}

// save any new transactions when all is done
q.await(function(e,d){
  fs.writeFileSync(__dirname+"/tx.json", JSON.stringify(transactions), 'utf8');
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
          var val_satoshi = d3.sum(tx.inputs, function(input){
            // if the input address matches this wallet, add it to sum
            if (input.prev_out.addr == addresses[i]) {
              return +input.prev_out.value;
            }
          });
          // if that got anything, it's a withdraw/ outgoing btc
          if (val_satoshi > 0) {
            var btc_sent = sb.toBitcoin(val_satoshi);
            // get price in USD and tweet
            getPrice(btc_sent,function(usd){
              var str = "🚨 "+btc_sent+" BTC ($"+addCommas(usd)+" USD) has just been withdrawn from a bitcoin wallet tied to #wcry ransomware. https://blockchain.info/address/"+addresses[i];
              doTweet(str);
            });
          } else {
            // it's not outgoing, so this is a new payment
            // search outs array for address matching this wallet
            // there should only be one, and its value = value of new payment
            val_satoshi = tx.out.filter(function(d){
              return d.addr == addresses[i];
            })[0].value;
            if (val_satoshi > 0) {
              // get price in USD and tweet
              getPrice(sb.toBitcoin(val_satoshi),function(usd){
                var str = "Someone just paid "+sb.toBitcoin(val_satoshi)+" BTC ($"+addCommas(usd)+" USD) to a bitcoin wallet tied to #wcry ransomware. https://blockchain.info/address/"+addresses[i];
                doTweet(str);
              });
            }
          }
          // save relevant data
          transactions.push({
            address: addresses[i],
            tx_hash: tx.hash,
            input: tx.inputs[0].prev_out.value,
            total_output: d3.sum(tx.out, function(d){ return +d.value }),
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

function getPrice(val_btc,cb) {
  request({url: "http://api.coindesk.com/v1/bpi/currentprice.json",json: true},function (e, r, body) {
    if (!e && r.statusCode === 200) {
      var current_rate = +body.bpi.USD.rate_float;
      var usd = val_btc*current_rate;
      cb(usd.toFixed(2));
    }
  });
}

function doTweet(str) {
  T.post('statuses/update', { status: str },function(error, data, response) {
    if (error) {
      console.log("btc",null,error);
    } else {
      console.log("btc",data.id_str,str);
    }
  });
}
