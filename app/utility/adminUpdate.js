/**
 * Created by Gus on 11/20/2014.
 */
var mongoose = require('mongoose');
function updateSecurityOptions(req,res){
 var securityOption = mongoose.model("securityOptions");
    securityOption.find({},function(err, result) {
        var a=req;
        var oldSecuritySetting = ((result[0])._doc.securityOption);
        var newSecuritySetting=validateData(req,oldSecuritySetting);
        result[0]._doc.securityOption=newSecuritySetting;
        result[0].markModified('securityOption');
            result[0].save(function (err, data) {
            if (err) console.log(err);
            else{
                res.redirect('/profile');
            }
        });

    });










}

exports.updateSecurityOptions=updateSecurityOptions;

function validateData(req,securityModel){

    if(parseInt(req.maxpwtries)!=NaN&&req.maxpwtries!=''){
    securityModel.numberOfTry=req.maxpwtries;
    }

    if(parseInt(req.authdelay)!=NaN&&req.authdelay!=''){
        securityModel.authdelay=req.authdelay;
    }

    return securityModel;
}