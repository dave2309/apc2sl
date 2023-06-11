# APC mini MK2 to manage SooperLooper via OSC

this is a work in progress project.

tested with node 20

there is a `colors.js` to help visualizing colors.
- clipstop and solo UI buttons to change palette 0-63 , 64->127

volume/pan fader buttons to select what the silder will control, volume or pan

stop all clips: to mute all

select: to enable disable latch mode (works on record/replace/overdub only)

each column represent a loop (from top to bottom)
record
replace
overdub
undo
redo
reverse
trigger
mute

script should detect the midi device

numbers of loops are 6 by default, and guess with /ping osc to SooperLooper

clipstop: call ping

solo: call a reset (refresh pads)
