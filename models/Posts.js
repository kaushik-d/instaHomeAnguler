var mongoose = require('mongoose');

var timeOutContainer = {};

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
    
    deviceZones: [{
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
    this.deviceZones[i].status = "AUTO";
    this.save(callback);
};

PostSchema.pre('findOneAndUpdate', function(next) {
    
    //console.log("Setting to");
    //console.log(this._update.$set.deviceZones[0].status);
    next();
});

PostSchema.post('findOneAndUpdate', function(doc) {
    
    var i = 0;
    
    if(timeOutContainer[doc._id] === undefined) {
        timeOutContainer[doc._id] = {};
    }
    
    for(i = 0; i < doc.deviceZones.length; i++) {
        if(doc.deviceZones[i].status == "ON") {
            var duration = doc.deviceZones[i].duration*60*1000;
            console.log("Setting time out for"+ duration); 
            timeOutContainer[doc._id][i] = setTimeout(function(i,doc) { return function(){
                
                console.log("Setting"+ i + "th status to AUTO"); 
                doc.setStatusToAuto(i, function(err,doc) {
                    if(err) {
                        console.log("Save failed"+ err.toString());
                    } else {
                        console.log("Done save");
                    }
                });
            }}(i,doc), duration);
            
        } else if (doc.deviceZones[i].status == "AUTO") {
            if(timeOutContainer[doc._id][i] !== undefined) {
                clearTimeout(timeOutContainer[doc._id][i]);
                console.log("cancelling timeout" + timeOutContainer[doc._id][i]);
                delete timeOutContainer[doc._id][i];
            }
        }
    }
    
    //if (Object.keys(timeOutContainer[doc._id]).length === 0 && 
    //    timeOutContainer[doc._id].constructor === Object) {
    //        //empty object
    //        delete timeOutContainer[doc._id];
    //    }
    
    //setTimeout(function(){ console.log("Hello"); }, 3000);
   // console.log("timeout set");
});

mongoose.model('Post', PostSchema);
