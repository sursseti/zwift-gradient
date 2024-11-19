var fs = require('fs').promises;
var ZwiftAccount = require("zwift-mobile-api");
var username = "photobysurs8@gmail.com";
var password = "ParoldlyZwift1";
var playerId = "6366058";
var account = new ZwiftAccount(username, password);

var world = account.getWorld(1);

// Get the status of the specified rider
// (includes x,y position, speed, power, etc)
world.riderStatus(playerId).then(status => {
    console.log(status); // JSON of rider status
    console.log(`Lean: ${100 - (status.lean*0.0001)}`);
    console.log(`Lean: ${(100 - (status.lean*0.0001)).toFixed(0)}`);
});
