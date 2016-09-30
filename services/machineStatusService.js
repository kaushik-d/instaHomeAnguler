
var MachineStatusService = function () {};

MachineStatusService.prototype.getStatus = function (post) {
    
    var status = {};
    //
    // First check if any zone is on. Then set those status to on. 
    //
    for(var i = 0; i < post.deviceZones.length; i++) {
        var statusInt = post.deviceZones[i].status == "ON" ? 1 : 0;
        status[i+1]=statusInt;
    }
    
    var time = new Date();
    var currHr = time.getHours();
    var currMin = time.getMinutes();
    var currTimeSinceMidnight = currHr*60+currMin;
    
    for(i=0; i < post.startTime.length; i++) {
        
        var startHr = post.startTime[i].dayTime == "AM" ? 
                        post.startTime[i].startHr : post.startTime[i].startHr + 12;
        var startMin = post.startTime[i].startMin;
        
        var startTimeSinceMidNight = startHr*60+startMin;
        
        var cumulativeDuration = 0;
        
        for(var j = 0; j < post.deviceZones.length; j++) {
            var duration = post.deviceZones[j].duration;
            
            cumulativeDuration += duration;
            
            var endTimeSinceMidNight = startTimeSinceMidNight + cumulativeDuration;
            
            if(currTimeSinceMidnight >= startTimeSinceMidNight &&
               currTimeSinceMidnight <= endTimeSinceMidNight) {
                status[j+1]=1;
            }
        }
    }
    
    return status;
};

module.exports = new MachineStatusService();
