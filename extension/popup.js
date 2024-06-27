console.log('This is an other popup!');

// display data when opening popup.
displayCoverageData();

/**
 * coef d'heure par label.
 * 1 : heure faite
 * -1 : heure non faite
 * 0 : ne pas compter.
 * total des heures = somme label(1) + somme label(-1)
 * total des heures non faites = somme label(-1)
 */
labelsCoef = {
    "-": 1,
    "Classe absente": -1,
    "Cours annul\u00E9":-1,
    "Cours d\u00E9plac\u00E9":1, 
    "Prof. absent":-1,
    "Prof./pers. absent": -1,
	"Changement de salle": 1,
    "Cours modifi\u00E9":1,
    "Dispense": -1,	
    "Cours maintenu": 1,	
    "Exceptionnel": 1,	
    "Remplacement": 1,	
    "Conseil de classe": 1
}

// update display during scraping.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.command === 'set') {
        coverageData = message.coverageData;
        console.log("Received CoverageData", coverageData);
        displayCoverageData(coverageData);
        return false;
    }
  });

async function refresh(){
	const [tab] = await chrome.tabs.query({
        url: [ "https://*.index-education.net/*"]}
    );
	chrome.tabs.sendMessage(tab.id, {command:"scrap"});
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

async function displayCoverageData(coverageData){
    // coverageData = JSON.parse(localStorage.getItem('coverageData'));
    if(!coverageData){
        object = await chrome.runtime.sendMessage({ command : "get" });
        if(object){
            coverageData=object.coverageData;
        }
        console.log("retrieved coverageData :", coverageData);
    }
    if(!coverageData){
        console.log("No coverage Data");
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
                        labels[labelKey]=0;
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
    thElement = document.createElement("th");
    headerElement.appendChild(thElement);
    labelElement = document.createTextNode("total");
    thElement.appendChild(labelElement);
    thElement = document.createElement("th");
    headerElement.appendChild(thElement);
    labelElement = document.createTextNode("% couv");
    thElement.appendChild(labelElement);
	totalLabelDone=0;
    totalLabelUndone=0;
    // rows
	for (var key in matieresData) {
        labelDone=0;
        labelUndone=0;
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
                    matiereValue = matiereLabels[label];
                    if(labelsCoef[label] === 1){
                        labelDone+=matiereValue;
                        totalLabelDone+=matiereValue;
                    } else if(labelsCoef[label] === -1){
                        labelUndone+=matiereValue;
                        totalLabelUndone+=matiereValue;
                    } else {
                        console.log("label not found :",label);
                    }
                    labels[label]+=matiereValue;
                    valueElement = document.createTextNode(matiereValue);
                    td2Element.appendChild(valueElement);
                }
            }
            tdTotalElement = document.createElement("td");
            trElement.appendChild(tdTotalElement);
            totalElement = document.createTextNode(""+(labelDone+labelUndone)+"|"+labelUndone);
            tdTotalElement.appendChild(totalElement);
            tdP100Element = document.createElement("td");
            trElement.appendChild(tdP100Element);
            p100Element = document.createTextNode(Math.trunc(labelDone/(labelDone+labelUndone)*100)+"%");
            tdP100Element.appendChild(p100Element);
   	 	
		}
	}
    trElement = document.createElement("tr");
    tableElement.appendChild(trElement);
    td1Element = document.createElement("td");
    trElement.appendChild(td1Element);
    totalElement = document.createTextNode("Total");
    td1Element.appendChild(totalElement);
    for(var label in labels){
        td2Element = document.createElement("td");
        trElement.appendChild(td2Element);
        labelValue = labels[label];
        valueElement = document.createTextNode(labelValue);
        td2Element.appendChild(valueElement);
    }
    tdTotalElement = document.createElement("td");
    trElement.appendChild(tdTotalElement);
    totalElement = document.createTextNode(""+(totalLabelDone+totalLabelUndone)+"|"+totalLabelUndone);
    tdTotalElement.appendChild(totalElement);
    tdP100Element = document.createElement("td");
    trElement.appendChild(tdP100Element);
    p100Element = document.createTextNode(Math.trunc(totalLabelDone/(totalLabelDone+totalLabelUndone)*100)+"%");
    tdP100Element.appendChild(p100Element);
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