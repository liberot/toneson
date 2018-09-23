// https://developer.mozilla.org/en-US/docs/Web/API/AudioContext
var log = jQuery('#log');
var keyLog = jQuery('#keyLog');
var view = jQuery('#view');

var keys = [
	'A minor',
	'A major',
	'B minor',
	'B major',
	'C minor',
	'C major',
	'D minor',
	'D major',
	'E minor',
	'E major',
	'F minor',
	'F major',
	'G minor',
	'G major',
	'Olivia Newton John Magic'
];

var viewNotes = [
	'A',
	'A#/Bb',
	'B',
	'C',
	'C#/Db',
	'D',
	'D#/Eb',
	'E',
	'F',
	'F#/Gb',
	'G',
	'G#/Ab'
];

var currentKeyIndex = 0;

var A = 65,
	S = 83,
	D = 68,
	F = 70,
	G = 71,
	H = 72,
	J = 74,
	K = 75,
	W = 87,
	R = 82,
	T = 84,
	U = 85,
	I = 73,
	Y = 89,
	X = 88,
	C = 67,
	V = 86,
	B = 66,
	N = 78,
	M = 77,
	Q = 81, 
	L = 76,
	P = 80,
	O = 79;


// http://pages.mtu.edu/~suits/notefreqs.html
var notes = [];
	notes['A'] = { name: 'A', freq: 440 };
	
	notes['A#/Bb'] = { name: 'A#/Bb', freq: 466.16 };
	notes['A#'] = { name: 'A#', freq: 466.16 };
	notes['Bb'] = { name: 'Bb', freq: 466.16 };
	
	notes['B'] = { name: 'B', freq: 493.88 };
	
	notes['H'] = { name: 'B', freq: 493.88 };
	notes['Hb'] = { name: 'Bb', freq: 466.16 };

	notes['C'] = { name: 'C', freq: 523.25 };
	notes['C#/Db'] = { name: 'C#/Db', freq: 554.37 };
	notes['C#'] = { name: 'C#', freq: 554.37 };
	notes['Db'] = { name: 'Db', freq: 554.37 };
	
	notes['D'] = { name: 'D', freq: 587.33 };
	notes['D#/Eb'] = { name: 'D#/Eb', freq: 622.25 };
	notes['D#'] = { name: 'D#', freq: 622.25 };
	notes['Eb'] = { name: 'Eb', freq: 622.25 };
	
	notes['E'] = { name: 'E', freq: 659.25 };
	
	notes['F'] = { name: 'F', freq: 698.46 };
	notes['F#/Gb'] = { name: 'F#/Gb', freq: 739.99 };
	notes['F#'] = { name: 'F#', freq: 739.99 };
	notes['Gb'] = { name: 'Gb', freq: 739.99 };
	
	notes['G'] = { name: 'G', freq: 783.99 };
	notes['G#/Ab'] = { name: 'G#/Ab', freq: 830.61 };
	notes['G#'] = { name: 'G#', freq: 830.61 };
	notes['Ab'] = { name: 'Ab', freq: 830.61 };

var keyMap = [];
	keyMap[A] = { notes: ['A'], type: 'single' };
		keyMap[W] = { notes: ['A#/Bb'], type: 'single' };
	keyMap[S] = { notes: ['B'], type: 'single' };
	keyMap[D] = { notes: ['C'], type: 'single' };
		keyMap[R] = { notes: ['C#/Db'], type: 'single' };
	keyMap[F] = { notes: ['D'], type: 'single' };
		keyMap[T] = { notes: ['D#/Eb'], type: 'single' };
	keyMap[G] = { notes: ['E'], type: 'single' };
	keyMap[H] = { notes: ['F'], type: 'single' };
		keyMap[U] = { notes: ['F#/Gb'], type: 'single' };
	keyMap[J] = { notes: ['G'], type: 'single' };
		keyMap[I] = { notes: ['G#/Ab'], type: 'single' };
	keyMap[K] = { notes: ['A'], type: 'single' };
	
setKeyOfChords(keys[currentKeyIndex]);

var singleNoteDefGain = .17;
var chordNoteDefGain = .11;

var pressedKeyboardKeys = [];

var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioNode = new AudioContext();

// oscs single pressedKeyboardKeys
var maxSingleNoteLen = 3;
var singleNoteOscs = [];
for (var i = 0; i < maxSingleNoteLen; i++){
	singleNoteOscs.push(audioNode.createOscillator());
	// singleNoteOscs[i].type = 'sine';
	singleNoteOscs[i].gainNode = audioNode.createGain();
	singleNoteOscs[i].connect(singleNoteOscs[i].gainNode);
	singleNoteOscs[i].gainNode.connect(audioNode.destination);
	singleNoteOscs[i].gainNode.gain.setValueAtTime(0, audioNode.currentTime);
	singleNoteOscs[i].start();
};

// singleNoteOscs chords
var chordOscs = [];
var maxChordNoteLen = 5;
for (var i = 0; i < maxChordNoteLen; i++){
	chordOscs.push(audioNode.createOscillator());
	// singleNoteOscs[i].type = 'sine';
	var rnd = parseInt((Math.random() *16) -8);
	console.log('detune: ', rnd);
	chordOscs[i].detune.value = rnd;
	chordOscs[i].gainNode = audioNode.createGain();
	chordOscs[i].connect(chordOscs[i].gainNode);
	chordOscs[i].gainNode.connect(audioNode.destination);
	chordOscs[i].gainNode.gain.setValueAtTime(0, audioNode.currentTime);
	chordOscs[i].start();
};

// view
var viewKeys = [];
for(var i in viewNotes){
	var itemId = 'view_key_' +viewNotes[i];
	var half = itemId.match(/#/g);
	itemId = itemId.replace(/#/g, 'h');
	itemId = itemId.replace(/\//g, '-');
	var buf = jQuery('<div id="#'+itemId+'"></div>');
	if(null != half){
		buf = jQuery('<div id="#'+itemId+'" class="boing"></div>');
	}
	view.append(buf);
	viewKeys[viewNotes[i]] = buf;
}

jQuery(document.body).keydown(function(e){
	// console.log(e.keyCode);
	// special modifier key
	if(Q == e.keyCode){
		shiftKey();
		// return;
	}
	if(-1 == pressedKeyboardKeys.indexOf(e.keyCode)){
    	pressedKeyboardKeys.push(e.keyCode);
	    touch();
	}
});

jQuery(document.body).keyup(function(e){
    pressedKeyboardKeys.splice(pressedKeyboardKeys.indexOf(e.keyCode), 1);
	release(); 
});

function shiftKey(){
	currentKeyIndex++;
	if(currentKeyIndex >= keys.length){
		currentKeyIndex = 0;
	} 
	setKeyOfChords(keys[currentKeyIndex]);
};

function touch(){
	drawTouch();
	play();
};

function release(){
	for(var i = 0; i < maxSingleNoteLen; i++){
    	singleNoteOscs[i].gainNode.gain.setValueAtTime(0, audioNode.currentTime);
	}
	for(var i = 0; i < maxChordNoteLen; i++){
    	chordOscs[i].gainNode.gain.setValueAtTime(0, audioNode.currentTime);
	}
	drawRelease();
	play();
}

// do diss better next time
function drawRelease(){
	for(var i in viewKeys){
		var target = viewKeys[i];
		if(null == target){
			continue;
		}
		target.removeClass('touched').addClass('released');
	}	
};

function drawTouch(){
	for(var i in pressedKeyboardKeys){
		var m = keyMap[pressedKeyboardKeys[i]];
		if(null == m){ 
			continue; 
		}
		var target = viewKeys[m.notes[0]];
		if(null == target){
			continue;
		}
		if('single' == m.type){
			target.removeClass('released').addClass('touched');
		}	
		else if('chord' == m.type){
			for(var ii in m.notes){
				var target = viewKeys[m.notes[ii]];
				if(null == target){
					continue;
				}
				target.removeClass('released').addClass('touched');
			};
		}
	}	
};

function play(){
	
	var logMessage = '';
	
	for(var i in pressedKeyboardKeys){
		
		var m = keyMap[pressedKeyboardKeys[i]];

		if(null == m){ 
			continue; 
		}

		if('single' == m.type){
			if(i >= maxSingleNoteLen){ 
				continue 
			};
			var note = notes[m.notes[0]]; 
			if(null == note){
				continue;
			}
			console.log(note.name, note.freq);
			singleNoteOscs[i].frequency.setValueAtTime(note.freq, audioNode.currentTime);
			singleNoteOscs[i].gainNode.gain.setValueAtTime(singleNoteDefGain, audioNode.currentTime);
			logMessage += note.name  +' ' +note.freq +' ';
		}	
		else if('chord' == m.type){
			for(var ii in m.notes){
				if(ii >= maxChordNoteLen){
					continue;
				}
				var note = notes[m.notes[ii]]; 
				if(null == note){
					continue;
				}
				chordOscs[ii].frequency.setValueAtTime(note.freq, audioNode.currentTime);
				chordOscs[ii].gainNode.gain.setValueAtTime(chordNoteDefGain, audioNode.currentTime);
				logMessage += note.name +' ';	
			};
			console.log(m.name, m.notes);
			logMessage = m.name +' ' +logMessage +' ';	
		}	
	};

	log.text(logMessage);
}

function setKeyOfChords(){

	// todo: einmal den kopf drumherum....
	// http://www.piano-keyboard-guide.com/key-of-e-minor.html
	// there just *must be some easier way doing diss
	keyMap[Y] = {};
	keyMap[X] = {};
	keyMap[C] = {};
	keyMap[V] = {};
	keyMap[B] = {};
	keyMap[N] = {};
	keyMap[M] = {};
	keyMap[L] = {};
	keyMap[P] = {};
	keyMap[O] = {};
	
	switch(arguments[0]){
		
		case 'A minor':
			keyMap[Y] = { name: 'A minor', notes: ['A', 'C', 'E'], type: 'chord'};
			keyMap[X] = { name: 'B diminished', notes: ['B', 'D', 'F'], type: 'chord'};
			keyMap[C] = { name: 'C major', notes: ['C', 'E', 'G'], type: 'chord'};
			keyMap[V] = { name: 'D minor', notes: ['D', 'F', 'A'], type: 'chord'};
			keyMap[B] = { name: 'E minor', notes: ['E', 'G', 'B'], type: 'chord'};
			keyMap[N] = { name: 'F major', notes: ['F', 'A', 'C'], type: 'chord'};
			keyMap[M] = { name: 'G major', notes: ['G', 'B', 'D'], type: 'chord'};
			break;

		case 'A major':
			keyMap[Y] = { name: 'A major', notes: ['A', 'C#', 'E'], type: 'chord'};
			keyMap[X] = { name: 'B minor', notes: ['B', 'D', 'F#'], type: 'chord'};
			keyMap[C] = { name: 'C#/Db minor', notes: ['C#', 'E', 'G#'], type: 'chord'};
			keyMap[V] = { name: 'D major', notes: ['D', 'F#', 'A'], type: 'chord'};
			keyMap[B] = { name: 'E major', notes: ['E', 'G#', 'B'], type: 'chord'};
			keyMap[N] = { name: 'F#/Gb minor', notes: ['F#', 'A', 'C#'], type: 'chord'};
			keyMap[M] = { name: 'G diminished', notes: ['G#', 'B', 'D'], type: 'chord'};
			break;

		case 'B minor':
			keyMap[Y] = { name: 'B minor', notes: ['B', 'D', 'F#'], type: 'chord'};
			keyMap[X] = { name: 'C diminished', notes: ['C#', 'E', 'G'], type: 'chord'};
			keyMap[C] = { name: 'D major', notes: ['D', 'F#', 'A'], type: 'chord'};
			keyMap[V] = { name: 'E minor', notes: ['E', 'G', 'B'], type: 'chord'};
			keyMap[B] = { name: 'F#/Gb minor', notes: ['F#', 'A', 'C#'], type: 'chord'};
			keyMap[N] = { name: 'G major', notes: ['G', 'B', 'D'], type: 'chord'};
			keyMap[M] = { name: 'A major', notes: ['A', 'C#', 'E'], type: 'chord'};
			break;

		case 'B major':
			keyMap[Y] = { name: 'B major', notes: ['B', 'D#', 'F#'], type: 'chord'};
			keyMap[X] = { name: 'C minor', notes: ['C#', 'E', 'G#'], type: 'chord'};
			keyMap[C] = { name: 'D# minor', notes: ['D#', 'F#', 'A#'], type: 'chord'};
			keyMap[V] = { name: 'E major', notes: ['E', 'G#', 'B'], type: 'chord'};
			keyMap[B] = { name: 'F# major', notes: ['F#', 'A#', 'C#'], type: 'chord'};
			keyMap[N] = { name: 'G# minor', notes: ['G#', 'B', 'D#'], type: 'chord'};
			keyMap[M] = { name: 'A# diminished', notes: ['A#', 'C#', 'E'], type: 'chord'};
			break;

		case 'C minor':
			keyMap[Y] = { name: 'C minor', notes: ['C', 'Eb', 'G'], type: 'chord'};
			keyMap[X] = { name: 'D diminished', notes: ['D', 'F', 'Ab'], type: 'chord'};
			keyMap[C] = { name: 'Eb major', notes: ['Eb', 'G', 'Bb'], type: 'chord'};
			keyMap[V] = { name: 'F minor', notes: ['F', 'Ab', 'C'], type: 'chord'};
			keyMap[B] = { name: 'G minor', notes: ['G', 'Bb', 'D'], type: 'chord'};
			keyMap[N] = { name: 'Ab major', notes: ['Ab', 'C', 'Eb'], type: 'chord'};
			keyMap[M] = { name: 'Bb major', notes: ['Bb', 'D', 'F'], type: 'chord'};
			break;
	
		case 'C major':
			keyMap[Y] = { name: 'C major', notes: ['C', 'E', 'G'], type: 'chord'};
			keyMap[X] = { name: 'D minor', notes: ['D', 'F', 'A'], type: 'chord'};
			keyMap[C] = { name: 'E minor', notes: ['E', 'G', 'B'], type: 'chord'};
			keyMap[V] = { name: 'F major', notes: ['F', 'A', 'C'], type: 'chord'};
			keyMap[B] = { name: 'G major', notes: ['G', 'B', 'D'], type: 'chord'};
			keyMap[N] = { name: 'A minor', notes: ['A', 'C', 'E'], type: 'chord'};
			keyMap[M] = { name: 'B diminished', notes: ['B', 'D', 'F'], type: 'chord'};
			break;

		case 'D minor':
			keyMap[Y] = { name: 'D minor', notes: ['D', 'F', 'A'], type: 'chord'};
			keyMap[X] = { name: 'E diminished', notes: ['E', 'G', 'Bb'], type: 'chord'};
			keyMap[C] = { name: 'F major', notes: ['F', 'A', 'C'], type: 'chord'};
			keyMap[V] = { name: 'G minor', notes: ['G', 'Bb', 'D'], type: 'chord'};
			keyMap[B] = { name: 'A minor', notes: ['G', 'C', 'E'], type: 'chord'};
			keyMap[N] = { name: 'Bb major', notes: ['Bb', 'D', 'F'], type: 'chord'};
			keyMap[M] = { name: 'C major', notes: ['C', 'E', 'G'], type: 'chord'};
			break;
		
		case 'D major':
			keyMap[Y] = { name: 'D major', notes: ['D', 'F#', 'A'], type: 'chord'};
			keyMap[X] = { name: 'E minor', notes: ['E', 'G', 'B'], type: 'chord'};
			keyMap[C] = { name: 'F# minor', notes: ['F#', 'A', 'C#'], type: 'chord'};
			keyMap[V] = { name: 'G major', notes: ['G', 'B', 'D'], type: 'chord'};
			keyMap[B] = { name: 'A major', notes: ['A', 'C#', 'E'], type: 'chord'};
			keyMap[N] = { name: 'B minor', notes: ['B', 'D', 'F#'], type: 'chord'};
			keyMap[M] = { name: 'C# diminished', notes: ['C#', 'E', 'G'], type: 'chord'};
			break;
		
		case 'E minor':
			keyMap[Y] = { name: 'E minor', notes: ['E', 'G', 'B'], type: 'chord'};
			keyMap[X] = { name: 'F diminished', notes: ['F#', 'A', 'C'], type: 'chord'};
			keyMap[C] = { name: 'G major', notes: ['G', 'B', 'D'], type: 'chord'};
			keyMap[V] = { name: 'A minor', notes: ['A', 'C', 'E'], type: 'chord'};
			keyMap[B] = { name: 'C major', notes: ['C', 'E', 'G'], type: 'chord'};
			keyMap[N] = { name: 'D major', notes: ['D', 'F#', 'A'], type: 'chord'};
			keyMap[M] = {};
			break;
		
		case 'E major':
			keyMap[Y] = { name: 'E major', notes: ['E', 'G#', 'B'], type: 'chord'};
			keyMap[X] = { name: 'F# minor', notes: ['F#', 'A', 'C#'], type: 'chord'};
			keyMap[C] = { name: 'G# minor', notes: ['G#', 'B', 'D#'], type: 'chord'};
			keyMap[V] = { name: 'A major', notes: ['A', 'C#', 'E'], type: 'chord'};
			keyMap[B] = { name: 'B major', notes: ['B', 'D#', 'F#'], type: 'chord'};
			keyMap[N] = { name: 'C minor', notes: ['C#', 'E', 'G#'], type: 'chord'};
			keyMap[M] = { name: 'D# diminished', notes: ['D#', 'F#', 'A'], type: 'chord'};
			break;
		
		case 'F minor':
			keyMap[Y] = { name: 'F minor', notes: ['F', 'Ab', 'C'], type: 'chord'};
			keyMap[X] = { name: 'G diminished', notes: ['G', 'Bb', 'Db'], type: 'chord'};
			keyMap[C] = { name: 'Ab major', notes: ['Ab', 'C', 'Eb'], type: 'chord'};
			keyMap[V] = { name: 'Bb minor', notes: ['Bb', 'Db', 'F'], type: 'chord'};
			keyMap[B] = { name: 'C minor', notes: ['C', 'Eb', 'G'], type: 'chord'};
			keyMap[N] = { name: 'Db major', notes: ['Db', 'F', 'Ab'], type: 'chord'};
			keyMap[M] = { name: 'Eb major', notes: ['Eb', 'G', 'Bb'], type: 'chord'};
			break;
		
		case 'F major':
			keyMap[Y] = { name: 'F major', notes: ['F', 'A', 'C'], type: 'chord'};
			keyMap[X] = { name: 'G minor', notes: ['G', 'Bb', 'D'], type: 'chord'};
			keyMap[C] = { name: 'A minor', notes: ['A', 'C', 'E'], type: 'chord'};
			keyMap[V] = { name: 'Bb major', notes: ['Bb', 'D', 'F'], type: 'chord'};
			keyMap[B] = { name: 'C major', notes: ['C', 'E', 'G'], type: 'chord'};
			keyMap[N] = { name: 'D minor', notes: ['D', 'F', 'A'], type: 'chord'};
			keyMap[M] = { name: 'E diminished', notes: ['E', 'G', 'Bb'], type: 'chord'};
			break;
		
		case 'G minor':
			keyMap[Y] = { name: 'G minor', notes: ['G', 'Bb', 'D'], type: 'chord'};
			keyMap[X] = { name: 'A diminished', notes: ['A', 'C', 'Eb'], type: 'chord'};
			keyMap[C] = { name: 'Bb major', notes: ['Bb', 'D', 'F'], type: 'chord'};
			keyMap[V] = { name: 'C minor', notes: ['C', 'Eb', 'A'], type: 'chord'};
			keyMap[B] = { name: 'D minor', notes: ['D', 'F', 'A'], type: 'chord'};
			keyMap[N] = { name: 'Eb major', notes: ['Eb', 'G', 'Bb'], type: 'chord'};
			keyMap[M] = { name: 'F major', notes: ['F', 'A', 'C'], type: 'chord'};
			break;
		
		case 'G major':
			keyMap[Y] = { name: 'G major', notes: ['G', 'B', 'D'], type: 'chord'};
			keyMap[X] = { name: 'A minor', notes: ['A', 'C', 'E'], type: 'chord'};
			keyMap[C] = { name: 'B minor', notes: ['B', 'D', 'F#'], type: 'chord'};
			keyMap[V] = { name: 'C major', notes: ['C', 'E', 'G'], type: 'chord'};
			keyMap[B] = { name: 'D major', notes: ['D', 'F#', 'A'], type: 'chord'};
			keyMap[N] = { name: 'E minor', notes: ['E', 'G', 'B'], type: 'chord'};
			keyMap[M] = { name: 'F# diminished', notes: ['F#', 'A', 'C'], type: 'chord'};
			break;

		case 'Olivia Newton John Magic':
			keyMap[Y] = { name: 'D major', notes: ['D', 'E', 'D', 'F#'], type: 'chord'};
			keyMap[X] = { name: 'D7b5', notes: ['D', 'G#', 'C', 'F#'], type: 'chord'};
			keyMap[C] = { name: 'Dmaj9', notes: ['D', 'A', 'C#', 'E'], type: 'chord'};
			keyMap[V] = { name: 'F#min7', notes: ['F#', 'A', 'E', 'C#'], type: 'chord'};
			keyMap[B] = { name: 'A minor', notes: ['A', 'E', 'C', 'E'], type: 'chord'};
			keyMap[N] = { name: 'E minor', notes: ['E', 'G', 'B'], type: 'chord'};
			keyMap[M] = { name: 'Asus4', notes: ['A', 'D', 'A', 'D', 'E'], type: 'chord'};
			keyMap[L] = { name: 'D minor', notes: ['D', 'A', 'D', 'F'], type: 'chord'};
			keyMap[P] = { name: 'Bb', notes: ['A#', 'F', 'A#', 'D', 'F'], type: 'chord'};
			keyMap[O] = { name: 'C/Bb', notes: ['A#', 'E', 'G', 'C', 'E'], type: 'chord'};
			break;
	}

	console.log(arguments[0]);
	keyLog.text(arguments[0]);

	if(arguments[0] == 'Olivia Newton John Magic'){
		keyLog.text(arguments[0] +' (this goes like schmitz katz: interesting sounding: this i go dancing: M M M M N NNN BBBBBB)');
	}
}



























