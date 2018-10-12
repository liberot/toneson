'use strict';

// var CP = null CP ? {} : CP;

var CP = {

	AudioContext: null,
	audioNode: null,

	keyLog: null,
	msgLog: null,
	whites: null,
	blacks: null,

	maxSingleToneLen: 3,

	singleToneOscs: [],

	tonesKeyMap: [],
	
	singleToneDefGain: .17,

	outBuf: '',

	tones: [
		{ idx: 'C',  freq: 523.25 *1, label: 'C', pos: 0, fill: 0, view: null, m: 1, vid: 'c' },
		{ idx: 'C#', freq: 554.37 *1, label: 'C#/Db', pos: 1, fill: 0, view: null, m: 1, vid: 'c_' },
		{ idx: 'D',  freq: 587.33 *1, label: 'D', pos: 0, fill: 0, view: null, m: 1, vid: 'd' },
		{ idx: 'D#', freq: 622.25 *1, label: 'D#/Eb', pos: 1, fill: 0, view: null, m: 1, vid: 'd_' },
		{ idx: 'E',  freq: 659.25 *1, label: 'E', pos: 0, fill: 1, view: null, m: 1, vid: 'e' },
		{ idx: 'F',  freq: 698.46 *1, label: 'F', pos: 0, fill: 0, view: null, m: 1, vid: 'f' },
		{ idx: 'F#', freq: 739.99 *1, label: 'F#/Gb', pos: 1, fill: 0, view: null, m: 1, vid: 'f_' },
		{ idx: 'G',  freq: 783.99 *1, label: 'G', pos: 0, fill: 0, view: null, m: 1, vid: 'g' },
		{ idx: 'G#', freq: 830.61 *1, label: 'G#/Ab', pos: 1, fill: 0, view: null, m: 1, vid: 'g_' },
		{ idx: 'A',  freq: 440.00 *2, label: 'A', pos: 0, fill: 0, view: null, m: 1, vid: 'a' },	
		{ idx: 'A#', freq: 466.16 *2, label: 'A#/Bb', pos: 1, fill: 0, view: null, m: 1, vid: 'a_' },
		{ idx: 'B',  freq: 493.88 *2, label: 'B', pos: 0, fill: 0, view: null, m: 1, vid: 'b' },
	
		{ idx: 'C',  freq: 523.25 *2, label: 'C', pos: 0, fill: 0, view: null, m: 1, vid: 'c2' }
	],

	pressedKeyboardKeys: [],

	drawWorkspace: function(){
		CP.log('CP.drawWorkspace:', arguments);
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
		CP.msgLog.html(CP.outBuf)			
	},

	play: function(){

		for(var idx in CP.pressedKeyboardKeys){
			
			if(idx >= CP.maxSingleToneLen){ continue };

			var m = CP.tonesKeyMap[CP.pressedKeyboardKeys[idx]];
			if(null == m){ continue; }

			var tone = CP.tones[m]; 
			if(null == tone){ continue; }

			if(null == CP.singleToneOscs[idx]){ continue; }

			CP.singleToneOscs[idx].frequency.setValueAtTime(tone.freq, CP.audioNode.currentTime);
			CP.singleToneOscs[idx].gainNode.gain.setValueAtTime(CP.singleToneDefGain, CP.audioNode.currentTime);
		}
	},

	shiftKeyPad: function(){

	},

	touch: function(){
		CP.log(CP.pressedKeyboardKeys);
		CP.drawBoardTouch();
		CP.play();
	},
	
	release: function(){
		for(var idx = 0; idx < CP.maxSingleToneLen; idx++){
			CP.singleToneOscs[idx].gainNode.gain.setValueAtTime(0, CP.audioNode.currentTime);
    	};
    	for(var idx in CP.tones){
    		CP.tones[idx].view.removeClass('touched').addClass('released');	
    	};
    	CP.msgLog.html('');
   },

	initKeys: function(){
	
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

		jQuery(document.body).keydown(function(e){	
			// console.log(e.keyCode);
			if(Q == e.keyCode){
				CP.shiftKeyPad();
			}
			if(-1 == CP.pressedKeyboardKeys.indexOf(e.keyCode)){
		    	CP.pressedKeyboardKeys.push(e.keyCode);
			    CP.touch();
			}
		});

		jQuery(document.body).keyup(function(e){
		    CP.pressedKeyboardKeys.splice(CP.pressedKeyboardKeys.indexOf(e.keyCode), 1);
			CP.release(); 
		});
	},

	initOscs: function(){
		CP.AudioContext = window.AudioContext || window.webkitAudioContext;
		CP.audioNode = new AudioContext();

		for (var idx = 0; idx < CP.maxSingleToneLen; idx++){
			CP.singleToneOscs.push(CP.audioNode.createOscillator());
			// singleToneOscs[i].type = 'sine';
			CP.singleToneOscs[idx].gainNode = CP.audioNode.createGain();
			CP.singleToneOscs[idx].connect(CP.singleToneOscs[idx].gainNode);
			CP.singleToneOscs[idx].gainNode.connect(CP.audioNode.destination);
			CP.singleToneOscs[idx].gainNode.gain.setValueAtTime(0, CP.audioNode.currentTime);
			CP.singleToneOscs[idx].start();
		};
	},

	drawBoard: function(){
		CP.log('drawBoard:', arguments);

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

	init: function(){
		CP.log('CP.init', arguments);

		CP.whites = jQuery('#whites');
		CP.blacks = jQuery('#blacks');
		CP.keyLog = jQuery('#keyLog');
		CP.msgLog = jQuery('#msgLog');

		CP.initOscs();
		CP.initKeys();
		CP.drawBoard();
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
	Z = 90;

// inits
jQuery(document).ready(function(){
	CP.init();
});
