'use strict';

var CP = {

	detune: 31,

	audioContext: null,
	audioNode: null,

	keyLog: null,
	toneLog: null,
	pitchLog: null,
	chordLog: null,
	taskLog: null,

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

	pressedKeyboardKeys: [],

	currentPitchLabel: '',
	currentPitchIdx: 0,
	currentPitchTable: [
		'C major',
		'D major',
		'E major',
		'F major',
		'G major',
		'A major',
		'B major',
		'Industrial Disease'
	],
	
	tones: [
		{ idx: 'C',  freq: 523.25 *1, label: 'C', 		pos: 0, fill: 0, view: null, vid: 'c1'  },      // 0 C
		{ idx: 'C#', freq: 554.37 *1, label: 'C#/Db', 	pos: 1, fill: 0, view: null, vid: 'c1+' }, // 1
		{ idx: 'D',  freq: 587.33 *1, label: 'D', 		pos: 0, fill: 0, view: null, vid: 'd1'  },      // 2 D
		{ idx: 'D#', freq: 622.25 *1, label: 'D#/Eb', 	pos: 1, fill: 0, view: null, vid: 'd1+' }, // 3
		{ idx: 'E',  freq: 659.25 *1, label: 'E', 		pos: 0, fill: 1, view: null, vid: 'e1'  },      // 4 E
		{ idx: 'F',  freq: 698.46 *1, label: 'F', 		pos: 0, fill: 0, view: null, vid: 'f1'  },      // 5 F
		{ idx: 'F#', freq: 739.99 *1, label: 'F#/Gb', 	pos: 1, fill: 0, view: null, vid: 'f1+' }, // 6
		{ idx: 'G',  freq: 783.99 *1, label: 'G', 		pos: 0, fill: 0, view: null, vid: 'g1'  },      // 7 G
		{ idx: 'G#', freq: 830.61 *1, label: 'G#/Ab', 	pos: 1, fill: 0, view: null, vid: 'g1+' }, // 8
		{ idx: 'A',  freq: 440.00 *2, label: 'A', 		pos: 0, fill: 0, view: null, vid: 'a1'  },	     // 9 A
		{ idx: 'A#', freq: 466.16 *2, label: 'A#/Bb',	pos: 1, fill: 0, view: null, vid: 'a1+' }, // 10
		{ idx: 'B',  freq: 493.88 *2, label: 'B', 		pos: 0, fill: 0, view: null, vid: 'b1'  },      // 11 B
		{ idx: 'C',  freq: 523.25 *2, label: 'C', 		pos: 0, fill: 0, view: null, vid: 'c2'  }       // 12 C
	],

	pitches: [
		{ idx: 'C major', 
			chords: [
				{ idx: 'C major', 		tones: [0, 4, 7], 	label: 'C major CEG' 		}, 
				{ idx: 'D minor', 		tones: [2, 7, 9], 	label: 'D minor DFA' 		}, 
				{ idx: 'E minor', 		tones: [4, 7, 11], 	label: 'E minor EGB' 		},
				{ idx: 'F major', 		tones: [5, 9, 12],	label: 'F major FAC' 		}, 
				{ idx: 'G major', 		tones: [8, 11, 2], 	label: 'G major GBD' 		}, 
				{ idx: 'A minor', 		tones: [9, 12, 4], 	label: 'A minor ACE' 		}, 
				{ idx: 'B diminished', 	tones: [12, 2, 5], 	label: 'B diminished BDF' 	}  
			]
		},
		{ idx: 'D major', 
			chords: [
				{ idx: 'D major', 		tones: [2, 6, 9], 	label: 'D major DF#A' 		},   
				{ idx: 'E minor', 		tones: [4, 7, 11], 	label: 'E minor EGB' 		}, 
				{ idx: 'F# minor', 		tones: [6, 9, 1], 	label: 'F# minor F#AC#' 	}, 
				{ idx: 'G major', 		tones: [8, 11, 2], 	label: 'G major GBD' 		},
				{ idx: 'A major', 		tones: [9, 1, 4], 	label: 'A major AC#E' 		},  
				{ idx: 'B minor', 		tones: [11, 2, 6], 	label: 'B minor BDF#' 		}, 
				{ idx: 'C# diminished', tones: [1, 4, 7], 	label: 'C# diminished C#EG' }  
			]
		},
		{ idx: 'E major', 
			chords: [
				{ idx: 'E major', 		tones: [4, 8, 11], 	label: 'E major EG#B' 		},   
				{ idx: 'F# minor', 		tones: [6, 9, 1], 	label: 'F# minor F#AC#' 	}, 
				{ idx: 'G# minor', 		tones: [8, 11, 3], 	label: 'G# minor G#BD#' 	}, 
				{ idx: 'A major', 		tones: [9, 1, 4], 	label: 'A major AC#E' 		},  
				{ idx: 'B major', 		tones: [8, 11, 2], 	label: 'B major GBD' 		},
				{ idx: 'C minor', 		tones: [1, 4, 8], 	label: 'C minor C#EG#' 		},
				{ idx: 'D# diminished', tones: [3, 6, 9], 	label: 'D# diminished D#F#A' }  
			]
		},
		{ idx: 'F major', 
			chords: [
				{ idx: 'F major', 		tones: [5, 9, 12], 	label: 'F major FAC' 		},   
				{ idx: 'G minor', 		tones: [7, 10, 2], 	label: 'G minor GBbD' 		}, 
				{ idx: 'A minor', 		tones: [9, 12, 4], 	label: 'A minor ACE' 		}, 
				{ idx: 'Bb major', 		tones: [10, 2, 5], 	label: 'Bb major BbDF' 		},  
				{ idx: 'C major', 		tones: [0, 4, 7], 	label: 'C major CEG' 		},
				{ idx: 'D minor', 		tones: [2, 5, 9], 	label: 'D minor DFA' 		},
				{ idx: 'E diminished', 	tones: [4, 7, 11], 	label: 'E diminished EGBb' 	}  
			]
		},
		{ idx: 'G major', 
			chords: [
				{ idx: 'G major', 		tones: [8, 11, 2], 	label: 'G major GBD' 		}, 
				{ idx: 'A minor', 		tones: [9, 12, 4], 	label: 'A minor ACE' 		}, 
				{ idx: 'B minor', 		tones: [11, 2, 6], 	label: 'B minor BDF#' 		}, 
				{ idx: 'C major', 		tones: [0, 4, 7], 	label: 'C major CEG' 		},  
				{ idx: 'D major', 		tones: [4, 6, 9], 	label: 'D major DF#A' 		},
				{ idx: 'E minor', 		tones: [4, 7, 11], 	label: 'E minor EGB' 		},
				{ idx: 'F# diminished', tones: [6, 9, 12], 	label: 'F# diminished F#AC' }  
			]
		},
		{ idx: 'A major', 
			chords: [
				{ idx: 'A major', 		tones: [9, 2, 4], 	label: 'A major AC#E' 		}, 
				{ idx: 'B diminished', 	tones: [11, 2, 5], 	label: 'B diminished BDF' 	}, 
				{ idx: 'C major', 		tones: [0, 4, 7], 	label: 'C major CEG' 		}, 
				{ idx: 'D minor', 		tones: [2, 4, 11], 	label: 'D minor DFA' 		},  
				{ idx: 'E minor', 		tones: [4, 7, 9], 	label: 'E minor EGB' 		},
				{ idx: 'F major', 		tones: [5, 9, 12], 	label: 'F major FAC' 		},
				{ idx: 'G major', 		tones: [7, 11, 2], 	label: 'G major GBD' 		}  
			]
		},
		{ idx: 'B major', 
			chords: [
				{ idx: 'B major', 		tones: [11, 3, 6], 	label: 'BD#F#' 				}, 
				{ idx: 'C minor', 		tones: [1, 4, 8], 	label: 'C minor C#EG#' 		}, 
				{ idx: 'D# minor', 		tones: [3, 6, 10], 	label: 'D# minor D#F#A#' 	}, 
				{ idx: 'E major', 		tones: [4, 8, 11], 	label: 'E major EG#B' 		},  
				{ idx: 'F# major', 		tones: [6, 10, 1], 	label: 'F# major F#A#C#' 	},
				{ idx: 'G# minor', 		tones: [8, 11, 3], 	label: 'G# minor G#BD#' 	},
				{ idx: 'A major', 		tones: [9, 1, 4], 	label: 'A major AC#E' 		}  
			]
		},
		{ idx: 'Industrial Disease', 
			chords: [
				{ idx: 'A major', 		tones: [9, 1, 4], 	label: 'A major AC#E' 		},
				{ idx: 'D major', 		tones: [4, 6, 9], 	label: 'D major DF#A' 		},
				{ idx: 'E major', 		tones: [4, 7, 9], 	label: 'E minor EGB' 		},
				{ idx: 'G major', 		tones: [7, 11, 2], 	label: 'G major GBD' 		}, 
				{ idx: 'D major', 		tones: [4, 6, 9], 	label: 'D major DF#A' 		},
				{ idx: 'C major', 		tones: [12, 4, 7], 	label: 'C major CEG' 		},  
				{ idx: 'B minor', 		tones: [11, 2, 6], 	label: 'B minor BDF#' 		}, 
				{ idx: 'A major', 		tones: [9, 1, 4], 	label: 'A major AC#E' 		},
			]
		}
	],

	initWorkspace: function(){
		CP.log('CP.initWorkspace():', arguments);
		// ----	
		CP.drawBoard();
		CP.keyLog.html('Multiply: ' +CP.multipl);
	},

	drawBoardTouch: function(){
		CP.log('CP.drawBoardTouch():', arguments);

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
		
		var currentPitch = CP.pitches[CP.currentPitchIdx];
		if(null == currentPitch){ 
			return; 
		}

		for(var idx in CP.pressedKeyboardKeys){
			var m = CP.storedKeysMap[CP.pressedKeyboardKeys[idx]];

			if(null == m){ 
				continue; 
			}

			var chord = currentPitch.chords[m];
			
			if(null == chord){ 
				continue
			};

			if(null == chord.tones){ 
				continue; 
			}
			
			for(var i in chord.tones){
				
				var tone = CP.tones[chord.tones[i]];
				if(null == tone){ 
					continue; 
				}

				CP.multiToneOscs[i].frequency.setValueAtTime(
					// tone.freq *CP.multipl, 
					tone.freq, 
					CP.audioNode.currentTime
				);

				CP.multiToneOscs[i].gainNode.gain.setValueAtTime(
					CP.chordToneDefGain, 
					CP.audioNode.currentTime
				);

				// ?? put it some place else
				tone.view.addClass('storetouched');	
    		};

    		CP.chordLog.html(chord.label);
		}
	},

	playSingleTones: function(){
		CP.log('CP.playSingleTones():', arguments);

		for(var idx in CP.pressedKeyboardKeys){
		
			if(idx >= CP.maxSingleToneLen){ 
				return 
			};

			var m = CP.tonesKeyMap[CP.pressedKeyboardKeys[idx]];
			if(null == m){ 
				continue; 
			}

			var tone = CP.tones[m]; 
			if(null == tone){ 
				continue; 
			}

			if(null == CP.singleToneOscs[idx]){ 
				continue; 
			}

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

		for(var idx in CP.currentPitchTable){
			if(arguments[0] == CP.currentPitchTable[idx]){
				CP.currentPitchLabel = CP.currentPitchTable[idx];
				CP.currentPitchIdx = idx;
			}
		}

		CP.pitchLog.html('Pitch: ' +CP.currentPitchLabel);
	},

	shiftPitch: function(){
		CP.log('CP.shiftPitch():', arguments);

		CP.currentPitchIdx++;
		if(CP.currentPitchIdx >= CP.currentPitchTable.length){
			CP.currentPitchIdx = 0;
		}

		CP.currentPitchLabel = CP.currentPitchTable[CP.currentPitchIdx];

		CP.pitchLog.html('Pitch: ' +CP.currentPitchLabel);
	},

	raiseMultipl: function(){
		CP.log('CP.shiftMultipl():', arguments);
		
		if(CP.multipl <= 1){
			CP.multipl *=2;
		}
		else {
			CP.multipl++;
		}
		
		CP.keyLog.html('Multiply: ' +CP.multipl);
	},

	lowerMultipl: function(){
		CP.log('CP.lowerMultipl():', arguments);
		
		CP.multipl--;
		
		if(CP.multipl  < 1){
			CP.multipl = 1;
			CP.multipl /=2;
		}
		
		CP.keyLog.html('Multiply: ' +CP.multipl);
	},

	resetOscs: function(){
		CP.log('CP.resetOscs():', CP.pressedKeyboardKeys);
		
		for(var idx = 0; idx < CP.maxSingleToneLen; idx++){
			CP.singleToneOscs[idx].gainNode.gain.setValueAtTime(0, CP.audioNode.currentTime);
    	};

    	for(var idx = 0; idx < CP.maxChordTonesLen; idx++){
    		CP.multiToneOscs[idx].gainNode.gain.setValueAtTime(0, CP.audioNode.currentTime);
		};
	},

	resetBoardDrawings: function(){
		// removes views
    	for(var idx in CP.tones){
    		CP.tones[idx].view.removeClass('storetouched');	
    		CP.tones[idx].view.removeClass('touched').addClass('released');	
    	};
	},

	touch: function(){
		CP.log('CP.touch():', CP.pressedKeyboardKeys);
		// CP.resetOscs();
		CP.drawBoardTouch();
		CP.playStoredTones();
		CP.playSingleTones();
	},
	
	release: function(){
		CP.log('CP.release():', arguments);
		CP.resetOscs();
		CP.resetBoardDrawings();
    	CP.toneLog.html('');
    	CP.chordLog.html('');
   },

   initKeys: function(){
   		CP.log('CP.initKeys():', arguments);

   		// single keys
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

		// multi keys
		CP.storedKeysMap[Y] = 0; 
		CP.storedKeysMap[X] = 1; 
		CP.storedKeysMap[C] = 2; 
		CP.storedKeysMap[V] = 3; 
		CP.storedKeysMap[B] = 4; 
		CP.storedKeysMap[N] = 5; 
		CP.storedKeysMap[M] = 6; 

		jQuery(document.body).keydown(function(e){	
			// console.log(e.keyCode);
			if(-1 == CP.pressedKeyboardKeys.indexOf(e.keyCode)){
		    	CP.pressedKeyboardKeys.push(e.keyCode);
			    CP.touch();
			}
		});

		jQuery(document.body).keyup(function(e){
		    // console.log(e.keyCode);
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
		    	
		    	default: 
		    	    CP.pressedKeyboardKeys.splice(CP.pressedKeyboardKeys.indexOf(e.keyCode), 1);
					CP.release(); 
					break;
		    }
		});
	},

	tasker: {
		INTERVAL: 25,
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
			// CP.log('CP.takser.start():', arguments);
			CP.tasker.suspend();
			CP.tasker.state = CP.tasker.STATE_RUNNING;
			CP.tasker.run();
		},
		suspend: function(){
			// CP.log('CP.tasker.suspend():', arguments);
			CP.tasker.state = CP.tasker.STATE_SUSPENDED;
			clearInterval(CP.tasker.thread);
			CP.tasker.thread = null;
			CP.taskLog.html('Suspended: ' +(new Date().getTime()));
		},
		run: function(){
			// CP.log('CP.tasker.run():', arguments);		
			CP.taskLog.html('Running: ' +(new Date().getTime()));
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
			var rnd = parseInt((Math.random() *CP.detune) -CP.detune/2);
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
		CP.log('CP.initSingleToneOscs():', arguments);
		
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
		CP.log('CP.initViews():', arguments);

		CP.whites = jQuery('#whites');
		CP.blacks = jQuery('#blacks');
		CP.keyLog = jQuery('#keyLog');
		CP.toneLog = jQuery('#toneLog');
		CP.pitchLog = jQuery('#pitchLog');
		CP.chordLog = jQuery('#chordLog');
		CP.taskLog = jQuery('#taskLog');
	},

	init: function(){
		CP.log('CP.init():', arguments);
		// ---
		CP.initViews();
		CP.initSingleToneOscs();
		CP.initMultiToneOscs();
		CP.initKeys();
		CP.initWorkspace();

		CP.setCurrentPitch('C major');

		CP.tasker.start();
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
