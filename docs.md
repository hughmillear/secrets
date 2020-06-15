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

## Level 5

- Cookies and Session
  - Session cookies relate only to the current user session on the site.
- Passport is a popular library for Node
- Not great documentation...
- Remember that MongoDB doesn't care about the schema!
  - Hashes and salts are not part of the model, but are part of the document saved. Username and passowrd can't be required, as they aren't always filled on MongoDB document creation.
