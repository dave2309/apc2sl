const config  = require('./config.js');
const slcmd   = require('./slcmd.js');
const osc2apc = require('./osc2apc.js');
const padmap  = require('./apcmap.js');

const osc     = require('osc');
const midi    = require('easymidi');

// Log out midi inputs and outputs eventually to adjust settings
var midiInDevice  = midi.getInputs().filter(input => input.startsWith('APC') && input.endsWith('20:0'));
var midiOutDevice = midi.getOutputs().filter(input => input.startsWith('APC') && input.endsWith('20:0'));

// If no device found just get out
if (midiInDevice.length === 0 && midiOutDevice.length === 0) {
    console.log('midi inputs: ', midi.getInputs());
    console.log('midi outputs:', midi.getOutputs());
    console.error('APC mini MK2 not found');
    return;
}

const apc = {
    name: "APC mini MK2",

    loops: 0,

    latch: false,

    osc: new osc.UDPPort({
        localAddress: config.localhost,
        localPort: config.localport,
        remoteAddress: config.remoteaddress,
        remotePort: config.remoteport,
        metadata: true
    }),

    midiIn: new midi.Input(midiInDevice.pop()),
    midiOut: new midi.Output(midiOutDevice.pop()),

    shift: false,

    faderControl: 'wet', // can be `pan_1` id: 100,

    // Parse Midi Message
    pad: function (note) {
        // Send action to SooperLooper
        this.osc.send(slcmd.hit(note));
    },

    pmmon: function (msg) {
        console.log(msg);
        switch (padmap.is(msg.note)) {
            case 'pad':
                this.pad(msg.note);
                return;

            case 'vol':
            case 'pan':
                this.toggleFaderControl(msg);
                return;

            case 'shift':
                this.shift = !this.shift;
                return;

            case 'ping':
                this.osc.send(slcmd.ping());
                return;

            case 'latch':
                this.latch = !this.latch;
                this.toggleUI(msg.note);

            case 'mute_all':
                this.osc.send(slcmd.mute_all(this.loops));
        }
    },

    pmmoff: function (msg) {
        switch (padmap.is(msg.note)) {
            case 'pad':
                if (!this.latch) {
                    return;
                }

                this.pad(msg.note);
                break;

            case 'shift':
                this.shift = !this.shift;
        }
    },

    // Parse Midi Message Controller Change
    pmmcc: function (msg) {
        //console.log(msg);
        this.osc.send(slcmd.set(this.faderControl, msg.controller%8, msg.value/127));
    },

    // Parse Osc Message
    //pom: function (msg, timeTag, info) {
    pom: function (msg, info) {
        //console.log(msg, timeTag, info);
        var result = osc2apc(msg, info);
        switch (result.fct) {
            case 'loops':
                this.loops = result.val;
                this.reset();
                this.osc.send(slcmd.unregister_loops_state(this.loops));
                this.osc.send(slcmd.register_loops_state(this.loops));
                this.osc.send(slcmd.state_all(this.loops));
                break;

            case 'pads':
                this.refresh(result.val);
        }
    },

    // Refresh the pads colors/lights
    refresh: function (pads) {
        pads.forEach(pad => { this.button(pad.note, pad.velocity, pad.channel); })
    },

    // Make all reset
    // TODO
    reset: function() {
        this.faderControl = 'wet';

        // Reset active pads
        for (var i = 0; i < 64; i++) {
            if (i % 8 < this.loops) {
                this.button(i, 1, 6);
            } else {
                this.button(i, 0, 0);
            }
        }

        this.button(116, this.latch ? 2 : 1, 0);
    },

    toggleUI: function (note) {
        this.button(note, this.latch ? 2 : 1, 0);
    },

    toggleFaderControl: function (msg) {
        this.button(apcmap.id(this.faderControl), 0, 0);
        this.button(msg.note, 1, 0);
        this.faderControl = apcmap.fct(msg.note);
    },

    init: function () {
        this.button(112, 2, 0);
        this.button(113, 1, 0);
        this.button(apcmap.id(this.faderControl), 1, 0);
        this.button(119, 1, 0);

        // Look for the midi In and Out
        this.midiIn.on('noteon', function (msg) { this.pmmon(msg); }.bind(this));

        this.midiIn.on('noteoff', function (msg) { this.pmmoff(msg); }.bind(this));

        this.midiIn.on('cc', function (msg) { this.pmmcc(msg); }.bind(this));

        //this.osc.on('bundle', function (oscMsg, timeTag, info) { this.pom(oscMsg, timeTag, info); }.bind(this));
        this.osc.on('osc', function (oscMsg, info) { this.pom(oscMsg, info); }.bind(this));

        this.osc.on('error', function (error) { console.error(error); });

        this.osc.on("ready", function () {
            console.log('I am ready!');

            this.button(112, 1, 0);
            this.osc.send(slcmd.ping());
            this.osc.send(slcmd.state_all());

        }.bind(this));

        this.osc.open();
    },

    button: function (note, velocity, channel) {
        this.midiOut.send('noteon', {
            note: note,
            velocity: velocity,
            channel: channel,
        });
    },

    shutdown: function () {
        this.osc.send(slcmd.unregister_loops_state(this.loops));
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
