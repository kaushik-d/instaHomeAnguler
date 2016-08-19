
var schedule = require('node-schedule');
//var http = require('http');
var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var rule = new schedule.RecurrenceRule();

var WeatherService = require('./weatherService.js');

rule.hour = new schedule.Range(0, 23, 12);

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
                var postid = post._id;
                
                console.log("getting forecast for " + zip);
            
                WeatherService.saveForecast(zip,postid);
                
                /*
                WeatherService.getForecast(zip, function(forecast) {
                
                    var d = new Date();
                    var update = {
                        $set: {
                            forecast10days : forecast.forecast.simpleforecast.forecastday,
                            forecastUpdateTime: d.toLocaleString()
                        }
                    };
    
                    var options = {
                        safe: true,
                        upsert: false,
                        new: true
                    };
    
                    var postid = post._id;
                    
                    console.log("Got forecast for " + zip);
                    
                    Post.findByIdAndUpdate(postid, update, options, function (err, post) {
                        if (err) {
                            console.error("Error error in saying weather" + err);
                        }
                    });
                }); 
                */
            }
        }
    });
});
