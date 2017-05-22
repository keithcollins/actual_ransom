# actual_ransom
A Twitter bot that watches bitcoin wallets tied to the WannaCry ransomware attack

[@actual_ransom](https://twitter.com/actual_ransom)

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

See also: [pi-bots](https://github.com/keithcollins/pi-bots), a simple system for running Twitter bots from your Raspberry Pi.

More details:

All of the people hit in the widespread WannaCry ransomware attack last week were asked to send their ransom payments to one of just three bitcoin addresses. It was an unusual move; it makes more sense for ransomware to use a unique bitcoin address for each computer it infects, so the hackers know who paid what. But using just three addresses made it easy to watch the three wallets associated with those addresses, because all bitcoin wallets are public.

That meant anyone could watch the incoming ransom payments in real time. I made this twitter bot to tweet when new ransom payments hit any of the three wallets, [@actual_ransom](https://twitter.com/actual_ransom). While it monitored the wallets, it also collected data on each transaction.

[More on the data](https://qz.com/986094/wannacry-ransomware-attacks-victims-have-stopped-paying-the-ransom/)

[More on the attack](https://qz.com/985093/inside-the-digital-heist-that-terrorized-the-world-and-made-less-than-100k/)
