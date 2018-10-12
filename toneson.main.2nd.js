'use strict';

// var CP = null CP ? {} : CP;

var CP = {

	audioContext: null,
	audioNode: null,

	keyLog: null,
	toneLog: null,
	pitchLog: null,
	chordLog: null,
	whites: null,
	blacks: null,

	maxSingleToneLen: 3,
	maxChordTonesLen: 7,

	singleToneOscs: [],
	multiToneOscs: [],

	tonesKeyMap: [],
	storedKeysMap: [],
	
	singleToneDefGain: 0.17,
	chordToneDefGain: 0.11,


	multipl: 1,

	tasker: null, 

	outBuf: '',

	currentPitchLabel: '',
	currentPitchIdx: 0,
	currentPitchTable: [
		'C major',
		'D major',
		'E major',
		'F major',
		'G major',
		'A major',
		'B major'
	],
	
	tones: [
		{ idx: 'C',  freq: 523.25 *1, label: 'C', pos: 0, fill: 0, view: null, vid: 'c1' },      // 0 C
		{ idx: 'C#', freq: 554.37 *1, label: 'C#/Db', pos: 1, fill: 0, view: null, vid: 'c1+' }, // 1
		{ idx: 'D',  freq: 587.33 *1, label: 'D', pos: 0, fill: 0, view: null, vid: 'd1' },      // 2 D
		{ idx: 'D#', freq: 622.25 *1, label: 'D#/Eb', pos: 1, fill: 0, view: null, vid: 'd1+' }, // 3
		{ idx: 'E',  freq: 659.25 *1, label: 'E', pos: 0, fill: 1, view: null, vid: 'e1' },      // 4 E
		{ idx: 'F',  freq: 698.46 *1, label: 'F', pos: 0, fill: 0, view: null, vid: 'f1' },      // 5 F
		{ idx: 'F#', freq: 739.99 *1, label: 'F#/Gb', pos: 1, fill: 0, view: null, vid: 'f1+' }, // 6
		{ idx: 'G',  freq: 783.99 *1, label: 'G', pos: 0, fill: 0, view: null, vid: 'g1' },      // 7 G
		{ idx: 'G#', freq: 830.61 *1, label: 'G#/Ab', pos: 1, fill: 0, view: null, vid: 'g1+' }, // 8
		{ idx: 'A',  freq: 440.00 *2, label: 'A', pos: 0, fill: 0, view: null, vid: 'a1' },	     // 9 A
		{ idx: 'A#', freq: 466.16 *2, label: 'A#/Bb', pos: 1, fill: 0, view: null, vid: 'a1+' }, // 10
		{ idx: 'B',  freq: 493.88 *2, label: 'B', pos: 0, fill: 0, view: null, vid: 'b1' },      // 11 B
		{ idx: 'C',  freq: 523.25 *2, label: 'C', pos: 0, fill: 0, view: null, vid: 'c2' }       // 12 C
	],

	// as in c minor
	chords: [
		{ idx: 'C major', tones: [0, 4, 7], label: 'C major CEG' },   // CEG
		{ idx: 'D minor', tones: [2, 7, 9], label: 'D minor DFA' },   // DFA
		{ idx: 'E minor', tones: [4, 7, 11], label: 'E minor EGB' },  // EGB
		{ idx: 'F major', tones: [5, 9, 12], label: 'F major FAC' },  // FAC
		{ idx: 'G major', tones: [8, 11, 2], label: 'G major GBD' },  // GBD
		{ idx: 'A minor', tones: [9, 12, 4], label: 'A minor ACE' },  // ACE
		{ idx: 'B diminished', tones: [12, 2, 5], label: 'B diminished BDF' },  // BDF
	],

	pressedKeyboardKeys: [],

	drawWorkspace: function(){
		CP.log('CP.drawWorkspace():', arguments);
		// ----	
		CP.drawBoard();
		CP.keyLog.html(CP.multipl);
	},

	drawBoardTouch: function(){
		CP.outBuf = '';
		for(var idx in CP.pressedKeyboardKeys){
			var m = CP.tonesKeyMap[CP.pressedKeyboardKeys[idx]];
			if(null != m){
				if(null != CP.tones[m]){
					if(null != CP.tones[m].view){
						CP.tones[m].view.removeClass('released').addClass('touched');
						CP.outBuf += CP.tones[m].idx +'   ';
					}
				}
			}
		};
		CP.toneLog.html(CP.outBuf)			
	},

	playStoredTones: function(){
		CP.log('CP.playStoredTones():', arguments);
		
		for(var idx in CP.pressedKeyboardKeys){
			var m = CP.storedKeysMap[CP.pressedKeyboardKeys[idx]];

			if(null == m){ continue; }

			var chord = CP.chords[m];

			if(null == chord){ continue};
			if(null == chord.tones){ continue; }
			
			for(var i in chord.tones){
				
				var tone = CP.tones[chord.tones[i]];
				if(null == tone){ continue; }

				CP.multiToneOscs[i].frequency.setValueAtTime(
					tone.freq *CP.multipl, 
					CP.audioNode.currentTime
				);

				CP.multiToneOscs[i].gainNode.gain.setValueAtTime(
					CP.chordToneDefGain, 
					CP.audioNode.currentTime
				);
    		};

    		CP.chordLog.html(chord.label);
		}
	},

	playSingleTone: function(){
		CP.log('CP.playSingleTone():', arguments);

		for(var idx in CP.pressedKeyboardKeys){
		
			if(idx >= CP.maxSingleToneLen){ continue };

			var m = CP.tonesKeyMap[CP.pressedKeyboardKeys[idx]];
			if(null == m){ continue; }

			var tone = CP.tones[m]; 
			if(null == tone){ continue; }

			if(null == CP.singleToneOscs[idx]){ continue; }

			CP.singleToneOscs[idx].frequency.setValueAtTime(
				tone.freq *CP.multipl, 
				CP.audioNode.currentTime
			);
			CP.singleToneOscs[idx].gainNode.gain.setValueAtTime(
				CP.singleToneDefGain, 
				CP.audioNode.currentTime
			);
		}
	},

	setCurrentPitch: function(){
		CP.log('CP.setCurrentPitch():', arguments);

		var pidx = 0;
		for(var idx in CP.currentPitchTable){
			if(arguments[0] == CP.currentPitchTable[idx]){
				CP.currentPitchLabel = CP.currentPitchTable[idx];
				CP.currentPitchIdx = idx;
			}
		}

		CP.pitchLog.html(CP.currentPitchLabel);
	},

	shiftPitch: function(){
		CP.log('CP.shiftPitch():', arguments);

		CP.currentPitchIdx++;
		if(CP.currentPitchIdx >= CP.currentPitchTable.length){
			CP.currentPitchIdx = 0;
		}

		CP.currentPitchLabel = CP.currentPitchTable[CP.currentPitchIdx];
	
		CP.pitchLog.html(CP.currentPitchLabel);
	},

	raiseMultipl: function(){
		CP.log('CP.shiftMultipl():', arguments);
		if(CP.multipl <= 1){
			CP.multipl *=2;
		}
		else {
			CP.multipl++;
		}
		CP.keyLog.html(CP.multipl);
	},

	lowerMultipl: function(){
		CP.log('CP.lowerMultipl():', arguments);
		CP.multipl--;
		if(CP.multipl <= 1){
			CP.multipl = 1;
			CP.multipl /=2;
		}
		CP.keyLog.html(CP.multipl);
	},

	touch: function(){
		CP.log('CP.touch():', CP.pressedKeyboardKeys);
		// ----
		CP.drawBoardTouch();
		CP.playStoredTones();
		CP.playSingleTone();
	},
	
	release: function(){
		CP.log('CP.release():', arguments);

		for(var idx = 0; idx < CP.maxSingleToneLen; idx++){
			CP.singleToneOscs[idx].gainNode.gain.setValueAtTime(0, CP.audioNode.currentTime);
    	};

    	for(var idx = 0; idx < CP.maxChordTonesLen; idx++){
    		CP.multiToneOscs[idx].gainNode.gain.setValueAtTime(0, CP.audioNode.currentTime);
		};
		
    	for(var idx in CP.tones){
    		CP.tones[idx].view.removeClass('touched').addClass('released');	
    	};

    	CP.toneLog.html('');
    	CP.chordLog.html('');
   },

   initKeys: function(){
   		CP.log('CP.initKeys():', arguments);

   		CP.tonesKeyMap[A] =  0; // C
		CP.tonesKeyMap[W] =  1; // C#
		CP.tonesKeyMap[S] =  2; // D
		CP.tonesKeyMap[E] =  3; // D#
		CP.tonesKeyMap[D] =  4; // E
		CP.tonesKeyMap[F] =  5; // F
		CP.tonesKeyMap[T] =  6; // F#
		CP.tonesKeyMap[G] =  7; // G
		CP.tonesKeyMap[Z] =  8; // G#
		CP.tonesKeyMap[H] =  9; // A
		CP.tonesKeyMap[U] = 10; // A#
		CP.tonesKeyMap[J] = 11; // B
		CP.tonesKeyMap[K] = 12; // C

		// as in c major
		CP.storedKeysMap[Y] = 0; // C major
		CP.storedKeysMap[X] = 1; // D minor
		CP.storedKeysMap[C] = 2; // E minor
		CP.storedKeysMap[V] = 3; // F major
		CP.storedKeysMap[B] = 4; // G major
		CP.storedKeysMap[N] = 5; // A minor
		CP.storedKeysMap[M] = 6; // B diminished

		jQuery(document.body).keydown(function(e){	
			// console.log(e.keyCode);
			// 
			if(-1 == CP.pressedKeyboardKeys.indexOf(e.keyCode)){
		    	CP.pressedKeyboardKeys.push(e.keyCode);
			    CP.touch();
			}
		});

		jQuery(document.body).keyup(function(e){
		    // console.log(e.keyCode);
		    //  
		    switch(e.keyCode){
		    	case _1:
		    		CP.lowerMultipl();
		    		break;
		    	case _2:
		    		CP.raiseMultipl();
		    		break;
		    	case _3:
		    		CP.tasker.toggle();
		    		break;
		    	case _4:
		    		CP.shiftPitch();
		    		break;
		    }
		    // 
		    CP.pressedKeyboardKeys.splice(CP.pressedKeyboardKeys.indexOf(e.keyCode), 1);
			CP.release(); 
		});
	},

	tasker: {
		INTERVAL: 1000,
		STATE_SUSPENDED: 0x00,
		STATE_RUNNING: 0x01,
		state: 0x00,
		thread: null,
		toggle: function(){
			switch(CP.tasker.state){
				case CP.tasker.STATE_SUSPENDED:
					CP.tasker.start();
					break;
				case CP.tasker.STATE_RUNNING: 
					CP.tasker.suspend();
					break;
			}
		},
		start: function(){
			CP.log('CP.takser.start():', arguments);
			CP.tasker.suspend();
			CP.tasker.state = CP.tasker.STATE_RUNNING;
			CP.tasker.run();
		},
		suspend: function(){
			CP.log('CP.tasker.suspend():', arguments);
			CP.tasker.state = CP.tasker.STATE_SUSPENDED;
			clearInterval(CP.tasker.thread);
			CP.tasker.thread = null;
		},
		run: function(){
			CP.log('CP.tasker.run():', arguments);		
			if(CP.tasker.isLooping()){
				CP.tasker.thread = setInterval(CP.tasker.start, CP.tasker.INTERVAL);
			}
		},
	 	isLooping: function(){
			return CP.tasker.STATE_RUNNING == CP.tasker.state ? true : false;
		}
	},

	initMultiToneOscs: function(){
		CP.log('CP.initMultiToneOscs():', arguments);
		for (var idx = 0; idx < CP.maxChordTonesLen; idx++){
			CP.multiToneOscs.push(CP.audioNode.createOscillator());
			// CP.singleToneOscs[i].type = 'sine';
			var rnd = parseInt((Math.random() *16) -8);
			CP.log('detune: ', rnd);
			CP.multiToneOscs[idx].detune.value = rnd;
			CP.multiToneOscs[idx].gainNode = CP.audioNode.createGain();
			CP.multiToneOscs[idx].connect(CP.multiToneOscs[idx].gainNode);
			CP.multiToneOscs[idx].gainNode.connect(CP.audioNode.destination);
			CP.multiToneOscs[idx].gainNode.gain.setValueAtTime(0, CP.audioNode.currentTime);
			CP.multiToneOscs[idx].start();
		};
	},

	initSingleToneOscs: function(){
		CP.audioContext = window.AudioContext || window.webkitAudioContext;
		CP.audioNode = new AudioContext();

		for (var idx = 0; idx < CP.maxSingleToneLen; idx++){
			CP.singleToneOscs.push(CP.audioNode.createOscillator());
			// CP.singleToneOscs[i].type = 'sine';
			CP.singleToneOscs[idx].gainNode = CP.audioNode.createGain();
			CP.singleToneOscs[idx].connect(CP.singleToneOscs[idx].gainNode);
			CP.singleToneOscs[idx].gainNode.connect(CP.audioNode.destination);
			CP.singleToneOscs[idx].gainNode.gain.setValueAtTime(0, CP.audioNode.currentTime);
			CP.singleToneOscs[idx].start();
		};
	},

	drawBoard: function(){
		CP.log('CP.drawBoard():', arguments);

		for(var idx in CP.tones){
			var vid = CP.tones[idx].vid;
			if(0 == CP.tones[idx].pos){
				var buf = jQuery('<div id="#'+vid+'"></div>');
				CP.whites.append(buf);
				CP.tones[idx].view = buf;
				if(1 == CP.tones[idx].fill){
					var buf = jQuery('<div class="hidden"></div>');
					CP.blacks.append(buf);
				};
			}
			else if(1 == CP.tones[idx].pos){
				var buf = jQuery('<div id="#'+vid+'" class="dark"></div>');
				CP.blacks.append(buf);
				CP.tones[idx].view = buf;
			}
		};
	},

	initViews: function(){
		CP.whites = jQuery('#whites');
		CP.blacks = jQuery('#blacks');
		CP.keyLog = jQuery('#keyLog');
		CP.toneLog = jQuery('#toneLog');
		CP.pitchLog = jQuery('#pitchLog');
		CP.chordLog = jQuery('#chordLog');
	},

	init: function(){
		CP.log('CP.init():', arguments);
		// ---
		CP.initViews();
		CP.initSingleToneOscs();
		CP.initMultiToneOscs();
		CP.initKeys();
		CP.drawWorkspace();

		CP.setCurrentPitch('C major');
	},

	log: function(){
		console.log(arguments)
	}
}

// sets key codes
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
	O = 79,
	E = 69,
	K = 75,
   _1 = 49,
   _2 = 50,
   _3 = 51,
   _4 = 52,
	Z = 90;

// inits
jQuery(document).ready(function(){
	CP.init();
});
