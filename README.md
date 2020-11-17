# Lab 7: Database Security
### Authors 
FAF-181
[Alexandr Calugari](https://github.com/afishr)
[Turcanu Iuliana](https://github.com/Julinia)

### Tasks:
 
1. Create a MongoDB database which would contain some secured sensitive data (protected
via 2-way encryption);
2. Create an application which would display the data contained in the database (both
common data and the decrypted sensitive data);
3. Make sure that the sensitive data can only be accessed via your application (i.e. it is
secure).

### How to start project

1. Download Mongo Shell 
2. Create Mongo Atlas Cluster
3. Connect Mongo Shell to Mongo Atlas with this command line: 
 ```
 $ mongodb+srv://cluster0.3nicw.mongodb.net/<dbname>" --username admin
```
4. In order to start the database you should type this command line: 
```
$ mongo --nodb --shell index.js
```
