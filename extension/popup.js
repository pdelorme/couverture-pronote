console.log('Bienvenue sur la console PronotoCoverage !');

// show pronote window.
activatePronoteWindow();

// display data on popup opening.
displayCoverageData();
scrapping=false;
var actionButton = document.getElementById("actionButton");
actionButton.addEventListener("click", () => actionClick(), false);
function actionClick(){
    if(this.scrapping){
        stopScrapping();
    } else {
        startScrapping();
    }
}
/**
 * coef d'heure par label.
 * 1 : heure faite
 * -1 : heure non faite
 * 0 : ne pas compter.
 * total des heures = somme label(1) + somme label(-1)
 * total des heures non faites = somme label(-1)
 */
const labelsCoef = {
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

const matiereKO = [ "-","Documentation","Pas de cours","Evaluation nationale","Sortie p\u00E9dagogique"];

// continuous update display during scraping.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.command === 'setCoverageData') {
        coverageData = message.coverageData;
        //console.log("Received CoverageData", coverageData);
        displayCoverageData(coverageData);
        return false;
    }
    if(message.command === "contentReady"){
        console.log("content-ready",this.refreshTabId);
        //contentReady();
    }
  }
);

async function activatePronoteWindow(){
	const [tab] = await chrome.tabs.query({
        url: [ "https://*.index-education.net/*"]}
    );
    if(tab){
        await chrome.tabs.update(tab.id, {active : true});
        await chrome.tabs.reload(tab.id);
        await delay(3000);
        connected = await chrome.tabs.sendMessage(tab.id, {command:"isConnected"});
        console.log("isConnected",connected);
        if(!connected){
            var actionButton = document.getElementById("actionButton");
            actionButton.disabled=true;
            replaceElementText(actionButton,"!!! Merci de vous connecter !!!");    
        }
    } else {
        var actionButton = document.getElementById("actionButton");
        actionButton.disabled=true;
        replaceElementText(actionButton,"!!! Merci d'ouvrir pronote !!!");    
    }
}

// trigers re-calculation of statistics.
async function startScrapping(){
    this.scrapping =true;
	const [tab] = await chrome.tabs.query({
        url: [ "https://*.index-education.net/*"]}
    );
    chrome.tabs.sendMessage(tab.id, {command:"startScrapping"});
    var actionButton = document.getElementById("actionButton");
    replaceElementText(actionButton,"Arr\u00EAter");
}

async function stopScrapping(){
    this.scrapping =false;
	const [tab] = await chrome.tabs.query({
        url: [ "https://*.index-education.net/*"]}
    );
    chrome.tabs.sendMessage(tab.id, {command:"stopScrapping"});
    var actionButton = document.getElementById("actionButton");
    replaceElementText(actionButton,"Rafraichir les statistiques");
}

async function displayCoverageData(coverageData){
    // coverageData = JSON.parse(localStorage.getItem('coverageData'));
    if(!coverageData){
        object = await chrome.runtime.sendMessage({ command : "getCoverageData" });
        if(object){
            coverageData=object.coverageData;
        }
        // console.log("retrieved coverageData :", coverageData);
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
	headerElement = addElement(tableElement, "tr");
    addElement(headerElement,"th");
	for(var label in labels){
		addElement(headerElement,"th",label);
	}
    addElement(headerElement,"th","Total");
    addElement(headerElement,"th","Couverture");

	totalLabelDone=0;
    totalLabelAll=0;
    // rows
	for (var key in matieresData) {
        labelDone=0;
        labelAll=0;
        if (matieresData.hasOwnProperty(key) && !matiereKO.includes(key)) {
            trElement = addElement(tableElement, "tr");
            addElement(trElement, "td", key);
            
            matiereLabels = matieresData[key];
            for(var label in labels){
                matiereValue="";
                if(matiereLabels[label]){
                    matiereValue = matiereLabels[label];
                    if(labelsCoef[label] === 1){
                        labelDone+=matiereValue;
                        totalLabelDone+=matiereValue;
                        labelAll+=matiereValue;
                        totalLabelAll+=matiereValue;
                    } else if(labelsCoef[label] === -1){
                        labelAll+=matiereValue;
                        totalLabelAll+=matiereValue;
                    } else {
                        console.log("label not found :",label);
                    }
                    labels[label]+=matiereValue;
                }
                addElement(trElement, "td", matiereValue);
            }
            addElement(trElement, "td", ""+labelDone+"/"+labelAll);
            addElement(trElement, "td", Math.trunc(labelDone/labelAll*100)+"%");   	 	
		}
	}
    trElement = addElement(tableElement, "tr");
    addElement(trElement, "th", "Total");
    for(var label in labels){
        labelValue = labels[label];
        addElement(trElement, "th", labelValue);
    }
    addElement(trElement, "th", ""+totalLabelDone+"/"+totalLabelAll);
    addElement(trElement, "th", Math.trunc(totalLabelDone/totalLabelAll*100)+"%");   	 	
}

/**
 * DOM Utility methods
 */
function replaceElementText(elementOrSelector, text){
    replaceElementChild(elementOrSelector, document.createTextNode(text));
}
function replaceElementChild(elementOrSelector, child){
    if(typeof(elementOrSelector) === 'string' || elementOrSelector instanceof String ){
        element = document.querySelector(elementOrSelector);
    } else {
        element = elementOrSelector;
    }
    if(!element){
        console.log("element does not exist :" + selector);
        return;
    }
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
    element.appendChild(child);
}
/**
 * creates, attach to {root} and returns <{key}> element with {text} content.
 * @returns the element <key>text</key>
 */
function addElement(root, key, text){
    element = document.createElement(key);
    root.appendChild(element);
    if(text){
        textElement = document.createTextNode(text);
        element.appendChild(textElement);
    }
    return element;
}

function delay(milliseconds){
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
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