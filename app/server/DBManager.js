var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var DBManager = class {
    constructor(dbName, port){
        var dbPath = 'mongodb://'  + port + '/' + dbName;
        mongoose.connect(dbPath);
        
        var accountSchema = mongoose.Schema({
            usrname: String,
            password: String,
            score: Number
        });
        
        var chatroomSchema = mongoose.Schema({
            usrname: String,
            message: String,
            date: Number
        });
        
        accountSchema.methods.generateHash = function(password) {
            return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
        };

        accountSchema.methods.validPassword = function(password) {
            return bcrypt.compareSync(password, this.password);
        };

        this.Account = mongoose.model("Account", accountSchema);
        this.ChatRoom = mongoose.model("ChatRoom",chatroomSchema);
    }
    
    loadPlayerProfile(name, callback) {
        this.Account.findOne({ 'usrname' :  name }, function(err, account) {
            if (err || !account){
                console.log("Failed to retrieve account: " + name);
                return null;
            }

            var profile = {
                usrname: account.usrname,
                score: account.score
            };

            console.log("Successfully retrieved account");
            
            callback(profile);
        });
    }
    
    savePlayerProfile(profile, callback){;
        this.Account.findOneAndUpdate({'usrname': profile.usrname}, {
            score: profile.score
        }, function(err, response) {
           if(err){
               console.log("Failed to save profile");
           } else {
               console.log("Profile saved!");
           }
           callback();
        });
    }
};

module.exports = DBManager;