/* Add any packages */
require('dotenv').config();

/* Pull in secrets from the .env file, if needed */
const apiKey = process.env.API_KEY;
const cmtyNamesSpreadsheetID = process.env.CMTY_NAME_SSID;
const backEndSpreadsheetID = process.env.REDUC_GOAL_SSID;
const scriptURL = process.env.SCRIPT_URL;

// HELPER FUNCTIONS
// Get numerical value of elt at ID
function getNumVal(eltId) {
    return Number(document.getElementById(eltId).value);
}
// Get date value of elt at ID
function getDateVal(eltId) {
    return new Date(document.getElementById(eltId).value);
}
// Get difference between dates in months
function monthDiff(d1, d2) {
    var months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth();
    months += d2.getMonth();
    return months <= 0 ? 0 : months;
}
// Pass autofilled values back to HTML input to be displayed
function setValue(eltId, value) {
    document.getElementById(eltId).value = value;
}
// Pass calculated values back to HTML to be displayed
function setInnerHTML(eltId, value) {
    document.getElementById(eltId).innerHTML = value;
}
// Display results when submit button is clicked
function displayBlock (eltId) {
    var goal = document.getElementById(eltId);
    goal.style.display = "block";
}
// Hide results (goal and parameters) when submit button is clicked and there is an error
function hideGoals() {
    document.getElementById("goal").style.display = "none";
    document.getElementById("explanation1").style.display = "none";
    document.getElementById("explanation2").style.display = "none";
    document.getElementById("explanation3").style.display = "none";
    setInnerHTML("paramNumMonths", "");
    setInnerHTML("paramTargetNetChange", "");
    setInnerHTML('paramAvgInflow', "");
    setInnerHTML("paramAvgHoused", "");
    setInnerHTML("paramAvgOutflow", "");
}

// ADD COMMUNITY NAMES TO DROPDOWN
// Get community names from Results to Date Map public Google Sheet
var communityNames = []; 
var cmtyNamesRange = 'Sheet2!A2:A';
var getCmtyNamesURL = 'https://sheets.googleapis.com/v4/spreadsheets/' + cmtyNamesSpreadsheetID + '/values/' + cmtyNamesRange + '?key=' + apiKey;

fetch(getCmtyNamesURL)
      .then(function(response) {
          console.log('Successfully pulled Community Names', response);
         return response.json();
      })
      .then(function (data) {
          var responseVals = data.values;
        communityNames = [].concat.apply([], responseVals);
        addCmtyNames("communityDropdown", communityNames); // add community names to dropdown menu
      })
      .catch(error => console.error('Error!', error.message));

// Add community names as options in the dropdown menu
function addCmtyNames(cmtyId, cmtyNames) {
    var selectCmty = document.getElementById(cmtyId);
    for (var i = 0; i < cmtyNames.length; i++) {
        var opt = document.createElement("option");
        opt.textContent = cmtyNames[i];
        opt.value = cmtyNames[i];
        selectCmty.appendChild(opt);
    }
}

// SET CURRENT DATE AND RESTRICT DATE INPUT VALUES
// Hardcode in the Current Month based on today's date
var today = new Date();
var todayMo = today.getMonth();
var todayYr = today.getFullYear();
var currentMonth = new Date(todayYr, todayMo, 1);
document.getElementById("currentMonth").valueAsDate = currentMonth;

// Limit the Target Month to dates after today's date
var targetMoMin = (todayMo + 2).toString();
if(todayMo + 2 < 10) {
    targetMoMin = '0' + targetMoMin;
}
document.getElementById("targetMonthDropdown").min = todayYr + "-" + targetMoMin;
// Limit the 3 months of data input to dates before today's date
document.getElementById("monthDropdown1").max = todayYr + "-" + todayMo + 1;
document.getElementById("monthDropdown2").max = todayYr + "-" + todayMo + 1;
document.getElementById("monthDropdown3").max = todayYr + "-" + todayMo + 1;

// AUTOFILL DATA FROM BACK END WHEN "AUTOFILL" BUTTON IS CLICKED
var RFdata = []; 
var RFdataRange = 'Reporting Form Data';
var getRFdataURL = 'https://sheets.googleapis.com/v4/spreadsheets/' + backEndSpreadsheetID + '/values/' + RFdataRange + '?key=' + apiKey;

fetch(getRFdataURL)
      .then(function(response) {
          console.log('Successfully pulled Reporting Form data', response);
         return response.json();
      })
      .then(function (data) {
          RFdata = data.values;
        //   console.log(RFdata);
      })
      .catch(error => console.error('Error!', error.message));

document.getElementById("autofill-button").onclick = function() {
    var cmtyDropdown = document.getElementById("communityDropdown");
    var selectedCmty = cmtyDropdown.options[cmtyDropdown.selectedIndex].text;
    var popDropdown = document.getElementById("populationDropdown");
    var selectedPop = popDropdown.options[popDropdown.selectedIndex].text;
    var subpopDropdown = document.getElementById("subpopulationDropdown");
    var selectedSubpop = subpopDropdown.options[subpopDropdown.selectedIndex].text;

    console.log(selectedCmty);
    console.log(selectedPop);
    console.log(selectedSubpop);

    if (selectedCmty != "Select a Community" && selectedPop != "Select a Population" && selectedSubpop != "Select a Subpopulation") {
        setInnerHTML("autofillError", "Numbers reflect self-reported community data.");
        var cmtyCol = RFdata[0].indexOf("Community");
        var popCol = RFdata[0].indexOf("Population");
        var subpopCol = RFdata[0].indexOf("Subpopulation");
        var monthCol = RFdata[0].indexOf("Month");
        var inflowCol = RFdata[0].indexOf("Total Inflow");
        var outflowCol = RFdata[0].indexOf("Total Outflow");
        var housedCol = RFdata[0].indexOf("HOUSING PLACEMENTS");
        var dataFound = false;
        for (let i = 0; i < RFdata.length; i++) {
            if (RFdata[i][cmtyCol] == selectedCmty && RFdata[i][popCol] == selectedPop && RFdata[i][subpopCol] == selectedSubpop) {
                setValue("monthDropdown1", RFdata[i][monthCol]);
                setValue("inflowInput1", RFdata[i][inflowCol]);
                setValue("outflowInput1", RFdata[i][outflowCol]);
                setValue("housedInput1", RFdata[i][housedCol]);
                if (RFdata[i + 1][cmtyCol] == selectedCmty && RFdata[i + 1][popCol] == selectedPop && RFdata[i + 1][subpopCol] == selectedSubpop) {
                    setValue("monthDropdown2", RFdata[i + 1][monthCol]);
                    setValue("inflowInput2", RFdata[i + 1][inflowCol]);
                    setValue("outflowInput2", RFdata[i + 1][outflowCol]);
                    setValue("housedInput2", RFdata[i + 1][housedCol]);
                }
                if (RFdata[i + 2][cmtyCol] == selectedCmty && RFdata[i + 2][popCol] == selectedPop && RFdata[i + 2][subpopCol] == selectedSubpop) {
                    setValue("monthDropdown3", RFdata[i + 2][monthCol]);
                    setValue("inflowInput3", RFdata[i + 2][inflowCol]);
                    setValue("outflowInput3", RFdata[i + 2][outflowCol]);
                    setValue("housedInput3", RFdata[i + 2][housedCol]);
                }
                dataFound = true;
                break;
            }
        }
        if (!dataFound) {
            setInnerHTML("autofillError", "Sorry, no data was found.");
        }
    } else {
        setInnerHTML("autofillError", "Please select a Community, Population, and Subpopulation first.");
    }
};

// DISPLAY RESULTS AND WRITE TO GOOGLE SHEET WHEN "SUBMIT" IS CLICKED
// Calculates averages, calculates goal, displays goal, and submits data to Google Sheets
function submitData(formName){
    const form = document.forms[formName];
    
    form.addEventListener("submit", (e) => {
        console.log("submit button clicked");
        e.preventDefault();

        // 3 Mo Averages (current inflow/outflow rates)
        var avg3MoInflow = Math.ceil((getNumVal("inflowInput1") + getNumVal("inflowInput2") + getNumVal("inflowInput3")) / 3);
        var avg3MoTotalOutflow = Math.ceil((getNumVal("outflowInput1") + getNumVal("outflowInput2") + getNumVal("outflowInput3")) / 3);
        var avg3MoHoused = Math.ceil((getNumVal("housedInput1") + getNumVal("housedInput2") + getNumVal("housedInput3")) / 3);
        // Targeted Monthly Net Change Rate
        var timeframe = monthDiff(getDateVal("currentMonth"), getDateVal("targetMonthDropdown"));
        var targetNetChange = getNumVal("currentActivelyHomelessInput") - getNumVal("targetActivelyHomelessInput");
        var targetNetChangeRate = Math.ceil(targetNetChange / timeframe);
        // Targeted Monthly Outflow Rate & Targeted Monthly Housing Rate
        var targetOutflowRate = avg3MoInflow + targetNetChangeRate;
        var avgOtherOutflow = avg3MoTotalOutflow - avg3MoHoused;
        var targetHousingRate = targetOutflowRate - avgOtherOutflow;

        // Get HP and Outflow values for validation
        var outflow1 = document.getElementById("outflowInput1").valueAsNumber;
        var hp1 = document.getElementById("housedInput1").valueAsNumber;
        var outflow2 = document.getElementById("outflowInput2").valueAsNumber;
        var hp2 = document.getElementById("housedInput2").valueAsNumber;
        var outflow3= document.getElementById("outflowInput3").valueAsNumber;
        var hp3 = document.getElementById("housedInput3").valueAsNumber;

        // Data validation - Current AH should be > Target AH 
        if (targetNetChange <= 0) {
            hideGoals(); // Hide goals and goal parameters
            setInnerHTML("dataValidationWarning", "<b>ERROR: </b>Target Actively Homeless Number should be smaller than the Current Actively Homeless Number");
        } else if (outflow1 < hp1 || outflow2 < hp2 || outflow3 < hp3) {
            hideGoals(); // Hide goals and goal parameters
            setInnerHTML("dataValidationWarning", "<b>ERROR: </b>Housing Placement numbers must be smaller than the Total Outflow numbers.");
        } else {
            setInnerHTML("dataValidationWarning", "");
            // Display goal parameters
            setInnerHTML("paramNumMonths", timeframe);
            setInnerHTML("paramTargetNetChange", targetNetChange);
            setInnerHTML('paramAvgInflow', avg3MoInflow);
            setInnerHTML("paramAvgHoused", avg3MoHoused);
            setInnerHTML("paramAvgOutflow", avg3MoTotalOutflow);

            // Display the goal and explanation            
            displayBlock("goal");
            if (targetHousingRate <= 0) {
                setInnerHTML("displayGoal", "With your current housing placement rate of " + avg3MoHoused + " individuals housed each month, you are already on track to meet your goal. Keep it up!");
            } else {
                setInnerHTML("goalTargetHousingRate", targetHousingRate);    
                displayBlock("explanation1");
                displayBlock("explanation2");
                displayBlock("explanation3");

                setInnerHTML("explanationTargetNetChange", targetNetChange);
                setInnerHTML("explanationNumMonths", timeframe);
                setInnerHTML("explanationTargetNetChangeRate", targetNetChangeRate);

                setInnerHTML("equationTargetNetChange", targetNetChange);
                setInnerHTML("equationNumMonths", timeframe);
                setInnerHTML("equationTargetNetChangeRate", targetNetChangeRate);

                setInnerHTML("explanationAvgInflow", avg3MoInflow)    
                setInnerHTML("explanationTargetOutflowRate", targetOutflowRate);

                setInnerHTML("equationTargetNetChangeRate2", targetNetChangeRate);
                setInnerHTML("equationAvgInflow", avg3MoInflow)
                setInnerHTML("equationTargetOutflowRate", targetOutflowRate);

                setInnerHTML("explanationAvgTotalOutflow", avg3MoTotalOutflow);
                setInnerHTML("explanationAvgHoused", avg3MoHoused);
                setInnerHTML("explanationOtherOutflow", avgOtherOutflow);
                setInnerHTML("explanationTargetHousingRate", targetHousingRate);

                setInnerHTML("equationAvgTotalOutflow", avg3MoTotalOutflow);
                setInnerHTML("equationAvgHoused", avg3MoHoused);
                setInnerHTML("equationOtherOutflow", avgOtherOutflow);

                setInnerHTML("equationTargetOutflowRate2", targetOutflowRate);
                setInnerHTML("equationTargetHousingRate", targetHousingRate);          
                setInnerHTML("equationOtherOutflow2", avgOtherOutflow);     
            }
           
            // Send data to Google 
            console.log("Submitting Data!");
            var formData = new FormData(form);
            var calcFields = [["Timeframe (months)", timeframe], ["Target Net Change", targetNetChange], ["Target Monthly Net Change", targetNetChangeRate],
                ["Average 3 Month Inflow", avg3MoInflow], ["Target Monthly Total Outflow", targetOutflowRate], ["Average 3 Month Total Outflow", avg3MoTotalOutflow],
                ["Average 3 Month Housed", avg3MoHoused], ["Target Monthly Housing Placements", targetHousingRate]];
            for (var i = 0; i < calcFields.length; i++) {
                formData.append(calcFields[i][0], calcFields[i][1]);
            }
            fetch(scriptURL, {method: "POST", body: formData})
                .then((response) => console.log("Success!", response))
                .catch((error) => console.error("Error!", error.message));
        }
    });
}
// Submit form data to Google Sheets
submitData('submitToGoogleSheet');