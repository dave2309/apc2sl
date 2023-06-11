const midi    = require('easymidi');

const { spawn } = require('child_process');

// Log out midi inputs and outputs eventually to adjust settings
var midiInDevice  = midi.getInputs().filter(input => input.startsWith('APC') && input.endsWith('20:0'));
var midiOutDevice = midi.getOutputs().filter(input => input.startsWith('APC') && input.endsWith('20:0'));

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
    midiIn:  new midi.Input(midiInDevice.pop()),
    midiOut: new midi.Output(midiOutDevice.pop()),

    offset: 0,

    redraw: function () {
        for (var i=0; i<=63; i++) {
            this.button(i, this.offset+i, 6);
        }
    },

    init: function () {
        this.redraw();

        // Look for the midi In and Out
        this.midiIn.on('noteon', function (msg) {
            if (msg.note===112) {
                this.offset = 0;
            }
            if (msg.note===113) {
                this.offset = 64;
            }
            if (msg.note===112 || msg.note===113) {
                this.redraw();
                return;
            }
            console.log('pad:', msg.note, 'color:', this.offset+msg.note);

        }.bind(this));
    },

    button: function (note, velocity, channel) {
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
        this.midiIn.close();
    },
};

process.on('SIGINT', function () {
    console.log('SIGINT');
    apc.shutdown();
    process.exit();
})

apc.init();
