console.log('This is an other popup!');
displayCoverageData();

function displayResult(coverageData){
    localStorage.setItem('coverageData', JSON.stringify(coverageData));
	displayCoverageData();
}
async function refresh(){
	const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
	// const response = await chrome.tabs.sendMessage(tab.id, {greeting: "hello"});
	chrome.tabs.sendMessage(tab.id, {"message":"hello"}).then(res => displayResult(res));
}

function replaceElementText(selector, text){
    replaceElementChild(selector, document.createTextNode(text));
}
function replaceElementChild(selector, child){
    element = document.querySelector(selector)
    if(!element){
        console.log("element does not exist :" + selector);
        return;
    }
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
    element.appendChild(child);
}

var refreshButton = document.getElementById("refreshButton");
refreshButton.addEventListener(
  "click", () => refresh(), false);

function displayCoverageData(){
    coverageData = JSON.parse(localStorage.getItem('coverageData'));
    if(!coverageData){
        return;
    }
    matieresData=coverageData["matieresData"];
	labelsCount = 0;
	labels = {};
	// construit la table des colonnes?
	for (var matiereKey in matieresData) {
        if (matieresData.hasOwnProperty(matiereKey)) {
            labelsJson = matieresData[matiereKey];
            for(var labelKey in labelsJson){
                if (labelsJson.hasOwnProperty(labelKey)) {
                    if(!labels[labelKey]){
                        labels[labelKey]=labelsCount++;
                    }
                }
            }
        }
 	}
 	replaceElementText("span#results_start", new Date(coverageData["startDate"]).toLocaleDateString());
    replaceElementText("span#results_end", new Date(coverageData["endDate"]).toLocaleDateString());

	// ajoute la table.
	tableElement = document.createElement("table");
    replaceElementChild("#results_table", tableElement);

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
	for (var key in matieresData) {
        if (matieresData.hasOwnProperty(key)) {
            trElement = document.createElement("tr");
            tableElement.appendChild(trElement);
            td1Element = document.createElement("td");
            trElement.appendChild(td1Element);
            labelElement = document.createTextNode(key);
            td1Element.appendChild(labelElement);
            
            matiereLabels = matieresData[key];
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