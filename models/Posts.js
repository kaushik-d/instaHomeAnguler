var mongoose = require('mongoose');

var PostSchema = new mongoose.Schema({
    
    address: String,
    
    city: String,
    
    state: String,
    
    country: String,
    
    zip: String,
    
    author: String,
    
    daysOn: [String],
    
    forecast10days: {},
    
    forecastUpdateTime: String,
    
    startTime: [{
        startHr: {
            type: Number,
            default: 0,
            min: 0,
            max: 12
        },
        startMin: {
            type: Number,
            default: 0,
            min: 0,
            max: 60
        },
        dayTime: {
            type: String,
            default: "AM"
        }
    }],
    
    sprinklerZone: [{
        duration: {
            type: Number,
            default: 0,
            min: 0,
            max: 60
        },
        status: {
            type: String,
            default: "AUTO"
        },
        lastRunStartTime: {}
    }]
});

PostSchema.methods.setStatusToAuto  = function(i,callback) {
    this.sprinklerZone[i].status = "AUTO";
    this.save(callback);
};

PostSchema.pre('findOneAndUpdate', function(next) {
    
    //console.log("Setting to");
    //console.log(this._update.$set.sprinklerZone[0].status);
    next();
});

PostSchema.post('findOneAndUpdate', function(doc) {
    
    //console.log(this);
    //console.log(doc.sprinklerZone[0].status);
    //console.log(this._update.$set.sprinklerZone[0].status);
    var i = 0;
    for(i = 0; i < doc.sprinklerZone.length; i++) {
        if(doc.sprinklerZone[i].status == "ON") {
            var duration = doc.sprinklerZone[i].duration;
            console.log("Setting time out for"+ duration*1000); 
            setTimeout(function(i,doc) { return function(){ 
                
                console.log("Setting"+ i + "th status to AUTO"); 
                doc.setStatusToAuto(i, function(err,doc) {
                    if(err) {
                        console.log("Save failed");
                    } else {
                        console.log("Done save");
                    }
                });
            }}(i,doc), duration*1000);
        }
    }
    //setTimeout(function(){ console.log("Hello"); }, 3000);
    //console.log("timeout set");
});

mongoose.model('Post', PostSchema);
