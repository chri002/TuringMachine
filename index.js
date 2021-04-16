function $i(str){ return document.getElementById(str);}

var MdT		= null;
var fps		= 1;
var writer  = null;

window.onload = function(){
	writer = new Writer(function(val){
		var str = val.V.substring(0,val.I);
		if(val.I!=-1) str+='<span style="color: red; ">'+val.V.substring(val.I,val.I+1)+"</span>";
		str+=val.V.substring(val.I+1,val.V.length);
		$i("nastro").innerHTML = str;});
	
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
			
	$i("enableState").onclick 		= () => {cliccato();};
	$i("nastro").onclick 			= () => {
		if(MdT==null) 
			creaMdT(); 
		if(MdT!=null){
			if(!MdT.isReady()) MdT.loadNastro($i("nastro").textContent); 
			else MdT.reloadOld();
		}
	};
	$i("loadNa").onclick		= () => {
		if(MdT!=null){
			creaMdT(); 
			writer.write({V:"", I:-1});			
		}
	};
	$i("endBtn").onclick		= () => {
		if(MdT==null) 
			creaMdT(); 
		if(MdT!=null){
			if(!MdT.isReady() && !MdT.isEnded()) MdT.loadNastro($i("nastro").textContent); 
			else MdT.reloadOld();
			
			MdT.doProduction();
			var resa = MdT.next();
				console.log(resa);
			if(resa.res!="ERROR")
				writer.write({V: resa.res.toString().replaceAll(",",""), I:resa.indice});
			else
				console.log(resa);
		}
	};
	$i("nextBtn").onclick		= () => {
		if(MdT==null) 
			creaMdT(); 
		if(MdT!=null){
			if(!MdT.isReady() && !MdT.isEnded()) 
				MdT.loadNastro($i("nastro").textContent);
			var resa = MdT.next();
				console.log(resa);
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
	
	$i("speedRange").onclick	= () => {
		fps = $i("speedRange").value;
	};
		
	resizeAll();
};

window.onresize = () => {resizeAll();};

function doProdTime(){
	
	
}

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


function resizeAll(){
	var divPrinc = $i("div_d1");
	var statTxta = $i("Stati_txta");
	var btnLista = $i("button_div");
	
	if(statTxta.style.display == "none") {
		divPrinc.style.top = (window.innerHeight/2 - divPrinc.offsetHeight/2) + "px";
	}else{
		divPrinc.style.top = (window.innerHeight/2 - divPrinc.offsetHeight/2 - statTxta.offsetHeight/2) + "px";
	}
	$i("operation").style.marginLeft = divPrinc.offsetWidth/2 - $i("operation").offsetWidth/2 - 10 + "px";
	statTxta.style.marginTop 	= divPrinc.getBoundingClientRect().bottom - $i("titolo").getBoundingClientRect().bottom + "px";
	divPrinc.style.left 		= (window.innerWidth*4/10) +"px";
	statTxta.style.marginLeft 	= (window.innerWidth*4/10) - $i("Produzioni_div").getBoundingClientRect().right +"px";
	btnLista.style.marginLeft 	= (divPrinc.offsetWidth/2 - btnLista.offsetWidth/2 - 70) + "px";
	
}