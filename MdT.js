class Writer{
	#type
	
	constructor(type){
		this.#type = type;
	}
	
	write(text){
		this.#type(text);
	}
}

class State{
	#typeState
		
	constructor(name, typeState){
		this.name		= name;
		this.#typeState	= typeState;
	}
	
	equal(state){ return state.name == this.name; }
	getType()	{ return this.#typeState; }
}	

class Instance{
	#character
	#state
	
	constructor(character, state){
		this.#character 	= character;
		this.#state 		= state;
	}
	
	equal(instance)		{ return (this.#character == instance.getChar() && this.#state.equal(instance.getState())); }
	getChar()			{ return this.#character; }
	getState()			{ return this.#state; }
	setChar(character) 	{ this.#character = character; }
	clone()				{ return new Instance(this.#character, this.#state); }
	toString()			{ return this.#character + " " + this.#state.name; }
}

class Produzione{
	#oldInstance
	#newInstance
	#direction
	
	constructor(oldInstance, newInstance, direction){
		this.#oldInstance 	= oldInstance;
		this.#newInstance 	= newInstance;
		this.#direction  	= direction;
	}
	
	doProduzione()						{ return {"instance":this.#newInstance.clone(), "dir":this.#direction}; }
	doProduzioneReverse()				{ return {"instance":this.#oldInstance.clone(), "dir":this.#direction}; }
	isRightProduction(instance)			{ return this.#oldInstance.equal(instance); }
	isRightProductionReverse(instance)	{ return this.#newInstance.equal(instance); }
	toString()							{ return this.#oldInstance.toString()+" "+this.#newInstance.toString()+" "+this.#direction; }
}

class TuringMachine{
	#Alfabeto
	#Stati
	#Produzioni
	#run
	#paused
	#idx
	#nowInstance
	#nastroLoaded
	#old
	#end
	
	constructor(produzioniStr, statiFinaliStr){
		if(produzioniStr === undefined) 	produzioniStr	= "";
		if(statiFinaliStr === undefined) 	statiFinaliStr	= "";
		this.#Alfabeto		= new Array();
		this.#Stati			= new Array();
		this.#Produzioni	= new Array();
		this.#old			= new Array();
		
		this.#prepareAlfabeto(produzioniStr);
		this.#prepareStati(produzioniStr,statiFinaliStr);
		this.#prepareProduction(produzioniStr);
		
		this.#idx		 	= 2;
		this.#run			= true;
		this.#paused		= false;
		this.#nastroLoaded	= false;
		this.#end 		 	= false;
		this.input			= "$$$$$$";
	}
	
	reset(){
		
		this.#idx		 	= 2;
		this.#run			= true;
		this.#paused		= false;
		this.#nastroLoaded	= false;
		this.#end 		 	= false;
		this.input			= "$$$$$$";
		this.#old			= new Array();
	}
	
	reloadOld(){
		var xres = this.#old[0];
			
		this.input = xres[0].map((x)=>(x==""? "$":x));
		this.#idx  = xres[1];
		this.#nowInstance  = xres[2].clone();
		this.#end			= false;
	}
	
	loadNastro(inputS){
		this.input 			= Array.from(this.#prepareInput(inputS));
		this.#old			= new Array();
		this.#nowInstance	= new Instance(this.input[this.#idx],this.#Stati[0]);
		this.#nastroLoaded	= true;
		this.#old.push([this.input.map((x)=>(x!="$"? x:"")),this.#idx,this.#nowInstance]);
	}
	
	doProduction(){
		var resS 			= this.input.toString();
		var logF			= "";
		this.#idx		 	= 2;
		this.#run			= true;
		this.#paused		= false;
		while(this.#run && !this.#paused){
			logF = this.next();
			if(logF.resS=="ERROR"){
				return logF;
			}
		}
		this.#idx		 	= 2;
		this.#nastroLoaded  = false;
		return { res:logF.res, indice: logF.indice, Istance: logF.Istance};
	}
	
	next(){
		
			
		if(this.#nastroLoaded ){
			if(this.#paused){
				for(let i=0; this.input[0]=="$"; i++){
					this.input.shift();
				}
				for(let i=0; i<Math.max(this.input.toString().indexOf("$"),3); i++){
					this.input.unshift("$");
				}
			}
			var log 		= "";
			var inputT;
			this.#paused 	= true;
			this.#old.push([this.input.map((x)=>x),this.#idx,this.#nowInstance.clone()]);
			for(const p of this.#Produzioni){
				if(p.isRightProduction(this.#nowInstance)){
					let resp 					 = p.doProduzione();
					this.#nowInstance 			 = resp.instance;
					this.input[this.#idx] 		 = this.#nowInstance.getChar();
					this.#paused				 = false;
					this.#idx 			    	+= resp.dir=="r"? 1:-1;
					log					    	+= p.toString();
					inputT						 = this.input;
					
					if(!this.input[this.#idx]) 
						this.input[this.#idx]	 = "$";
					
					if(this.#nowInstance.getState().getType()==2){
						this.#run				 = false;
						this.#nastroLoaded		 = false;
						this.#end				 = true;
						inputT 					 = inputT.filter((value, index, arr)=>{
						return value != "$";});
					}
					this.#nowInstance.setChar(this.input[this.#idx]);
					break;
				}
			}
		
			if(this.#paused!=false && !this.#end){
				this.#run = false;
				return {res: "ERROR", Istance: new Instance("X",2), nameError: "InstanceNotReconise", definition:"The Instance '"+this.#nowInstance.toString()+"' is not reconise, are you sure that is right?", toString:function(){return this.nameError+":\n"+this.definition;}};
			}else{
				if(this.#end){
					return {res: inputT, indice : -1, Istance: this.#nowInstance.clone(), toString:function(){return this.nameError+":\n"+this.definition}};
				}
				return {res: inputT, indice : this.#idx, Istance: this.#nowInstance.clone(), toString:function(){return this.nameError+":\n"+this.definition}};
			}
		}else{
			if(this.#end){
				return {res: this.input.toString().replaceAll("$",""), indice : -1, Istance: this.#nowInstance.clone(), toString:function(){return this.nameError+":\n"+this.definition}};
			}
				
			this.#run = false;
			return {res:"ERROR", Istance: new Instance("X",2), nameError: "NotLoadedNastro", definition:"The nastro is not loaded, please load the nastro", toString:function(){return this.nameError+":\n"+this.definition;}};
		}
	}
	
	before(){
		this.#end = false;
		if(this.#nastroLoaded && this.#old.length>0){
			var xres = this.#old.pop();
			this.input = xres[0];
			this.#idx  = xres[1];
			this.#nowInstance  = xres[2];
			
			if(this.#old.length<=0){
				
				this.#old.push([this.input.map((x)=>x),this.#idx,this.#nowInstance]);
				this.loadNastro(this.input.map((x)=>x).toString().replaceAll(",",""));
			}
			return {res: xres[0], indice : xres[1]+(this.#old.length<=1? -3:0), Istance: xres[2], toString:function(){return this.nameError+":\n"+this.definition}};
		}else if(this.#old.length>0){
			this.#nastroLoaded = true;
			var xres = this.#old.pop();
			this.input = xres[0];
			this.#idx  = xres[1];
			this.#nowInstance  = xres[2];
			if(this.#old.length<=0){
				this.#old.push([this.input.map((x)=>x),this.#idx,this.#nowInstance]);
				this.loadNastro(this.input.map((x)=>x).toString().replaceAll(",",""));
			}
			
			return {res: xres[0], indice : xres[1], Istance: xres[2], toString:function(){return this.nameError+":\n"+this.definition}};
		
		}else{
			if(this.#old.length==0){
				this.#nastroLoaded = false;
				this.#old.push([this.input.replaceAll("$","").toString(),this.#idx,this.#nowInstance]);
			
				return {res: this.input, indice : this.#idx-3, Istance: this.#nowInstance, toString:function(){return this.nameError+":\n"+this.definition}};
			}
			this.#run = false;
			return {res:"ERROR", nameError: "NotLoadedNastro", definition:"The nastro is not loaded, please load the nastro", toString:function(){return this.nameError+":\n"+this.definition;}};
		}
	}
	
	isReady(){
		return this.#nastroLoaded || this.#end;
	}
	
	isEnded(){
		return this.#end;
	}
	
	#prepareAlfabeto(produzioniStr){
		var txtProdVal = produzioniStr.split("\n");
		var temp;
		for(const p of txtProdVal){
			temp = p.split(" ");
			if(this.#Alfabeto.indexOf(temp[0])==-1) this.#Alfabeto.push(temp[0]);
			if(this.#Alfabeto.indexOf(temp[2])==-1) this.#Alfabeto.push(temp[2]);
		}
	}
	
	#prepareStati(produzioniStr, statiFinaliStr){
		var txtProdVal = produzioniStr.split("\n");
		var txtStatFin = statiFinaliStr.split(",");
		var temp;
		this.#Stati.push(new State(txtProdVal.shift().split(" ")[1], 0));
		if(txtStatFin=="") {
			this.#Stati.push(new State((txtProdVal.pop()).split(" ")[3], 2));
		}else
			for(const p of txtStatFin){
				this.#Stati.push(new State(p, 2));
			}
		for(const p of txtProdVal){
			temp = p.split(" ");
			if(this.#Stati.indexOf(temp[0])==-1) this.#Stati.push(new State(temp[1],1));
			if(this.#Stati.indexOf(temp[2])==-1) this.#Stati.push(new State(temp[1],1));
		}
	}
	
	#prepareProduction(produzioniStr){
		var txtProdVal = produzioniStr.split("\n");
		var temp;
		function FindEl(element){
			return element.name==this;
		}
		for(const p of txtProdVal){
			temp = p.split(" ");
			this.#Produzioni.push(new Produzione(new Instance(temp[0],this.#Stati.find(FindEl, temp[1])), new Instance(temp[2],this.#Stati.find(FindEl, temp[3])),temp[4]));
				
			
		}
	}
	
	#prepareInput(nastro){
			return ("$$$"+nastro+"$$$");
	}

}
