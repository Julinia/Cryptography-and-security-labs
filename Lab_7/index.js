var demoDB = "Cryptography"
var keyVaultColl = "__keystore"

const ENC_DETERM = 'AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic'
const ENC_RANDOM = 'AEAD_AES_256_CBC_HMAC_SHA_512-Random'

var env = {}
try {
   load( 'localkey_config.js' );
} catch (err) {
   print("Exiting: Unable to open local config file." );
   quit()
}

if (env.keyString == "PASTE GENERATED KEY STRING HERE"){
   print("\nPlease generate a new local key (see `localkey_config.js` file). Exiting. \n\n"); quit();
} 

var localDevMasterKey = { key: BinData( 0, env.keyString ) }

var clientSideOptions = {
    kmsProviders : {  local : localDevMasterKey  } ,
    schemaMap: {},
    keyVaultNamespace: demoDB + "." + keyVaultColl
};

encryptedSession = new Mongo(env.connStr, clientSideOptions);

db = encryptedSession.getDB( demoDB )

db.getCollectionNames().forEach(function(c){db.getCollection(c).drop()});

var keyVault = encryptedSession.getKeyVault();

keyVault.createKey("local", "", ["fieldKey1"])
keyVault.createKey("local", "", ["fieldKey2"])

var key1 = db.getCollection( keyVaultColl ).find({ keyAltNames: 'fieldKey1' }).toArray()[0]._id
var key2 = db.getCollection( keyVaultColl ).find({ keyAltNames: 'fieldKey2' }).toArray()[0]._id

db.createCollection("user")
db.runCommand({
   collMod: "user",
   validator: {
      $jsonSchema: {
         "bsonType": "object",
         "properties": {
            "ssn": {
               "encrypt": {
                  "bsonType": "string",
                  "algorithm": ENC_DETERM,
                  "keyId": [ key1 ]
               }
            },
            "dob": {
               "encrypt": {
                  "bsonType": "date",
                  "algorithm": ENC_RANDOM,
                  "keyId": [ key1 ]
               }
            },
         }
      }
   }
})

var userSchema = {
   "Cryptography.user": {
      "bsonType": "object",
      "properties": {
         "ssn": {
            "encrypt": {
               "bsonType": "string",
               "algorithm": ENC_DETERM,
               "keyId": [ key1 ]
            }
         },
         "dob": {
            "encrypt": {
               "bsonType": "date",
               "algorithm": ENC_RANDOM,
               "keyId": [ key1 ]
            }
         },
         "contact": {
            "bsonType": "object",
            "properties": {
               "email": {
                  "encrypt": {
                     "bsonType": "string",
                     "algorithm": ENC_DETERM,
                     "keyId": [ key2 ]
                  }
               },
               "mobile": {
                  "encrypt": {
                     "bsonType": "string",
                     "algorithm": ENC_DETERM,
                     "keyId": [ key2 ]
                  }
               }
            },
         },
      }
   }
}

var clientSideOptions = {
   kmsProviders: { local: localDevMasterKey },
   schemaMap: userSchema,
   keyVaultNamespace: demoDB + "." + keyVaultColl
}
var encryptedSession = new Mongo(env.connStr, clientSideOptions)
var db = encryptedSession.getDB( demoDB );

try{
  var res = null
  res = db.user.insert({
   firstName: 'Ion',
   lastName:  'Branza',
   ssn: db.getMongo().encrypt( key1 , "901-01-0002" , ENC_DETERM ),
   dob: db.getMongo().encrypt( key1 , new Date('1912-06-23'), ENC_RANDOM ),
   address: {
      street: 'Studentilor 7',
      city:   'Chisinau',
   },
   contact: {
      mobile: db.getMongo().encrypt( key2 , '060422346', ENC_DETERM ),
      email:  db.getMongo().encrypt( key2 , 'ionbranza@gmail.com', ENC_DETERM ),
   }
 })
} catch (err) {
   res = err
}

print("Decrypted collection: ")
var records = db.user.find().pretty()
while (records.hasNext()) {
   printjson(records.next());
}