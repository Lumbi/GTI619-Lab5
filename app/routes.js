var mongoose = require('mongoose');
var adminUpdate=require('../app/utility/adminUpdate');
var gridcard=require('../app/utility/gridCardManager')

var mongoose = require('mongoose');
var url = require('url');

module.exports = function(app, passport) {
    var bodyParser = require('body-parser')
    var adminUpdate=require('../app/utility/adminUpdate');
    app.use( bodyParser.json() );
// ROUTES NORMALES ===============================================================

	// HOME =========================
	app.get('/', function(req, res) {
		res.render('index.ejs');
	});




    app.get('/circle', isLoggedIn, function(req, res) {
        if(!twoFactor(req)){
            res.redirect('/logout');
            return;
        }

        if(req.user.local.group=="Admin"||req.user.local.group=="Circle")
        {
            res.render('circle.ejs', {
                user : req.user
            });
        }
    });

    app.get('/square', isLoggedIn, function(req, res) {
        if(!twoFactor(req)){
            res.redirect('/logout');
            return;
        }

        if(req.user.local.group=="Admin"||req.user.local.group=="Square")
        {
            res.render('square.ejs', {
                user : req.user
            });
        }
    });





    // PROFIL =========================
	app.get('/profile', isLoggedIn, function(req, res) {
        req.user.local.locked='';
        var profileToRender=choseProfile(req.user.local.group)
            if(!twoFactor(req)){
                res.redirect('/logout');
                return;
            }

        if(req.user.local.group=="Admin")
        {
	        var securityOptions = mongoose.model("securityOptions");
    	    securityOptions.find({},function(err, result) {
    	    	console.log(result);
    	    	console.log(result[0].securityOption);
		        res.render(profileToRender, {
					user : req.user,
					security : result[0].securityOption
				});
        	});
        }else{
	        res.render(profileToRender, {
				user : req.user
			});
        }
	});

	// LOGOUT ==============================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	// ADMIN ==============================
	app.post('/profile/admin-update',isLoggedIn, function(req, res) {
		console.log("request: "+ JSON.stringify(req.body.security))
        console.log("dfe"+req.user.local.group)
        if(!twoFactor(req)){
            res.redirect('/logout');
            return;
        }

        if(req.user.local.group=="Admin"){
            adminUpdate.updateSecurityOptions(req.body.security,res);

		}else{
			res.redirect('/profile');
		}
	});

	// ADMIN-USERS =============================
	app.get('/profile/admin-users',isLoggedIn, function(req,res){
        if(!twoFactor(req)){
            res.redirect('/logout');
            return;
        }


        if(req.user.local.group=="Admin"){

			if(req.query.id == undefined)
			{
				var users = mongoose.model("User");
				users.find({}, function(err, result){
					res.render("admin-users.ejs",
						{
							users : result
						});
				});
			}else{
				var users = mongoose.model("User");
				users.findOne({_id : req.query.id },function(err, result){
					res.render("admin-user.ejs", {
						user : result
					});
				});
			}

		}else{
			res.redirect('/');
		}
	});

	// ADMIN UNLOCK ================================
	app.get('/admin/unlock',isLoggedIn, function(req, res){
        if(!twoFactor(req)){
            res.redirect('/logout');
            return;
        }
        if(req.user.local.group=="Admin"){

			if(req.query.id != undefined){
				var users = mongoose.model("User");

				users.findById(req.query.id, function(err, result){
					if(err){
						console.warn(err.message);
					}else{
						result.local.locked = '';
                        result.local.tempLocked='';
						result.save(function(err2, result2)
						{
							if(err2){
								console.warn(err.message);
							}
							res.redirect("/profile/admin-users");
						});
					}
				});
			}else{
				res.redirect("/profile/admin-users");
			}

		}else{
			res.redirect('/');
		}
	});

	// ADMIN GENERATION DE MOT DE PASSE ===========
	app.get('/admin/generatepw', function(req, res){
		if(req.user.local.group=="Admin"){

			if(req.query.id != undefined)
			{
				require('crypto').randomBytes(8, function(ex, buf) {
	  				var nouveauMotDePasse = buf.toString('hex');
	  				//TODO: mettre à jour le mot de passe de l'utilisateur (avec Passport?)
				});

			}else{
				res.redirect("/profile/admin-users");
			}
			
		}else{
			res.redirect('/');
		}
	});

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

	// LOGIN - GET ============================
	app.get('/login', function(req, res) {
		res.render('login.ejs', { message: req.flash('loginMessage') });
	});

	// LOGIN - POST ===========================
	app.post('/login', passport.authenticate('local-login', {
		successRedirect : '/gridcard', // redirect to the secure profile section
		failureRedirect : '/login', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

    app.get('/gridcard',isLoggedIn, function(req, res) {
        //var test=req.cookies;
        //console.log("user "+req.user.local.email);
        gridcard.getQuestion(req.cookies,req.user,res);




    });
    app.post('/gridcard',isLoggedIn, function(req, res) {
        console.log(req.body.answer)
        gridcard.validateAnswer(req.cookies,req.body.answer,req,res);

    });

	// SIGNUP - GET ==============================
	app.get('/signup', function(req, res) {
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

	// SIGNUP - POST ==============================
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

// =============================================================================
// AUTHORISATON (pour utilisateur déjà connecté) =============
// =============================================================================

	app.get('/connect/local', function(req, res) {
		res.render('connect-local.ejs', { message: req.flash('loginMessage') });
	});
	app.post('/connect/local', passport.authenticate('local-signup', {
		successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// Supprime le token d'identification

	app.get('/unlink/local', isLoggedIn, function(req, res) {
		var user            = req.user;
		user.local.email    = undefined;
		user.local.password = undefined;
		user.save(function(err) {
			res.redirect('/profile');
		});
	});
};




function isLoggedIn(req, res, next) {


    if (req.isAuthenticated()&&inactivityMonitor(req))
		return next();

	res.redirect('/');
}

function choseProfile(group){
       var page;
    switch(group)
    {
        case "Admin":
           page="admin.ejs";
            break;
        case "Square":
            page="square.ejs";
            break;
        case "Circle":
            page="circle.ejs";
            break;
         default :
            page="error.ejs";
            break;
    }

return page;
}


function twoFactor(req){
    if(req.session.twofactor==true){
        return true;
    }
    else{
        return false;
    }
}

function inactivityMonitor(req){
    var lastActivity=req.session.lastRequest;
    var timeout=req.session.inactivityTime
    var temp=(new Date())


    var lastActivityTime=new Date(parseInt(lastActivity));
    var as=lastActivityTime.getMinutes()+parseInt(timeout);
    lastActivityTime.setMinutes(lastActivityTime.getMinutes()+parseInt(timeout));
    var temp2=lastActivityTime.getTime();
    if(lastActivityTime < new Date()){
        console.log('time out exceeded')
        return false;
    }
    else{
        req.session.lastRequest=new Date().getTime();
        return true;
    }

}