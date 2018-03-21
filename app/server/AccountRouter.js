var express = require('express');
var passport = require('passport');

var AccountRouter = class {
    constructor(){
        this.router = express.Router();
        
        this.router.get('/login', function(req, res){
            res.render('login');
        });



        this.router.get('/create', function(req, res){
            res.render('createAccount');
        });

        this.router.post('/login', passport.authenticate('local-login', {
            successRedirect : '/game/mainpage',
            failureRedirect : '/account/login',
            failureFlash : false
        }));

        this.router.post('/create', passport.authenticate('local-createAccount', {
            successRedirect : '/game/mainpage',
            failureRedirect : '/account/create',
            failureFlash : false
        }));

        this.router.get('/logout', function(req, res){
            req.logout();
            res.redirect('/');
        });
    }
}

module.exports = AccountRouter;
