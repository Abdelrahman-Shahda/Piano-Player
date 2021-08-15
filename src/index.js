import { FancyMidiPlayer } from "./midi";

const createMusicalPiece = (id, name, path) => ({ id, name, path });

const pieces = [
  createMusicalPiece(
    0,
    "Chopin - Etude Revolutionary",
    "../assets/chopin_etude_rev.mid"
  ),
  createMusicalPiece(
    1,
    "Chopin - Etude 25 No. 1",
    "../assets/chopin_etude25_1.mid"
  ),
  createMusicalPiece(2, "Chopin - Op. 27 No. 1", "../assets/chopin_op27_1.mid"),
  createMusicalPiece(
    3,
    "Chopin - Ballade no.1 G minor",
    "../assets/chopin_ballade23_g_minor.mid"
  ),
  createMusicalPiece(4, "Mozart - Minuet", "../assets/mozart_minuet.mid"),
  createMusicalPiece(5, "Death Waltz", "../assets/death_waltz.mid"),
  createMusicalPiece(
    6,
    "Elgar - Salut D'Amour",
    "../assets/elgar_salut_amour.mid"
  ),
  createMusicalPiece(
    7,
    "Liszt - Liebestraum",
    "../assets/liszt_liebestraum.mid"
  ),
  createMusicalPiece(
    8,
    "Bach - Invention 773",
    "../assets/bach_inventions_773.mid"
  ),
  createMusicalPiece(
    9,
    "Bach - Invention 774",
    "../assets/bach_inventions_774.mid"
  ),
  createMusicalPiece(
    10,
    "Bach - Invention 775",
    "../assets/bach_inventions_775.mid"
  ),
  createMusicalPiece(11, "Wiz", "../assets/wiz.mid")
];

const instrumentUrl =
  "https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/gh-pages/FatBoy/acoustic_grand_piano-mp3.js";

const setAppBusy = (isBusy) => {
  const playButton = document.querySelector("#play-piece");
  const stopButton = document.querySelector("#stop-piece");
  const musicalPiecesSelect = document.querySelector("#musical-pieces");

  if (isBusy) {
    playButton.setAttribute("disabled", true);
    stopButton.setAttribute("disabled", true);
    musicalPiecesSelect.setAttribute("disabled", true);
  } else {
    playButton.removeAttribute("disabled");
    stopButton.removeAttribute("disabled");
    musicalPiecesSelect.removeAttribute("disabled");
  }
};

const cp = new FancyMidiPlayer(document);
setAppBusy(true);
cp.setInstrument(instrumentUrl).then(() => {
  const playButton = document.querySelector("#play-piece");
  const stopButton = document.querySelector("#stop-piece");
  playButton.onclick = cp.playMidi.bind(cp);
  stopButton.onclick = cp.stopMidi.bind(cp);
  changePiece(0);
});

const changePiece = (pieceId) => {
  setAppBusy(true);
  cp.stopMidi();
  cp.setMidi(pieces[pieceId].path).then(() => setAppBusy(false));
};

const musicalPiecesSelect = document.querySelector("#musical-pieces");
musicalPiecesSelect.onchange = (evt) => changePiece(evt.target.value);

pieces
  .map((piece) => {
    const option = document.createElement("option");
    option.id = piece.id;
    option.value = piece.id;
    option.innerHTML = piece.name;
    option.selected = piece.id === 0;
    return option;
  })
  .forEach((pieceOption) => musicalPiecesSelect.append(pieceOption));
