var express = require('express');
var router = express.Router();
var http = require('http');

var passport = require('passport');
var mongoose = require('mongoose');

var User = mongoose.model('User');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');

var jwt = require('express-jwt');
var auth = jwt({
    secret: 'SECRET',
    userProperty: 'payload'
});

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/postsbyauthor',
    auth,
    function (req, res, next) {
        var authorFromReq = req.payload.username;
        Post.find({
            author: authorFromReq
        }).exec(
            function (err, posts) {
                if (err) {
                    return next(err);
                }

                res.json(posts);
            });
    }
);

router.post('/posts',
    auth,
    function (req, res, next) {
        var post = new Post(req.body);
        post.author = req.payload.username;
        post.save(
            function (err, post) {
                if (err) {
                    return next(err);
                }

                res.json(post);
            });
    }
);

router.post('/updatepost',
    auth,
    function (req, res, next) {

        var post = req.body;

        var update = {
            $set: post
        };

        var options = {
            safe: true,
            upsert: false,
            new: true
        };

        var postid = post._id;

        Post.findByIdAndUpdate(postid, update, options, function (err, post) {
            if (err) {
                return next(err);
            }
        });

    }
);
            
router.param('post',
    function (req, res, next, id) {

        var query = Post.findById(id);

        query.exec(
            function (err, post) {
                if (err) {
                    return next(err);
                }
                if (!post) {
                    return next(new Error('can\'t find post'));
                }
                req.post = post;
                return next();
            });
    }
);

router.get('/post/:post',
    auth,
    function (req, res, next) {
        res.json(req.post);
    }
);

router.delete('/post/:postid',
    auth,
    function (req, res, next) {

        var postid = req.params.postid;
        var author = req.payload.username;

        Post.findByIdAndRemove(postid, function (err) {
            if (err) {
                return next(err);
            }
            Post.find({
                author: author
            }).exec(
                function (err, posts) {
                    if (err) {
                        return next(err);
                    }

                    res.json(posts);
                }
            );
        });
    }
);

router.get('/getweather/:zip',
    auth,
    function (req, res) {
        var zip = req.params.zip;

        var options = {
            host: 'api.wunderground.com',
            path: '/api/01e4e6f0fa382cba/forecast/q/' + zip + '.json',
            port: 80
        };

        var httpreq = http.request(options, function (response) {
            var str = '';
    
            response.on('data', function (chunk) {
                str += chunk;
            });

            response.on('end', function() {
                res.send(str);
            })

        });
  
        httpreq.end();
    }
);

router.post('/register',
    function (req, res, next) {
        if (!req.body.username || !req.body.password) {
            return res.status(400).json({
                message: 'Please fill out all fields'
            });
        }

        var user = new User();

        user.username = req.body.username;

        user.setPassword(req.body.password);

        user.save(
            function (err) {
                if (err) {
                    return next(err);
                }

                return res.json({
                    token: user.generateJWT()
                })
            }
        );
    }
);

router.post('/login',
    function (req, res, next) {
        if (!req.body.username || !req.body.password) {
            return res.status(400).json({
                message: 'Please fill out all fields'
            });
        }

        passport.authenticate('local',
            function (err, user, info) {
                if (err) {
                    return next(err);
                }

                if (user) {
                    return res.json({token: user.generateJWT()});
                } else {
                    return res.status(401).json(info);
                }
            }
        )(req, res, next);
    }
);

module.exports = router;
