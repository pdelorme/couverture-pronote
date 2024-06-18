console.log("Hello Pronote !");

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
  	console.log("Update stats");
    sendResponse(getEDTAnnée());
  }
);

String.prototype.hashCode = function() {
  var hash = 0,
    i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

function delay(milliseconds){
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}

function postEDTJson(jsonEDTData){
	return;
	fetch("https://gcolpart.evolix.net/hde/pronote.php", {
	  method: "POST",
	  body: JSON.stringify(jsonEDTData),
	  headers: {
	    "Content-type": "application/json; charset=UTF-8"
	  }
	});
}

/**
 * return JSONData from current day
 */
function getEDTduJour(edtNode, etablissement, adresse, classe, eleveHash, date, matieresData){
	var jsonEDTData = {};
	jsonEDTData["eleveHash"] = eleveHash;
	jsonEDTData["classe"] = classe;
	jsonEDTData["etablissement"] = etablissement;
	jsonEDTData["adresse"] = adresse;
	jsonEDTData["date"] = date.toLocaleDateString();
	// ligne d'emploi du temps.
	liNodes = edtNode.querySelectorAll(".liste-cours>li");
	SLOTSData = [];
	for (var i=0; i<liNodes.length; i++) {
	    liNode = liNodes[i];
	    jsonSLOTData = {};
	    heureNodes = liNode.querySelectorAll(".container-heures div");
	    heureDebut = heureNodes[0].textContent;
	    heureFin = heureNodes.length>1 ? heureNodes[1].textContent : "N/A";
	    matiereNode = liNode.querySelector("ul.container-cours>li.libelle-cours");
	    matiere = matiereNode?(matiereNode.childNodes[0]?matiereNode.childNodes[0].textContent:"-"):"*";
	    etiquetteNode = liNode.querySelector("ul.container-cours>li.container-etiquette")
	    etiquette = etiquetteNode?etiquetteNode.textContent:"-"
	    jsonSLOTData["heureDebut"] 	= heureDebut;
	    jsonSLOTData["heureFin"] 	= heureFin;
	    jsonSLOTData["matiere"] 	= matiereNode;
	    jsonSLOTData["etiquette"] 	= etiquette;
	    SLOTSData.push(jsonSLOTData);
	    // acumulates metrics
	    matiereData = matieresData[matiere];
	    if(matiereData==null){
	    	matiereData={};
	    	matiereData[etiquette]=1;
	    	matieresData[matiere]=matiereData;
	    } else {
	    	etiquetteCount = matiereData[etiquette];
	    	if(etiquetteCount==null){
	    		matiereData[etiquette]=1
	    	} else {
	    		matiereData[etiquette]=etiquetteCount+1
	    	}
	    }
	}
	jsonEDTData["slots"] = SLOTSData;
	return jsonEDTData;
}

async function getEDTAnnée(){
	// meta data
	etablissement = document.querySelector(".ibe_etab").textContent
	adresseNode = document.querySelector(".fiche-etablissement.informations");
	if(adresseNode){
		adresse =  adresseNode.querySelectorAll(".infos-contain p")[0].textContent;
		adresse += " "+adresseNode.querySelectorAll(".infos-contain p span")[0].textContent;
		adresse += " "+adresseNode.querySelectorAll(".infos-contain p span")[1].textContent;
	} else {
		adresse = "???";
	}
	eleveString  = document.querySelectorAll(".membre-photo_container span.label-membre")[0].textContent;
	edtNode = document.querySelectorAll("#id_body .emploidutemps")[0];
	if(!edtNode)
		return;
	splitIndex = eleveString.lastIndexOf("(");
	name = eleveString.substring(eleveString,splitIndex-1);
	classe = eleveString.substring(splitIndex+1,eleveString.length-1);
	var matieresData = {};
	// loop sur l'EDT du jour.
	isDébutAnnée = false;
	stopDate = new Date(Date.now()-3*1000*60*60*24);
	lastDate="";
	while(!isDébutAnnée){
		// date
		dateString = edtNode.querySelector(".ObjetCelluleDate .ocb_cont .ocb-libelle").textContent;
		date = new Date();
		if(dateString=="Demain"){
			date = new Date(1000*60*60*24 + Date.now());
		} else if(dateString=="Aujourd'hui"){
			date = new Date(Date.now());
		} else {
			dateString = dateString +" "+ new Date(Date.now()).getFullYear()
			tempDate = new Date(dateString);
			day = tempDate.getDate();
			month = tempDate.getMonth();
			year = new Date(Date.now()).getFullYear();
			if(month>7) {
				year = year - 1 
			}
			date = new Date(year, month, day);
		}
		jsonEDTData = getEDTduJour(edtNode, etablissement, adresse, classe, eleveString.hashCode(), date, matieresData);
		console.log(jsonEDTData);
		postEDTJson(jsonEDTData);
		date = jsonEDTData["date"];
		if(lastDate==date){
			isDébutAnnée = true
		} else {
			lastDate=date;
			// prevDay
			prevButton = document.querySelector("#id_body .emploidutemps .ObjetCelluleDate .icon_angle_left");
			prevButton.dispatchEvent(new Event("click"));
			await delay(1000);
		}
	}
	console.log(matieresData);
}
/*
document.addEventListener('readystatechange', () => {    
  if (document.readyState == 'complete') {
  	console.log("CS : document complete");
  	setTimeout(function() { getEDTAnnée(); }, 5000);
  }
});
*/