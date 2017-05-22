# actual_ransom
[@actual_ransom](https://twitter.com/actual_ransom) is a Twitter bot that watches bitcoin wallets tied to the WannaCry ransomware attack

Everyone whose computer was infected in the widespread WannaCry ransomware attack on May 12 was asked to send a ransom payment of $300 or more to one of three bitcoin addresses. Although they're anonymous, all wallets associated with bitcoin addresses are also public. Since there were only three wallets used in this attack, it was easy to watch them on sites like Blockchain.info as ransom payments came in. I made this twitter bot to tweet when new ransom payments hit any of the three wallets. While it monitored the wallets, it also collected data on each transaction.

The script is also setup to tweet if a withdraw is made from any of the wallets.

## Data

Data in `tx.json` is as of 2017-05-22 at 5:00 p.m. EDT.

The fields in tx.json are:
```
address_to - the address of the wallet the payment went to

addresses_from -the bitcoin address(es) the payment came from, separated by | if more than one

num_addresses_from - the number of addresses the payment came from (sometimes they come from more than one)

tx_hash - the unique identified of the payment transaction

val_satoshi - the value of the payment in satoshi, kind of like the pennies of bitcoin

val_btc - the value of the payment in bitcoin

unix_time - timestamp
```

The source of this data is the blockchain itself, via the [Blockchain.info API](https://blockchain.info/api).

## How to use

First, please don't make a clone of this bot. Obviously, the time to use this script has passed, and the original bot already exists. But it could be modified to tweet payments to other interesting accounts, or to collect data on particular wallets from Blockchain.info.

**Install**

`npm install`

**Run script**

`node actual_ransom.js`

**Run script and output total balance of all three wallets**

`node actual_ransom.js check`

## See also

[pi-bots](https://github.com/keithcollins/pi-bots), a simple system for running Twitter bots from your Raspberry Pi.

[More on the data](https://qz.com/986094/wannacry-ransomware-attacks-victims-have-stopped-paying-the-ransom/)

[More on the attack](https://qz.com/985093/inside-the-digital-heist-that-terrorized-the-world-and-made-less-than-100k/)
