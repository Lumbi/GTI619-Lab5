/**
 * Created by Gus on 11/15/2014.
 */
/**
 * Created by Gus on 11/14/2014.
 */
// load the things we need
var mongoose = require('mongoose');
var userSchema = mongoose.Schema({

    securityOption            : {
        securitySetting       : String,
        passwordLength        : String,
        complexity            : String,
        numberOfTry           : String,
        timeout               : String,
       timeframe              : String,
       enableBruteForceProtection : String,
       enableDenyAfterSecondAttempt : String,
       authdelay : String,
        inactivityTime: String
    }

});



mongoose.model('securityOptions', userSchema).prototype.test=function(secObj){

    var Comments = mongoose.model("securityOptions");
    var test;
    Comments.find({},function(err, comments) {
       // console.log(comments);
       test=comments[0];

    });


}

module.exports= mongoose.model('securityOptions', userSchema);

