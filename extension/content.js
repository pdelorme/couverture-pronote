console.log("Bonjour Pronote !");

this.scrapping = false;
this.postData = false;

chrome.runtime.onMessage.addListener(
  	function(message, sender, sendResponse) {
		if(message.command === 'startScrapping'){
			this.postData = message.postData;
			if(this.scrapping){
				console.log("Already scrapping");
				return;
			}
			console.log("start Scrapping");
			this.scrapping = true;
			(async () => {
				coverageData = await getEDTAnnée(sendResponse);
				// sendResponse(coverageData);
			})();
			return false;
		}
		if(message.command === 'stopScrapping'){
			console.log("Stop");
			this.scrapping = false;
			return false;
		}
		if(message.command === "isConnected"){
			console.log("isConnected");
			(async () => {
				isConnected = document.querySelector(".AvecMenuContextuel");
				console.log("isConnected",isConnected);
				sendResponse(isConnected);
			})();
			return true;
		}
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

const monthMap = {
	"janv."	:0,
	"févr."	:1,
	"mars"	:2,
	"avr."  :3,
	"mai"		:4,
	"juin"	:5,
	"juil."	:6,
	"août"	:7,
	"sept."	:8,
	"oct."  :9,
	"nov."	:10,
	"déc."	:11
}
/**
 * return date from pronoteDate
 */
function pronoteToLocalDate(pronoteDate){
	if(pronoteDate=="Demain"){
		return new Date(Date.now() + 1000*60*60*24);
	}
	if(pronoteDate=="Aujourd'hui"){
		return new Date(Date.now());
	}
	if(pronoteDate=="Hier"){
		return new Date(Date.now() - 1000*60*60*24);
	}
	datePart = pronoteDate.split(String.fromCharCode(160));
	day = datePart[1];
	month = monthMap[datePart[2]];
	year = new Date(Date.now()).getFullYear();
	if(month>7) {
		year = year - 1 
	}
	date = new Date(year, month, day);
	return date;
}

function goHome(){
	adresseNode = document.querySelector(".fiche-etablissement.informations");
}

/**
 * converts time from HHhMM to Décimal.
 * @param {*} timeString 
 * @returns 
 */
function getTimeToDec(timeString){
	if(!timeString.includes("h"))
		return parseFloat(timeString) / 60;
	 const [h, m] = timeString.split("h");
	 return (+h*60+ +m)/60;
}

function getDuration(heureDébut, heureFin){
	if(heureFin === "")
		return 1;
	return getTimeToDec(heureFin)- getTimeToDec(heureDébut);
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
	hostname = window.location.hostname;
	uai=hostname.split(".")[0];
	jsonEDTData["uai"]=uai;
	// ligne d'emploi du temps.
	liNodes = edtNode.querySelectorAll(".liste-cours>li");
	SLOTSData = [];
	for (var i=0; i<liNodes.length; i++) {
	    liNode = liNodes[i];
	    jsonSLOTData = {};
	    heureNodes = liNode.querySelectorAll(".container-heures div");
	    heureDebut = heureNodes[0].textContent;
	    heureFin = heureNodes.length>1 ? heureNodes[1].textContent : "";
		duration = getDuration(heureDebut,heureFin);

	    matiereNode = liNode.querySelector("ul.container-cours>li.libelle-cours");
	    matiere = matiereNode?(matiereNode.childNodes[0]?matiereNode.childNodes[0].textContent:"-"):"*";
	    etiquetteNode = liNode.querySelector("ul.container-cours>li.container-etiquette")
	    etiquette = etiquetteNode?etiquetteNode.textContent:"-"
	    jsonSLOTData["heureDebut"] 	= heureDebut;
	    jsonSLOTData["heureFin"] 	= heureFin;
	    jsonSLOTData["matiere"] 	= matiere;
	    jsonSLOTData["etiquette"] 	= etiquette;
		jsonSLOTData["duration"] 	= duration;
	    SLOTSData.push(jsonSLOTData);
	    // acumulates metrics
	    matiereData = matieresData[matiere];
	    if(matiereData==null){
	    	matiereData={};
	    	matieresData[matiere]=matiereData;
	    } 
		etiquetteTime = matiereData[etiquette];
		if(etiquetteTime==null){
			matiereData[etiquette]=duration
		} else {
			matiereData[etiquette]=etiquetteTime+duration
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
	//coverageData = JSON.parse(localStorage.getItem('coverageData'));
	//if(!coverageData){ coverageData={}; }
	//matieresData = coverageData['matieresData'];
	//if(matieresData==null){ matieresData = {}; }
	lastDate = null;
	coverageData={};
	matieresData = {};
	coverageData["matieresData"] = matieresData;
	// loop sur l'EDT du jour.
	isDébutAnnée = false;
	// stopDate = new Date(Date.now()-3*1000*60*60*24);
	prevDate = null;
	while(!isDébutAnnée && scrapping){
		// date
		dateString = edtNode.querySelector(".ObjetCelluleDate .ocb_cont .ocb-libelle").textContent;
		date = pronoteToLocalDate(dateString);
		coverageData["startDate"] = date;	
		if(lastDate==null){
			lastDate=date;
			coverageData["endDate"] = lastDate;
		}
		if(prevDate-date==0){
			// si la date n'à pas changée, on à terminé.
			isDébutAnnée = true
		} else {	
			prevDate=date;
			edtData = getEDTduJour(edtNode, etablissement, adresse, classe, eleveString.hashCode(), date, matieresData);
			if(this.postData){
				await chrome.runtime.sendMessage({ command : "postEdtData", edtData : edtData });
			}
			// prevDay
			prevButton = document.querySelector("#id_body .emploidutemps .ObjetCelluleDate .icon_angle_left");
			prevButton.dispatchEvent(new Event("click"));
			await chrome.runtime.sendMessage({ command : "setCoverageData", coverageData : coverageData });
			await delay(500);
		}
	}
	return coverageData;
}

chrome.runtime.sendMessage({ command : "contentReady" });
/*
document.addEventListener('readystatechange', () => {    
  if (document.readyState == 'complete') {
  	console.log("CS : document complete");
  	setTimeout(function() { getEDTAnnée(); }, 5000);
  }
});
*/