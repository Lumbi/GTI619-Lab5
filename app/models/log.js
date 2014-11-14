/**
 * Created by Gus on 11/14/2014.
 */
// load the things we need
var mongoose = require('mongoose');
var userSchema = mongoose.Schema({

    log            : {
        user        : String,
        result      : String,
        time        : String,

    }

});
module.exports= mongoose.model('Log', userSchema);