var adminUpdate=require('../app/utility/adminUpdate');
module.exports = function(app, passport) {
    var bodyParser = require('body-parser')

    app.use( bodyParser.json() );
// ROUTES NORMALES ===============================================================

	// HOME =========================
	app.get('/', function(req, res) {
		res.render('index.ejs');
	});

	// PROFIL =========================
	app.get('/profile', isLoggedIn, function(req, res) {
            var profileToRender=choseProfile(req.user.local.group)
        res.render(profileToRender, {
			user : req.user
		});
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
        if(req.user.local.group=="Admin"){
            adminUpdate.updateSecurityOptions(req.body.security,res);

			
		}else{
			res.redirect('/profile');
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
		successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/login', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

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
	if (req.isAuthenticated())
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