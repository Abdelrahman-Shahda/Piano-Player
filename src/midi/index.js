import { FancyPiano } from "../piano";
import SoundFont from "soundfont-player";
import MidiPlayer from "midi-player-js";
import {
  SUSTAINED_NOTE_DURATION,
  NON_SUSTAINED_NOTE_DURATION
} from "../utils/constants";
import ReverbJS from "reverb.js";

export class FancyMidiPlayer {
  constructor(document) {
    this.audioContext =
      window.AudioContext || window.webkitAudioContext || false;
    this.safeAudioContext = new this.audioContext();
    this.instrument = null;
    this.midi = null;
    this.player = null;
    this.piano = new FancyPiano(document);
    this.volume = 3;

    ReverbJS.extend(this.safeAudioContext);

    // 2) Load the impulse response; upon load, connect it to the audio output.
    const reverbUrl = "../assets/reverb/Basement.m4a";
    this.reverbNode = this.safeAudioContext.createReverbFromUrl(
      reverbUrl,
      function () {
        this.reverbNode.connect(this.safeAudioContext.destination);
      }.bind(this)
    );
  }

  async setInstrument(instrumentUrl) {
    this.instrument = await SoundFont.instrument(
      this.safeAudioContext,
      instrumentUrl,
      {
        destination: this.reverbNode
      }
    );

    this.player = new MidiPlayer.Player((event) => {
      console.log(event);
      if (event.name === "Controller Change") {
        this.onControllerChange(event);
      } else if (event.name === "Note on") {
        this.onNoteOnEvent(event);
      } else if (event.name === "Note off") {
        this.onNoteOffEvent(event);
      }
    });
  }

  onControllerChange(event) {
    if (event.number === 64) {
      // Sustain Pedal Change
      this.piano.setSustainPedal(event.value);
      console.log(this.piano.isSustainPedalPressed ? "Pressed" : "Released");
      if (!this.piano.isSustainPedalPressed) {
        this.piano
          .getSustainedKeys()
          .forEach((sustainedKey) => sustainedKey.stop());
      }
    }
  }

  onNoteOnEvent(event) {
    if (event.velocity === 0) {
      this.onNoteOffEvent(event);
    } else {
      let keyEvent = this.instrument.play(
        event.noteName,
        this.safeAudioContext.currentTime,
        {
          gain: (event.velocity / 100) * this.volume,
          duration: this.piano.isSustainPedalPressed
            ? SUSTAINED_NOTE_DURATION
            : NON_SUSTAINED_NOTE_DURATION
        }
      );
      this.piano.setKey(event.noteNumber, keyEvent);
    }
  }

  onNoteOffEvent(event) {
    const keyToStop = this.piano.stopKey(event.noteNumber);
    if (keyToStop) keyToStop.stop();
  }

  async setMidi(midiUrl) {
    // "../assets/chopin_etude_rev.mid"
    this.midi = await fetch(midiUrl).then((response) => response.arrayBuffer());
    this.player.loadArrayBuffer(this.midi);
  }

  playMidi() {
    this.player.play();
  }

  stopMidi() {
    this.player.stop();
    this.piano.repaintKeys();
  }
}
