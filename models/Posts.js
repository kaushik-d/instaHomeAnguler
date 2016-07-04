var mongoose = require('mongoose');

var PostSchema = new mongoose.Schema({
    
    address: String,
    
    city: String,
    
    state: String,
    
    country: String,
    
    zip: String,
    
    author: String,
    
    daysOn: [String],
    
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
        status: Boolean
    }]
});

mongoose.model('Post', PostSchema);