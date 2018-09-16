// https://developer.mozilla.org/en-US/docs/Web/API/AudioContext
var log = jQuery('#log');

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

var map = [];
	map[65] = { notes: ['A'], type: 'single' };
		map[87] = { notes: ['B'], type: 'single' };
	map[83] = { notes: ['C'], type: 'single' };
	map[68] = { notes: ['D'], type: 'single' };
		map[82] = { notes: ['C#/Db'], freq: 554.37, type: 'single' };
	map[70] = { notes: ['D'], type: 'single' };
		map[84] = { notes: ['D#/Eb'], type: 'single' };
	map[71] = { notes: ['E'], type: 'single' };
	map[72] = { notes: ['F'], type: 'single' };
		map[85] = { notes: ['F#/Gb'], type: 'single' };
	map[74] = { notes: ['G'], type: 'single' };
		map[73] = { notes: ['G#/Ab'], type: 'single' };

	map[89] = { name: 'A minor', notes: ['A', 'C', 'E'], type: 'chord'};
	map[88] = { name: 'B diminished', notes: ['B', 'D', 'F'], type: 'chord'};
	map[67] = { name: 'C major', notes: ['C', 'E', 'G'], type: 'chord'};
	map[86] = { name: 'D minor', notes: ['D', 'F', 'A'], type: 'chord'};
	map[66] = { name: 'E minor', notes: ['E', 'G', 'B'], type: 'chord'};
	map[78] = { name: 'F major', notes: ['F', 'A', 'C'], type: 'chord'};
	map[77] = { name: 'G major', notes: ['G', 'B', 'D'], type: 'chord'};

var defGain = .17;

var keys = [];

var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioNode = new AudioContext();

// osc single keys
var max = 3;
var osc = [];
for (var i = 0; i < max; i++){
	osc.push(audioNode.createOscillator());
	// osc[i].type = 'sine';
	// osc[i].connect(audioNode.destination);
	osc[i].gainNode = audioNode.createGain();
	osc[i].connect(osc[i].gainNode);
	osc[i].gainNode.connect(audioNode.destination);
	osc[i].gainNode.gain.setValueAtTime(0, audioNode.currentTime);
	osc[i].start();
};

// osc chords
var chordOsc = [];
for (var i = 0; i < 3; i++){
	chordOsc.push(audioNode.createOscillator());
	// osc[i].type = 'sine';
	// osc[i].connect(audioNode.destination);
	chordOsc[i].gainNode = audioNode.createGain();
	chordOsc[i].connect(chordOsc[i].gainNode);
	chordOsc[i].gainNode.connect(audioNode.destination);
	chordOsc[i].gainNode.gain.setValueAtTime(0, audioNode.currentTime);
	chordOsc[i].start();
};


jQuery(document.body).keydown(function(e){
	// console.log(e.keyCode);
	if(-1 == keys.indexOf(e.keyCode)){
    	keys.push(e.keyCode);
    	touch();
	}
});

jQuery(document.body).keyup(function(e){
    keys.splice(keys.indexOf(e.keyCode), 1);
    release(); 
});

function touch(){
   	play();
};

function release(){
	for(var i = 0; i < max; i++){
    	osc[i].gainNode.gain.setValueAtTime(0, audioNode.currentTime);
	}
	for(var i = 0; i < 3; i++){
    	chordOsc[i].gainNode.gain.setValueAtTime(0, audioNode.currentTime);
	}
	play();
}

function play(){
	
	var logMessage = '';
	
	for(var i in keys){
		
		if(i >= max){ 
			continue 
		};
		
		var m = map[keys[i]];

		if(null == m){ 
			continue; 
		}

		if('single' == m.type){
			var note = notes[m.notes[0]]; 
			if(null == note){
				continue;
			}
			console.log(note.name, note.freq);
			osc[i].frequency.setValueAtTime(note.freq, audioNode.currentTime);
			osc[i].gainNode.gain.setValueAtTime(defGain, audioNode.currentTime);
			logMessage += note.name  +' ' +note.freq +' ';
		}	
		else if('chord' == m.type){
			for(var i in m.notes){
				var note = notes[m.notes[i]]; 
				if(null == note){
					continue;
				}
				chordOsc[i].frequency.setValueAtTime(note.freq, audioNode.currentTime);
				chordOsc[i].gainNode.gain.setValueAtTime(defGain, audioNode.currentTime);
				logMessage += note.name +' ';	
			};
			logMessage = m.name +' ' +logMessage +' ';	
			
		}	
	};

	log.text(logMessage);
}
