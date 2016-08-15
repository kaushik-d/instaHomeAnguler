
var schedule = require('node-schedule');


var rule = new schedule.RecurrenceRule();

rule.minute = new schedule.Range(0, 59, 1);

schedule.scheduleJob(rule, function(){
    console.log(rule);
    console.log('Today is recognized by Rebecca Black!---------------------------');
});

