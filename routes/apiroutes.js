var express = require('express');
var router = express();
var mongoose = require('mongoose');
var config = require('../configs/database');
var passport = require('passport');
var User = require('../models/user');
var LunchGroup = require('../models/lunchgroup');
var jwt = require('jsonwebtoken');

//mongoose.connect(config.database);

router.use(passport.initialize());
require('../configs/passport')(passport);

//create a user account
router.post('/api/signup', function(req, res){
  if(!req.body.username || !req.body.password){
    res.json({success: false, msg: 'Username and Password requried!.'});
  } else {
    var newUser = new User({
      username: req.body.username,
      password: req.body.password
    });
    newUser.save(function(err){
      if(err){
        return res.json({success: false, msg:'Username already exists.'});
      }
      res.json({success: true, msg: 'User created'});
    });
  }
});

router.post('/api/createLunchGroup', passport.authenticate('jwt',{session: false}), function(req, res){
  if(!req.body.groupname || !req.body.origin){
    res.json({success: false, msg: 'Missing Fields!'});
  }else{
    findUserIDs(req.body.users.slice(1,-1).split(','),function(err, ids){
      //console.log(ids);
      if(err) throw err;
      if(!ids){
        res.json({success:false, msg:'Group users not found'});
      }
      var newGroup = new LunchGroup({
        groupname: req.body.groupname,
        users: ids,
        origin: JSON.parse(req.body.origin)
      });
      newGroup.save(function(err){
        if(err){
          return res.json({success: false, msg: 'Group already exists'});
        }
        res.json({success: true, msg: 'Group created'});
      });
    });
  }
});

//issue session token with a successful username password combo
router.post('/api/authenticate', function(req, res) {
  User.findOne({
    username: req.body.username
  }, function(err, user) {
    if (err) throw err;

    if (!user) {
      res.send({success: false, msg: 'Authentication failed.'});
    } else {
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (isMatch && !err) {
          var token = jwt.sign({id: user.id, username: user.username}, config.secret,{expiresIn: "1 day"});
          res.json({success: true, token: 'JWT ' + token});
        } else {
          res.send({success: false, msg: 'Authentication failed.'});
        }
      });
    }
  });
});

router.get('/api/memberinfo', passport.authenticate('jwt', {session: false}),function(req, res){
  var token = getToken(req.headers);
  if(token){
    var decode = jwt.decode(token, config.secret);
    User.findOne({
      username: decode.username
    }, function (err, user) {
      if (err) throw err;

      if(!user){
        return res.status(403).send({sucess: false, msg: 'Authentication failed.'})
      }else {
        res.json({success: true, msg:'Welcome ' + user.username});
      }
    });
  }else {
    return res.status(403).send({success: false, msg:'Login required.'});
  }
});

getToken = function(headers){
  if(headers && headers.authorization){
    var parted = headers.authorization.split(' ');
    if(parted.length === 2){
      return parted[1];
    }else {
      return null;
    }
  }else {
    return null;
  }
}

findUserIDs = function(users, callback){
  var userIds = [];
  User.find({username: {$in: users}}, function(err, results){
    if(err) callback(err,null);
    if(!results){
      callback(null,null);//no records found
    }
    if(results.length < users.length){
      callback(null,null);
    }
    results.forEach(function(u){
      userIds.push(u.id);
    });
    callback(null, userIds);
  });
}

module.exports = router;
