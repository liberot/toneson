// https://developer.mozilla.org/en-US/docs/Web/API/AudioContext
var log = jQuery('#log');

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
var audioNode = new AudioContext();

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

jQuery(document.body).keydown(function(e){
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

		osc[i].frequency.setValueAtTime(t, audioNode.currentTime);
		osc[i].gainNode.gain.setValueAtTime(defGain, audioNode.currentTime);

		logMessage += m.name  +' ' +m.freq +' ';
	};

	log.text(logMessage);
}
