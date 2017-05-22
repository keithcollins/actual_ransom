# actual_ransom
A Twitter bot that watches bitcoin wallets tied to the #WannaCry ransomware attack

[@actual_ransom](https://twitter.com/actual_ransom)

Data in `tx.json` is as of 2017-05-21 at 8:00 p.m. EDT.

The fields in tx.json are:
address - the address of the wallet the payment went to
tx_hash - the unique identified of the payment transaction
val_satoshi - the value of the payment in satoshi, kind of like the pennies of bitcoin
val_btc - the value of the payment in bitcoin
unix_time - timestamp

See also: [pi-bots](https://twitter.com/pi-bots), a simple system for running Twitter bots from your Raspberry Pi.

More details:

All of the people hit in the widespread WannaCry ransomware attack last week were asked to send their ransom payments to one of just three bitcoin addresses. It was an unusual move; it makes more sense for ransomware to use a unique bitcoin address for each computer it infects, so the hackers know who paid what. But using just three addresses made it easy to watch the three wallets associated with those addresses, because all bitcoin wallets are public.

That meant anyone could watch the incoming ransom payments in real time. I made this twitter bot to tweet when new ransom payments hit any of the three wallets, [@actual_ransom](https://twitter.com/actual_ransom). While it monitored the wallets, it also collected data on each transaction.

[More on the data](https://qz.com/986094/wannacry-ransomware-attacks-victims-have-stopped-paying-the-ransom/)

[More on the attack](https://qz.com/985093/inside-the-digital-heist-that-terrorized-the-world-and-made-less-than-100k/)
