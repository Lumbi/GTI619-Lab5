// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var cryoto=require('crypto');

// define the schema for our user model
var userSchema = mongoose.Schema({

    local            : {
        email        : String,
        password     : String,
        group        : String,
        salt         : String,
    },
    facebook         : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    twitter          : {
        id           : String,
        token        : String,
        displayName  : String,
        username     : String
    },
    google           : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    }

});

// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
  var hashedPassword= createHash(password,this.local.salt);
    console.log(this.local.salt);

    return hashedPassword==this.local.password;
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);

function createHash(password,salt){
  var hash=password;
    var numberOfPass=3;
    for(var index=0;index<numberOfPass;index++){
        var hasher=cryoto.createHash('sha256')
        var saltedPassword=salt+hash;
            hasher.update(saltedPassword);
        hash=hasher.digest('hex');

    }
    console.log(hash)

    return hash;
}