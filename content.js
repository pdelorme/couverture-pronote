console.log("This is 'Content.js' new");

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
function getEDTduJour(){
	// console.log("getEdtDuJour");
	edt = document.querySelectorAll("#id_body .emploidutemps")[0];
	dateString = edt.querySelector(".ObjetCelluleDate .ocb_cont .ocb-libelle").textContent;
	date = new Date();
	if(dateString=="Demain"){
		date = new Date(1000*60*60*24 + Date.now());
	} else if(dateString=="Aujourd'hui"){
		date = new Date(Date.now());
	} else {
		//dateString = dateString +" "+ new Date(Date.now()).getFullYear()
		tempDate = new Date(dateString);
		day = tempDate.getDate();
		month = tempDate.getMonth();
		year = new Date(Date.now()).getFullYear();
		if(month>7) {
			year = year - 1 
		}
		date = new Date(year, month, day);
	}
	var jsonEDTData = {};
	jsonEDTData["date"] = date.toLocaleDateString();
	liNodes = edt.querySelectorAll(".liste-cours>li");
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
	}
	jsonEDTData["slots"] = SLOTSData;
	return jsonEDTData;
}

async function getEDTAnnée(){
	eleveString  = document.querySelectorAll(".membre-photo_container span.label-membre")[0].textContent;
	splitIndex = eleveString.lastIndexOf("(");
	name = eleveString.substring(eleveString,splitIndex-1);
	classe = eleveString.substring(splitIndex+1,eleveString.length-1);
	isDébutAnnée = false;
	while(!isDébutAnnée){
		jsonEDTData = getEDTduJour();
		jsonEDTData["childrenHash"] = eleveString.hashCode();
		jsonEDTData["classe"] = classe;
		jsonEDTData["etablissement"] = "--";
		console.log(jsonEDTData);
		postEDTJson(jsonEDTData);
		date = jsonEDTData["date"];
		if(date.endsWith("05/2024"))
		{
			isDébutAnnée = true
		} else {
			// prevDay
			prevButton = document.querySelector("#id_body .emploidutemps .ObjetCelluleDate .icon_angle_left");
			prevButton.dispatchEvent(new Event("click"));
			await delay(1000);
		}
	}
}

document.addEventListener('readystatechange', () => {    
  if (document.readyState == 'complete') {
  	console.log("CS : document complete");
  	setTimeout(function() { getEDTAnnée(); }, 5000);
  }
});
