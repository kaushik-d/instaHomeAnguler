var http = require('http');
var mongoose = require('mongoose');
var Post = mongoose.model('Post');

var WeatherService = function () {};

WeatherService.prototype.getForecast = function (zip, successCallBack) {
    
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
    
        response.on('end', function () { successCallBack(JSON.parse(str)) });
    
    });
  
    httpreq.end();
};

WeatherService.prototype.saveForecast = function (zip, docId) {
    
    this.getForecast(zip, function(forecast) {
                
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
    
         var postid = docId;
         
         console.log("Got forecast for " + zip);
         
         Post.findByIdAndUpdate(postid, update, options, function (err, post) {
             if (err) {
                 console.error("Error error in saying weather" + err);
             }
         });
     });
    
};

module.exports = new WeatherService();
