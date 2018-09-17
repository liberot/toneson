// https://developer.mozilla.org/en-US/docs/Web/API/AudioContext
var log = jQuery('#log');
var keyLog = jQuery('#keyLog')

var keys = [
	'A minor',
	'A major',
	'B minor'
];

var currentKeyIndex = 0;

// http://pages.mtu.edu/~suits/notefreqs.html
var notes = [];
	notes['A'] = { name: 'A', freq: 440 };
	notes['A#/Bb'] = { name: 'A#/Bb', freq: 466.16 };
	notes['B'] = { name: 'B', freq: 493.88 };
	notes['C'] = { name: 'C', freq: 523.25 };
	notes['C#/Db'] = { name: 'C#/Db', freq: 554.37 };
	notes['D'] = { name: 'D', freq: 587.33 };
	notes['D#/Eb'] = { name: 'D#/Eb', freq: 622.25 };
	notes['E'] = { name: 'E', freq: 659.25 };
	notes['F'] = { name: 'F', freq: 698.46 };
	notes['F#/Gb'] = { name: 'F#/Gb', freq: 739.99 };
	notes['G'] = { name: 'G', freq: 783.99 };
	notes['G#/Ab'] = { name: 'G#/Ab', freq: 830.61 };

var keyMap = [];
	keyMap[65] = { notes: ['A'], type: 'single' };
		keyMap[87] = { notes: ['A#/Bb'], type: 'single' };
	keyMap[83] = { notes: ['B'], type: 'single' };
	keyMap[68] = { notes: ['C'], type: 'single' };
		keyMap[82] = { notes: ['C#/Db'], type: 'single' };
	keyMap[70] = { notes: ['D'], type: 'single' };
		keyMap[84] = { notes: ['D#/Eb'], type: 'single' };
	keyMap[71] = { notes: ['E'], type: 'single' };
	keyMap[72] = { notes: ['F'], type: 'single' };
		keyMap[85] = { notes: ['F#/Gb'], type: 'single' };
	keyMap[74] = { notes: ['G'], type: 'single' };
		keyMap[73] = { notes: ['G#/Ab'], type: 'single' };
	keyMap[75] = { notes: ['A'], type: 'single' };
	
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
	chordOscs[i].gainNode = audioNode.createGain();
	chordOscs[i].connect(chordOscs[i].gainNode);
	chordOscs[i].gainNode.connect(audioNode.destination);
	chordOscs[i].gainNode.gain.setValueAtTime(0, audioNode.currentTime);
	chordOscs[i].start();
};


jQuery(document.body).keydown(function(e){
	// console.log(e.keyCode);
	if(-1 == pressedKeyboardKeys.indexOf(e.keyCode)){
    	pressedKeyboardKeys.push(e.keyCode);
    	// special modifier key
    	if(81 == e.keyCode){
    		shiftKey();
    		return;
    	}
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
	play();
};

function release(){
	for(var i = 0; i < maxSingleNoteLen; i++){
    	singleNoteOscs[i].gainNode.gain.setValueAtTime(0, audioNode.currentTime);
	}
	for(var i = 0; i < maxChordNoteLen; i++){
    	chordOscs[i].gainNode.gain.setValueAtTime(0, audioNode.currentTime);
	}
	play();
}

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
			for(var i in m.notes){
				if(i >= maxChordNoteLen){
					continue;
				}
				var note = notes[m.notes[i]]; 
				if(null == note){
					continue;
				}
				chordOscs[i].frequency.setValueAtTime(note.freq, audioNode.currentTime);
				chordOscs[i].gainNode.gain.setValueAtTime(chordNoteDefGain, audioNode.currentTime);
				logMessage += note.name +' ';	
			};
			console.log(m.name, m.notes);
			logMessage = m.name +' ' +logMessage +' ';	
		}	
	};

	log.text(logMessage);
}

function setKeyOfChords(){

	switch(arguments[0]){
		
		case 'A minor':
			keyMap[89] = { name: 'A minor', notes: ['A', 'C', 'E'], type: 'chord'};
			keyMap[88] = { name: 'B diminished', notes: ['B', 'D', 'F'], type: 'chord'};
			keyMap[67] = { name: 'C major', notes: ['C', 'E', 'G'], type: 'chord'};
			keyMap[86] = { name: 'D minor', notes: ['D', 'F', 'A'], type: 'chord'};
			keyMap[66] = { name: 'E minor', notes: ['E', 'G', 'B'], type: 'chord'};
			keyMap[78] = { name: 'F major', notes: ['F', 'A', 'C'], type: 'chord'};
			keyMap[77] = { name: 'G major', notes: ['G', 'B', 'D'], type: 'chord'};
			break;

		case 'A major':
			keyMap[89] = { name: 'A major', notes: ['A', 'C#/Db', 'E'], type: 'chord'};
			keyMap[88] = { name: 'B minor', notes: ['B', 'D', 'F#/Gb'], type: 'chord'};
			keyMap[67] = { name: 'C#/Db minor', notes: ['C#/Db', 'E', 'G#/Ab'], type: 'chord'};
			keyMap[86] = { name: 'D major', notes: ['D', 'F#/Gb', 'A'], type: 'chord'};
			keyMap[66] = { name: 'E major', notes: ['E', 'G#/Ab', 'B'], type: 'chord'};
			keyMap[78] = { name: 'F#/Gb minor', notes: ['F#/Gb', 'A', 'C#/Db'], type: 'chord'};
			keyMap[77] = { name: 'G diminished', notes: ['G#/Ab', 'B', 'D'], type: 'chord'};
			break;

		case 'B minor':
			keyMap[89] = { name: 'B minor', notes: ['B', 'D', 'F#/Gb'], type: 'chord'};
			keyMap[88] = { name: 'C diminished', notes: ['C#/Db', 'E', 'G'], type: 'chord'};
			keyMap[67] = { name: 'D major', notes: ['D', 'F#/Gb', 'A'], type: 'chord'};
			keyMap[86] = { name: 'E minor', notes: ['E', 'G', 'B'], type: 'chord'};
			keyMap[66] = { name: 'F#/Gb minor', notes: ['F#/Gb', 'A', 'C#/Db'], type: 'chord'};
			keyMap[78] = { name: 'G major', notes: ['G', 'B', 'D'], type: 'chord'};
			keyMap[77] = { name: 'A major', notes: ['A', 'C#/Db', 'E'], type: 'chord'};
			break;
	}

	console.log(arguments[0]);
	keyLog.text(arguments[0]);
}










