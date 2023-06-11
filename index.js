const config  = require('./config.js');
const slcmd   = require('./slcmd.js');
const osc2apc = require('./osc2apc.js');
const padmap  = require('./apcmap.js');

const osc     = require('osc');
const midi    = require('easymidi');

//const { spawn } = require('child_process');

// Log out midi inputs and outputs eventually to adjust settings
var midiInDevice  = midi.getInputs().filter(input => input.startsWith('APC') && input.endsWith(':0'));
var midiOutDevice = midi.getOutputs().filter(input => input.startsWith('APC') && input.endsWith(':0'));

// If no device found just get out
if (midiInDevice.length === 0 && midiOutDevice.length === 0) {
    console.log('midi inputs: ', midi.getInputs());
    console.log('midi outputs:', midi.getOutputs());
    console.error('APC mini MK2 not found');
    process.exit();
}

//console.log('Midi In :', midiInDevice[0]);
//console.log('Midi Out:', midiOutDevice[0]);

const apc = {
    name: "APC mini MK2",

    loops_nb: config.loops_nb,

    latch: false,

    osc: new osc.UDPPort({
        localAddress:  config.localhost,
        localPort:     config.localport,
        remoteAddress: config.remoteaddress,
        remotePort:    config.remoteport,
        metadata:      true
    }),

    midiIn:  new midi.Input(midiInDevice.pop()),
    midiOut: new midi.Output(midiOutDevice.pop()),

    shift: false,

    fader_control: 100, // or 101 (volume or pan)

    sl_start: function () {
        console.log('launch app.');
        //const child = spawn('slgui');
    },

    loop_control: function (params) {
        this.osc.send(slcmd.hit(params.fct, params.lid));
    },

    toggle_shift: function () {
        this.shift = !this.shift;
    },

    ping: function () {
        this.osc.send(slcmd.ping());
    },

    mute_all: function () {
        this.osc.send(slcmd.mute_all(this.loops_nb));
    },

    toggle_latch: function () {
        this.latch = !this.latch;

        // 2: blink 1: plain
        this.button(padmap.id['latch'], this.latch ? 2 : 1, 0);
    },

    switch_fader_control: function (params) {
        this.button(this.fader_control, 0, 0);
        this.button(params.code, 1, 0);
        this.fader_control = params.code;
    },

    // Refresh the pads colors/lights
    refresh: function (pads) {
        pads.forEach(pad => { this.button(pad.note, pad.velocity, pad.channel); });
    },

    // Make all reset
    // TODO
    reset: function() {
        this.fader_control = padmap.id['volume'];
        this.button(padmap.id['volume'], 1, 0);
        this.button(padmap.id['pan'], 0, 0);

        // Reset active pads undo/redo/rev/trigger rows
        // NOTE: the others ones should be taking care off with state back
        for (var i = 8; i <= 39; i++) {
            if (i % 8 < this.loops_nb) {
                this.button(i, 1, 6);
            } else {
                this.button(i, 0, 0);
            }
        }

        this.button(padmap.id['latch'], this.latch ? 2 : 1, 0);
    },

    pong: function (loops_nb) {
        //console.log('loops nb:', result.val);
        if (this.loops_nb != loops_nb) {
            this.osc.send(slcmd.unregister_loops_state(this.loops_nb));
            this.osc.send(slcmd.register_loops_state(loops_nb));
        }
        this.loops_nb = loops_nb;
        this.reset();
        this.osc.send(slcmd.state_all(this.loops_nb));
    },

    init: function () {
        this.button(padmap.id['ping'], 1, 0);
        this.button(padmap.id['reset'], 1, 0);
        this.button(padmap.id['latch'], 1, 0);
        this.button(padmap.id['mute_all'], 1, 0);

        // Look for the midi In and Out
        this.midiIn.on('noteon', function (msg) {
            var dispatch = padmap.dispatch(msg.note);
            this[dispatch.action](dispatch.params ?? null);
        }.bind(this));

        this.midiIn.on('noteoff', function (msg) {
            if (!(msg.note >= 40 && msg.note <= 63 && this.latch)) {
                return;
            }

            var dispatch = padmap.dispatch(msg.note);
            this[dispatch.action](dispatch.params ?? null);
        }.bind(this));

        this.midiIn.on('cc', function (msg) {
            this.osc.send(slcmd.set(padmap.fct[this.fader_control], msg.controller%8, msg.value/127));
        }.bind(this));

        this.osc.on('osc', function (oscMsg, info) {
            var dispatch = osc2apc[oscMsg.address](oscMsg.args);
            this[dispatch.fct](dispatch.val ?? null);
        }.bind(this));

        this.osc.on('error', function (error) { console.error(error); });

        this.osc.on("ready", function () {
            //console.log('osc ready');
            this.osc.send(slcmd.ping());
            this.osc.send(slcmd.state_all());
        }.bind(this));

        this.osc.open();
    },

    button: function (note, velocity, channel) {
        //console.log(note, velocity,channel);
        this.midiOut.send('noteon', { note: note, velocity: velocity, channel: channel });
    },

    shutdown: function () {
        // Pads
        for (var i=0; i<=63; i++) {
            this.button(i, 0, 0);
        }
        // faders buttons
        for (i=100; i<=107; i++) {
            this.button(i, 0, 0);
        }
        // UI
        for (i=112; i<=119; i++) {
            this.button(i, 0, 0);
        }
        this.osc.send(slcmd.unregister_loops_state(this.loops_nb));
        this.osc.close();
        this.midiOut.close();
        this.midiIn.close();
    },
};

process.on('SIGINT', function () {
    console.log('SIGINT');
    apc.shutdown();
    process.exit();
})

apc.init();
