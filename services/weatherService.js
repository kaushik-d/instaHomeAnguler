var http = require('http');

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

module.exports = new WeatherService();
