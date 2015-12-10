var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
//WebRTC = require('./build/Release/webrtc.node');
WebRTC = require('../../');
jsdom=require('jsdom');
$=require('jquery');
strophe = require("node-strophe").Strophe;
Strophe = strophe.Strophe;
$iq = strophe.$iq;
$build = strophe.$build;
$pres = strophe.$pres;
$msg = strophe.$msg;
var readline = require('readline');
var program = require('commander');
var JitsiMeetJS = require('./JitsiMeetJS');

app.use(express.static(__dirname));

var options = {
    hosts: {
        domain: 'focus.xrtc.me',
        muc: 'conference.focus.xrtc.me', // FIXME: use XEP-0030
        bridge: 'jitsi-videobridge.focus.xrtc.me', // FIXME: use XEP-0030
    },
    bosh: 'http://focus.xrtc.me/http-bind', // FIXME: use xep-0156 for that
    clientNode: 'http://jitsi.org/jitsimeet', // The name of client node advertised in XEP-0115 'c' stanza
 
}
 
var confOptions = {
    openSctp: true,
    disableAudioLevels: true
}

/**
 * Handles local tracks.
 * @param tracks Array with JitsiTrack objects
 */
function onLocalTracks(tracks)
{
	console.log("onLocalTracks",tracks);
    localTracks = tracks;
    for(var i = 0; i < localTracks.length; i++)
    {
            room.addTrack(localTracks[i]);
    }
}

/**
 * Handles remote tracks
 * @param track JitsiTrack object
 */
function onRemoteTrack(track) {
    var participant = track.getParitcipantId();
    if(!remoteTracks[participant])
        remoteTracks[participant] = [];
    remoteTracks[participant].push(track);
    var id = participant + track.getType();
    if(track.getType() == "video") {
        $("body").append("<video autoplay='1' id='" + participant + "video' />");
    } else {
        $("body").append("<audio autoplay='1' id='" + participant + "audio' />");
    }
    track.attach($("#" + id));
}

/**
 * That function is executed when the conference is joined
 */
function onConferenceJoined () {
    console.log("conference joined!");
    JitsiMeetJS.createLocalTracks({}).then(onLocalTracks);
}

function onUserLeft(id) {
    if(!remoteTracks[id])
        return;
    var tracks = remoteTracks[id];
    for(var i = 0; i< tracks.length; i++)
        tracks[i].detach($("#" + id + tracks[i].getType()))
}

/**
 * That function is called when connection is established successfully
 */
function onConnectionSuccess(){
	console.log("Connection success!!!!");
program
  .version('0.1')
  .option('-r, --roomname', 'Enter room name')
  .parse(process.argv);

	if(program.roomname)
	console.log("Entering a roomname:::",program.args[0]);
    room = connection.initJitsiConference(program.args[0], confOptions);
    room.on(JitsiMeetJS.events.conference.TRACK_ADDED, onRemoteTrack);
    room.on(JitsiMeetJS.events.conference.TRACK_REMOVED, function () {
        console.log("track removed!!!");
    });
    room.on(JitsiMeetJS.events.conference.CONFERENCE_JOINED, onConferenceJoined);
    room.on(JitsiMeetJS.events.conference.USER_JOINED, function(id){ remoteTracks[id] = [];});
    room.on(JitsiMeetJS.events.conference.USER_LEFT, onUserLeft);
    room.on(JitsiMeetJS.events.conference.TRACK_MUTE_CHANGED, function (track) {
        console.log(track.getType() + " - " + track.isMuted());
    });
    room.on(JitsiMeetJS.events.conference.DISPLAY_NAME_CHANGED, function (userID, displayName) {
        console.log(userID + " - " + displayName);
    });
    room.on(JitsiMeetJS.events.conference.TRACK_AUDIO_LEVEL_CHANGED,
      function(userID, audioLevel){
          // console.log(userID + " - " + audioLevel);
      });
    room.join();
};

/**
 * This function is called when the connection fail.
 */
function onConnectionFailed(){console.error("Connection Failed!")};

/**
 * This function is called when we disconnect.
 */
function disconnect(){
    console.log("disconnect!");
    connection.removeEventListener(JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED, onConnectionSuccess);
    connection.removeEventListener(JitsiMeetJS.events.connection.CONNECTION_FAILED, onConnectionFailed);
    connection.removeEventListener(JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED, disconnect);
}

function unload() {
//    room.leave();
    connection.disconnect();
}

//$(window).bind('beforeunload', unload);
//$(window).bind('unload', unload);



// JitsiMeetJS.setLogLevel(JitsiMeetJS.logLevels.ERROR);

JitsiMeetJS.init();

var connection = null;
var room = null;
var localTracks = [];
var remoteTracks = {};


connection = new JitsiMeetJS.JitsiConnection(null, null, options);

connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED, onConnectionSuccess);
connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_FAILED, onConnectionFailed);
connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED, disconnect);

connection.connect();

/*server.listen(8080, function() {
  console.log('Open in browser: http://focus.xrtc.me:8080/');
});*/
