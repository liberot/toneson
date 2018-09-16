var log = $('#log');

// http://pages.mtu.edu/~suits/notefreqs.html
var map = [];
	map[65] = { name: 'A', freq: 440 };
		map[87] = { name: 'A#/Bb', freq: 466.16 };
	
	map[83] = { name: 'B', freq: 493.88 };
	
	map[68] = { name: 'C', freq: 523.25 };
		map[82] = { name: 'C#/Db', freq: 554.37 };
	
	map[70] = { name: 'D', freq: 587.33 };
		map[84] = { name: 'D#/Eb', freq: 622.25 };
	
	map[71] = { name: 'E', freq: 659.25 };
	
	map[72] = { name: 'F', freq: 698.46 };
		map[85] = { name: 'F#/Gb', freq: 739.99 };
	
	map[74] = { name: 'G', freq: 783.99 };
		map[73] = { name: 'G#/Ab', freq: 830.61 };
	
	map[75] = { name: 'A', freq: 880.00 };
	
var defGain = .17;

var keys = [];

var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioCtx = new AudioContext();

var max = 3;
var osc = [];
for (var i = 0; i < max; i++){
	osc.push(audioCtx.createOscillator());
	// osc[i].type = 'sine';
	// osc[i].connect(audioCtx.destination);
	osc[i].gain = audioCtx.createGain();
	osc[i].connect(osc[i].gain);
	osc[i].gain.connect(audioCtx.destination);
	osc[i].gain.gain.setValueAtTime(0, audioCtx.currentTime);
	osc[i].start();
};

$(document.body).keydown(function(e){
	if(-1 == keys.indexOf(e.keyCode)){
    	keys.push(e.keyCode);
    	keyChanged();
	}
});

$(document.body).keyup(function(e){
    keys.splice(keys.indexOf(e.keyCode), 1);
    for(var i = 0; i < max; i++){
    	osc[i].gain.gain.setValueAtTime(0, audioCtx.currentTime);
	}
	keyChanged(); 
});

function keyChanged(){
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
		
		var t = parseInt(m.freq); console.log(m.name, m.freq);

		osc[i].frequency.setValueAtTime(t, audioCtx.currentTime);
		osc[i].gain.gain.setValueAtTime(defGain, audioCtx.currentTime);

		logMessage += m.name  +' ' +m.freq +' ';

	}

	log.text(logMessage);
}
