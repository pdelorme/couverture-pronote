console.log('This is an other popup!');

function displayResult(res){
	console.log("result :", res);
	matieresDataToTable(res);
}
async function refresh(){
	const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
	// const response = await chrome.tabs.sendMessage(tab.id, {greeting: "hello"});
	chrome.tabs.sendMessage(tab.id, {"message":"hello"}).then(res => displayResult(res));
	// do something with response here, not outside the function
	console.log(response);
}

var refreshButton = document.getElementById("refreshButton");
refreshButton.addEventListener(
  "click", () => refresh(), false);

function matieresDataToTable(matiereJson){
	labelsCount = 0;
	labels = {};
	// construit la table des colonnes?
	for (var matiereKey in matiereJson) {
   	if (matiereJson.hasOwnProperty(matiereKey)) {
   		labelsJson = matiereJson[matiereKey];
   		for(var labelKey in labelsJson){
   			if (labelsJson.hasOwnProperty(labelKey)) {
   				if(!labels[labelKey]){
   					labels[labelKey]=labelsCount++;
   				}
   			}
   		}
   	}
 	}
	tableDiv = document.querySelector("#results-table");
	
	const tableElement = document.createElement("table");
	// header
	headerElement = document.createElement("tr");
  tableElement.appendChild(headerElement);
  thElement = document.createElement("th");
  headerElement.appendChild(thElement);
	for(var label in labels){
		thElement = document.createElement("th");
   	headerElement.appendChild(thElement);
   	labelElement = document.createTextNode(label);
   	thElement.appendChild(labelElement);
	}
	// rows
	for (var key in matiereJson) {
   if (matiereJson.hasOwnProperty(key)) {
   	 	trElement = document.createElement("tr");
   	 	tableElement.appendChild(trElement);
   	 	td1Element = document.createElement("td");
   	 	trElement.appendChild(td1Element);
   	 	labelElement = document.createTextNode(key);
   	 	td1Element.appendChild(labelElement);
   	 	
   	 	matiereLabels = matiereJson[key];
   	 	for(var label in labels){
   	 		td2Element = document.createElement("td");
   	 		trElement.appendChild(td2Element);
   	 		if(matiereLabels[label]){
   	 			valueElement = document.createTextNode(matiereLabels[label]);
   	 			td2Element.appendChild(valueElement);
   	 		}
   	 	}
   	 	
		}
	}
	tableDiv.appendChild(tableElement);
}

/*
{
    "HISTOIRE-GEOGRAPHIE": {
        "-": 29,
        "Cours déplacé": 8,
        "Cours annulé": 3,
        "Conseil de classe": 2
    },
    "ESPAGNOL LV2": {
        "-": 24,
        "Cours annulé": 5
    },
    "TECHNOLOGIE": {
        "-": 12,
        "Cours déplacé": 8,
        "Cours annulé": 2
    },
    "Pas de cours": {
        "-": 21
    },
    "Documentation": {
        "-": 12
    },
    "ED.PHYSIQUE & SPORT.": {
        "-": 17,
        "Prof./pers. absent": 5,
        "Classe absente": 2,
        "Prof. absent": 1
    },
    "FRANCAIS": {
        "Remplacement": 27,
        "Prof. absent": 12,
        "Cours annulé": 2
    },
    "ANGLAIS LV1": {
        "Prof. absent": 10,
        "Prof./pers. absent": 2,
        "-": 6
    },
    "-": {
        "-": 42
    },
    "MATHEMATIQUES": {
        "-": 30,
        "Cours déplacé": 2,
        "Cours annulé": 2,
        "Conseil de classe": 4
    },
    "EDUCATION MUSICALE": {
        "-": 10
    },
    "SCIENCES VIE & TERRE": {
        "Prof./pers. absent": 10,
        "Classe absente": 2,
        "-": 1
    },
    "PHYSIQUE-CHIMIE": {
        "-": 11,
        "Classe absente": 2
    },
    "ARTS PLASTIQUES": {
        "-": 10
    },
    "REVISION DNB": {
        "Cours modifié": 3
    }
}
*/