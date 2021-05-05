function $i(str){ return document.getElementById(str);}

var MdT		= null;
var fps		= 1;
var writer  = null;
var dBlock	= false;

window.onload = function(){
	writer = new Writer(function(val){
		var str = val.V.substring(0,val.I);
		if(val.I!=-1) str+='<span style="color: red; ">'+val.V.substring(val.I,val.I+1)+"</span>";
		str+=val.V.substring(val.I+1,val.V.length);
		$i("nastro").innerHTML = str;
		$i("nastro").scrollLeft = (val.I-13)* 16 ;
	});
	
	$i("nastro").innerHTML = "";
	$i("Stati_txta").style.display 	= "none";
	
	$i("nastro").onkeypress			= (e) => {
		 if (e.keyCode == 13) {
			e.preventDefault();
			return false;
		 }
		if(MdT==null) 
			creaMdT();
		
	};
	$i("nastro").onkeyup			= (e) => {
		MdT.loadNastro($i("nastro").textContent); 
	};
	$i("nastro").onclick			= () => {
		MdT.loadNastro($i("nastro").textContent); 
	};
	
			
	$i("enableState").onclick 		= () => {cliccato();};
	$i("nastro").onclick 			= () => {
		if(MdT==null) 
			creaMdT(); 
		if(MdT!=null){
			if(!MdT.isReady()) MdT.loadNastro($i("nastro").textContent); 
			else MdT.reloadOld();
		}
		$i("endBtn").enable = true;
		$i("nextBtn").enable = true;
	};
	$i("loadNa").onclick		= () => {
		if(MdT!=null){
			creaMdT(); 
			writer.write({V:"", I:-1});			
		}
			$i("endBtn").enable = true;
			$i("nextBtn").enable = true;
	};
	$i("endBtn").onclick		= () => {
		if(MdT==null) 
			creaMdT(); 
		if(MdT!=null){
			if(!MdT.isReady() && !MdT.isEnded()) MdT.loadNastro($i("nastro").textContent); 
			else MdT.reloadOld();
			
			var resa  = MdT.doProduction();
			if(resa.res!="ERROR")
				writer.write({V: resa.res.toString().replaceAll(",",""), I:resa.indice});
			
			$i("endBtn").enable = false;
			$i("nextBtn").enable = false;
		}
	};
	$i("nextBtn").onclick		= () => {
		if(MdT==null) 
			creaMdT(); 
		if(MdT!=null){
			if(!MdT.isReady() && !MdT.isEnded()) 
				MdT.loadNastro($i("nastro").textContent);
			var resa = MdT.next();
			if(resa.res!="ERROR")
				writer.write({V: resa.res.toString().replaceAll(",",""), I:resa.indice});
			if(resa.Istance.getState().getType()==2){
				writer.write({V: resa.res.toString().replaceAll(",",""), I:-1});
			} 
		}
	};
	$i("beforeBtn").onclick		= () => {
		if(MdT==null) 
			creaMdT(); 
		if(MdT!=null){
			if(!MdT.isReady()) 
				MdT.loadNastro($i("nastro").textContent);
			var resa = MdT.before();
			console.log(resa);
			if(resa.res!="ERROR")
				writer.write({V: resa.res.toString().replaceAll(",",""), I:resa.indice});
			if(resa.Istance.getState().getType()==0){
				MdT.reset();
			} 
			$i("endBtn").enable = true;
			$i("nextBtn").enable = true;
		}
	};
	$i("pauseBtn").onclick		= () => {
		if(MdT==null) 
			creaMdT(); 
		
		if(MdT!=null){
			if(!MdT.isReady()) 
				MdT.loadNastro($i("nastro").textContent);
			fps = 0;
		}
	};
	$i("runTimeBtn").onclick	= () => {
		if(MdT==null) 
			creaMdT(); 
		var tipo=0;
		fps = $i("speedRange").value;
		if(MdT!=null){
			function loadedd(){
				if(!MdT.isReady() && !MdT.isEnded()) 
					MdT.loadNastro($i("nastro").textContent);
				var resa = MdT.next();
				tipo=resa.Istance.getState().getType();
				if(resa.res!="ERROR")
					writer.write({V: resa.res.toString().replaceAll(",",""), I:resa.indice});
				if(resa.Istance.getState().getType()==2){
					writer.write({V: resa.res.toString().replaceAll(",",""), I:-1});
				}
				if(fps!=0)
					setTimeout(function(){if(tipo!=2) loadedd();}, 1000/fps);
			}
			loadedd();
		}
	};
	
	$i("speedRange").onmousemove = () => {
		if(event.buttons==1)
			fps = $i("speedRange").value;
	};
	
	$i("help_div").style.display = "none";
	$i("help_return").onclick	= () => {
		$i("help_div").style.display = $i("help_div").style.display!="block" ? "block":"none";
	}
	$i("help_btn").onclick	= () => {
		$i("help_div").style.display = $i("help_div").style.display!="block" ? "block":"none";
		resizeAll();
	}
	
	$i("file-selector").addEventListener('change', (event) => {
		openFile(event.target.files[0]);
	});
	
	resizeAll();
};

window.onresize = () => {resizeAll();};


function creaMdT(){
	if($i("Produzioni_txta").value!="")
		MdT = new TuringMachine($i("Produzioni_txta").value,$i("Stati_txta").value);
	
}

function cliccato(){
	var checkBox = $i("enableState");

	if (checkBox.checked == true){
		$i("Stati_txta").style.display = "block";
	} else {
		$i("Stati_txta").style.display = "none";
	}
	resizeAll();
}


function openFile(files){
	var file = files;
	var reader = new FileReader();
	
	reader.onload = function(event) {
		var testo = event.target.result;
		//console.log((testo).replaceAll("\r\n","\\n"));
		var prg = (JSON.parse((testo).replaceAll("\r\n","\\n")));
		$i("Produzioni_txta").value = prg.Produzioni;
		$i("Stati_txta").value = prg.StatiFinali;
	};


	reader.readAsText($i("file-selector").files[0]);
}


function resizeAll(){
	var divPrinc = $i("div_d1");
	var statTxta = $i("Stati_txta");
	var btnLista = $i("button_div");
	
	$i("help_txt").style.height				= ($i("help_frame").offsetHeight-70)+"px";
	$i("nastro").style.width				= (window.innerWidth/10*5.5)+" px";
	
	$i("help_return").style.marginLeft		= ($i("help_frame").offsetWidth-$i("help_return").offsetWidth)/2+"px";
	
	if(window.innerHeight<450) return;
	
	
	$i("Produzioni_div").style.marginBottom	= "30px";
	$i("Produzioni_div").style.height		= window.innerHeight;
	if(statTxta.style.display == "none") {
		divPrinc.style.top = (window.innerHeight/2 - divPrinc.offsetHeight/2) + "px";
	}else{
		divPrinc.style.top = (window.innerHeight/2 - divPrinc.offsetHeight/2 - statTxta.offsetHeight/2) + "px";
	}
	$i("help_frame").style.top	 = window.innerHeight/100*12.5;
	
	if(window.innerWidth>=820) 
	{
		$i("help_return").style.marginLeft	= ($i("help_frame").offsetWidth-$i("help_return").offsetWidth)/2+"px";
		$i("operation").style.marginLeft 	= divPrinc.offsetWidth/2 - $i("operation").offsetWidth/2 - 10 + "px";
		statTxta.style.marginTop 			= divPrinc.getBoundingClientRect().bottom - $i("titolo").getBoundingClientRect().bottom + "px";
		divPrinc.style.left 				= (window.innerWidth*4/10) +"px";
		statTxta.style.marginLeft 			= (window.innerWidth*4/10) - $i("Produzioni_div").getBoundingClientRect().right +"px";
		btnLista.style.marginLeft 			= (divPrinc.offsetWidth/2 - btnLista.offsetWidth/2 - 70) + "px";
	}else{
		$i("help_return").style.marginLeft	= ($i("help_frame").offsetWidth-$i("help_return").offsetWidth)/2+"px";
		$i("operation").style.marginLeft 	= "40px";
		statTxta.style.marginTop 			= divPrinc.getBoundingClientRect().bottom - $i("titolo").getBoundingClientRect().bottom + "px";
		divPrinc.style.left 				= "336px";
		statTxta.style.marginLeft 			= "32px";
		btnLista.style.marginLeft 			= "-38px";
	}
	
	if(statTxta.style.display == "none") {
		$i("file-selector").style.marginTop = divPrinc.getBoundingClientRect().bottom - $i("titolo").getBoundingClientRect().bottom + "px";
	}else{
		$i("file-selector").style.marginTop = 25 + "px";
	}
}