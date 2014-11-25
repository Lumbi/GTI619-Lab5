var LocalStrategy    = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User       = require('../app/models/user');
var Log        =require('../app/models/log');
var SecurityOption        =require('../app/models/securityOption');

var bruteForceHandler=require('../app/utility/bruteForceHandler');

var configAuth = require('./auth');

module.exports = function(passport) {

    // =========================================================================
    // Setup de session avec Passport ==========================================
    // =========================================================================

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            console.log(JSON.stringify(user));
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function(req, email, password, done) {
        if (email)
            email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching

        // asynchronous
        process.nextTick(function() {
            User.findOne({ 'local.email' :  email }, function(err, user) {
                // if there are any errors, return the error
                if (err)
                    return done(err);

                // if no user is found, return the message
                if (!user){

                    var userLog= new Log();
                    userLog.log.result='Connection Failed : User does not exist';
                    userLog.log.user=email;
                    userLog.log.time=new Date();
                    userLog.save(function (err, data) {
                        if (err) console.log(err);
                        else console.log('Saved : ', data );
                    });


                    return done(null, false, req.flash('loginMessage', 'No user found.'));
                }


                if (user.isLockedFinal()||!user.validPassword(password)||!validateTempLockedOver(user)){
                    var test=new SecurityOption();
                   bruteForceHandler.bruteForceProtect(user);
                    var userLog= new Log();
                    userLog.log.result='Connection Failed : Wrong password';
                    userLog.log.user=email;
                    userLog.log.time=new Date();
                    userLog.save(function (err, data) {
                        if (err) console.log(err);
                        else console.log('Saved : ', data );
                    });
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
                }


                // all is well, return user
                else{
                    console.log('Loading security')



                    var userLog= new Log();
                    userLog.log.result='Connection Succesfull';
                    userLog.log.user=email;
                    userLog.log.time=new Date();
                    req.session.lastRequest=new Date().getTime();
                    userLog.save(function (err, data) {
                        if (err) console.log(err);
                        else console.log('Saved : ', data );
                    });
                    var securityOptions = mongoose.model("securityOptions");
                    securityOptions.find({},function(err, result) {
                        console.log(result);
                        var inactivityTime=result[0].securityOption.inactivityTime;
                        req.session.inactivityTime=inactivityTime;
                        return done(null, user);
                    });


                }

            });
        });

    }));

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    passport.use('local-signup', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
    },
    function(req, email, password, done) {
        if (email)
            email = email.toLowerCase();

        process.nextTick(function() {
            // utilisateur déjà connecté
            if (!req.user) {
                User.findOne({ 'local.email' :  email }, function(err, user) {
                    if (err)
                        return done(err);

                    // valid l'email
                    if (user) {
                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                    } else {

                        // nouveau user
                        var newUser            = new User();

                        newUser.local.email    = email;
                        newUser.local.password = newUser.generateHash(password);

                        newUser.save(function(err) {
                            if (err)
                                return done(err);

                            return done(null, newUser);
                        });
                    }

                });
            // si l'utilisateur est connecté, mais qu'il n'a pas de compte
            } else if ( !req.user.local.email ) {
                User.findOne({ 'local.email' :  email }, function(err, user) {
                    if (err)
                        return done(err);
                    
                    if (user) {
                        return done(null, false, req.flash('loginMessage', 'That email is already taken.'));
                    } else {
                        var user = req.user;
                        user.local.email = email;
                        user.local.password = user.generateHash(password);
                        user.save(function (err) {
                            if (err)
                                return done(err);
                            
                            return done(null,user);
                        });
                    }
                });
            } else {
                return done(null, req.user);
            }

        });
    }));

};

function validateTempLockedOver(user){
    if(user._doc.local.tempLocked!=''){
        return  bruteForceHandler.manageLock(user)
    }
    else{
        return true
    }
}