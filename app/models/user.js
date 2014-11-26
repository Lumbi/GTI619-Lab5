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
        tempLocked   : String,
        locked       : String,
        gridcard     : String,
    }

});

// non utilisé
// userSchema.methods.generateHash = function(password) {
    // return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
// };

// completement suspendu
userSchema.methods.isLockedFinal = function() {

console.log("lock :"+ this.local.locked);
    var a= this.local.locked=='T';
    return a;
};

userSchema.methods.createHash = function(password,salt){
  var hash=password;
    var numberOfPass=3;
    for(var index=0;index<numberOfPass;index++){
        var hasher=cryoto.createHash('sha256')
        var saltedPassword=salt+hash;
            hasher.update(saltedPassword);
        hash=hasher.digest('hex');

    }
    return hash;
}

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    var hashedPassword= this.createHash(password,this.local.salt);
    return hashedPassword==this.local.password;
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);




