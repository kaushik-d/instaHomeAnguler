
var schedule = require('node-schedule');
var http = require('http');
var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var rule = new schedule.RecurrenceRule();

rule.minute = new schedule.Range(0, 59, 1);

schedule.scheduleJob(rule, function(){
    
    console.log(rule);
    console.log('Today is recognized by Kaushik Das!---------------------------');
        
    Post.find().exec(function (err, posts) {
        
        if (err) {
            console.log("error finding recoords");
        } else {

            for (var i = 0; i < posts.length; i++) {
                
                var zip = posts[i].zip;
                var post = posts[i];
                
                console.log("getting forecast for " + zip);

                var options = {
                    host: 'api.wunderground.com',
                    path: '/api/01e4e6f0fa382cba/forecast10day/q/' + zip + '.json',
                    port: 80
                };

                var httpreq = http.request(options, function (response) {
                var str = '';
    
                response.on('data', function (chunk) {
                    str += chunk;
                });

                response.on('end', function() {
                    
                    console.log("Got forecast for " + zip);
                    //console.log("Got forecast for " + post.zip);
                    
                    post.forecast10days = str;
                });

            });
  
            httpreq.end();

            }
        }
    });
});

