/**
 * Created by Gus on 11/20/2014.
 */
var redis=require('redis');
client = redis.createClient();
var mongoose = require('mongoose');

function bruteForceProtect(userObject){
   var user=userObject._doc.local
    var securityOption = mongoose.model("securityOptions");

    securityOption.find({},function(err, comments) {
        console.log(comments);
        var timeout=((comments[0])._doc.securityOption);
        client.get(user.email, function (err, reply) {

            console.log("get: "+reply);

            if(reply!=null){
                var currentCounter=parseInt(reply);
                if(currentCounter<parseInt(timeout.timeout)){
                    console.log("set counter:" + currentCounter++);
                    client.set(user.email, currentCounter++, function (err, reply) {

                        console.log("set:" +reply.toString());

                    });
                    client.expire(user.email,60*parseInt(timeout.timeframe));

                }
                else{
                    userObject=updateLock(userObject);
                    var unlockedTime=new Date();
                    unlockedTime.setMinutes(unlockedTime.getMinutes()+parseInt(timeout.timeout));
                    userObject._doc.local.tempLocked=unlockedTime;
                    userObject.markModified('local');

                      var res=  userObject.save(function (err, data) {
                            if (err) console.log(err);
                            else console.log('Saved : ', data );
                        });
                    console.log("saved result"+res);
                }
            }
                else{
                console.log("set counter:" + '1');
                client.set(user.email, '1', function (err, reply) {

                    console.log("set:" +reply.toString());

                });
                client.expire(user.email,600)
            }
        }
        );


// Get a value

        client.get(user.email, function (err, reply) {

            console.log("get: "+reply);

        });






    });

}


function manageLock(user){
var unlockedTime=new Date(user._doc.local.tempLocked);
console.log(user._doc.local.tempLocked);
    var test=unlockedTime.getTime();
    var test2=new Date().getTime();
    if(unlockedTime.getTime()<new Date().getTime()){
        user._doc.local.tempLocked='';
        user._doc.local.locked='';
        user.markModified('local');

        user.save(function (err, data) {
            if (err) console.log(err);
            else console.log('Saved : ', data );
        });
        return true;
    }
    else{
        return false
    }


}


function updateLock(user,maxAttempt){
    var currentLock=user._doc.local.locked;
    if(currentLock==''){
        user._doc.local.locked=1;
    }
    else if(currentLock=='T'){
        //should check for the lock before but for now it w0ill work
    }
    else if(parseInt(currentLock)+1==maxAttempt){
        user._doc.local.locked='T';
    }
    else{
        user._doc.local.locked=parseInt(currentLock)+1;

    }
    return user;
}

exports.bruteForceProtect=bruteForceProtect;
exports.manageLock=manageLock;