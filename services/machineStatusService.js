
var MachineStatusService = function () {};

MachineStatusService.prototype.getStatus = function (post) {
    
    var status = {};
    for(var i = 0; i < post.sprinklerZone.length; i++) {
        var statusInt = post.sprinklerZone[i].status == "ON" ? 1 : 0;
        status[i+1]=statusInt;
    }
    return status;
};

module.exports = new MachineStatusService();
