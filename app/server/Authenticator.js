var passport = require('passport');
var PassportLocalStrategy   = require('passport-local').Strategy;


var Authenticator = class {
    constructor(app, dbManager){
        app.use(passport.initialize());
        app.use(passport.session());
        
        passport.serializeUser(function(user, done) {
            done(null, user.id);
        });

        passport.deserializeUser(function(id, done) {
            dbManager.Account.findById(id, function(err, user) {
                done(err, user);
            });
        });

        passport.use('local-createAccount', new PassportLocalStrategy({
                usernameField : 'usrname',
                passwordField : 'password',
                passReqToCallback : true
            },
            function(req, usrname, password, done) {
                process.nextTick(function() {
                    dbManager.Account.findOne({ 'usrname' :  usrname }, function(err, user) {

                        if (err)
                            return done(err);

                        if (user) {
                            return done(null, false);
                        } else {
                            var newAccount  = new dbManager.Account();
                            newAccount.usrname    = usrname;
                            newAccount.password = newAccount.generateHash(password);
                            newAccount.score = 0;

                            newAccount.save(function(err) {
                                if (err)
                                    throw err;
                                return done(null, newAccount);
                            });
                            
                            req.session.usrname = usrname;
                        }
                    });
                });
            }
        ));

        passport.use('local-login', new PassportLocalStrategy({
            usernameField : 'usrname',
            passwordField : 'password',
            passReqToCallback : true
        },
        function(req, usrname, password, done) {
            dbManager.Account.findOne({ 'usrname' :  usrname }, function(err, user) {

                if (err)
                    return done(err);

                if (!user)
                    return done(null, false);

                if (!user.validPassword(password))
                    return done(null, false);
                
                req.session.usrname = usrname;

                return done(null, user);
            });

        }));
    }
    
    static isLoggedIn (req, res, next) {
        if (req.isAuthenticated())
            return next();

        res.redirect('/');
    }
    
    static authSocket(socket){
        var usrname = socket.request.session.usrname;
        if (!usrname || usrname == "") {
            return false;
        }
        return true;
    }
}

module.exports = Authenticator;