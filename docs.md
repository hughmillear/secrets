# Authentication

## Level 1

- Email
- Password

Plaintext password in database.

## Level 2

- Encryption - use encryption on password field in the database.

## Level 3

- Hashing - starting with MD5

## Level 4

- Hashing & Salting
  - Resulting hash comes from both input string and salt value
  - Store unique salt in database
  - bcrypt is 17k/sec on GPU, MD5 is 20B/sec
  - Can also enable multiple salt rounds
  - Salt rounds are str+salt->hash, then do hash+salt->hash2 'n' number of times
