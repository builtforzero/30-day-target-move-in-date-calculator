// ADD PACKAGES
require('dotenv').config();

// ENV VARIABLES
const apiKey = process.env.API_KEY;
const cmtyNamesSpreadsheetID = process.env.CMTY_NAME_SSID;
const backEndSpreadsheetID = process.env.REDUC_GOAL_SSID;
const scriptURL = process.env.SCRIPT_URL;

// ADD COMMUNITY NAMES TO DROPDOWN
// Get community names from Results to Date Map public Google Sheet
var cmtyNamesRange = 'Sheet2!A2:A';
var getCmtyNamesURL = 'https://sheets.googleapis.com/v4/spreadsheets/' + cmtyNamesSpreadsheetID + '/values/' + cmtyNamesRange + '?key=' + apiKey;

fetch(getCmtyNamesURL)
    .then(function(response) {
        console.log('Successfully pulled Community Names', response);
        return response.json();
    })
    .then(function (data) {
        var responseVals = data.values;
        var communityNames = [].concat.apply([], responseVals);
        for (var i = 0; i < communityNames.length; i++) {
            var opt = document.createElement("option");
            opt.textContent = communityNames[i];
            opt.value = communityNames[i];
            document.getElementById("communityDropdown").appendChild(opt);
        }
    })
    .catch(error => console.error('Error!', error.message));

// SET CURRENT DATE AND RESTRICT DATE INPUT VALUES
// Default Current Month based on today's date
var today = new Date();
var todayMo = today.getMonth();
var todayYr = today.getFullYear();
document.getElementById("currentMonth").valueAsDate = new Date(todayYr, todayMo, 1);
// Limit the Current month to dates today & after + 3 months of data input to dates before today's date
var thisMo = (todayMo + 1).toString();
if (todayMo + 1 < 10) {
    thisMo = '0' + thisMo;
}
document.getElementById("currentMonth").min = todayYr + "-" + thisMo;
document.getElementById("monthDropdown1").max = todayYr + "-" + thisMo;
document.getElementById("monthDropdown2").max = todayYr + "-" + thisMo;
document.getElementById("monthDropdown3").max = todayYr + "-" + thisMo;
// Limit Target to dates after today's date
var nextMo = (todayMo + 2).toString();
if (todayMo + 2 < 10) {
    nextMo = '0' + nextMo;
}
document.getElementById("targetMonthDropdown").min = todayYr + "-" + nextMo;

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
    })
    .catch(error => console.error('Error!', error.message));

document.getElementById("autofill-button").onclick = function() {
    // Clear any existing values
    document.getElementById("monthDropdown1").value = "";
    document.getElementById("inflowInput1").value = "";
    document.getElementById("outflowInput1").value = "";
    document.getElementById("housedInput1").value = "";
    document.getElementById("monthDropdown2").value = "";
    document.getElementById("inflowInput2").value = "";
    document.getElementById("outflowInput2").value = "";
    document.getElementById("housedInput2").value = "";
    document.getElementById("monthDropdown3").value = "";
    document.getElementById("inflowInput3").value = "";
    document.getElementById("outflowInput3").value = "";
    document.getElementById("housedInput3").value = "";

    var cmtyDropdown = document.getElementById("communityDropdown");
    var selectedCmty = cmtyDropdown.options[cmtyDropdown.selectedIndex].text;
    var popDropdown = document.getElementById("populationDropdown");
    var selectedPop = popDropdown.options[popDropdown.selectedIndex].text;
    var subpopDropdown = document.getElementById("subpopulationDropdown");
    var selectedSubpop = subpopDropdown.options[subpopDropdown.selectedIndex].text;

    if (selectedCmty != "Select a Community" && selectedPop != "Select a Population" && selectedSubpop != "Select a Subpopulation") {
        document.getElementById("autofillError").innerHTML = "Numbers reflect self-reported community data.";
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
                document.getElementById("monthDropdown1").value = RFdata[i][monthCol];
                document.getElementById("inflowInput1").value = RFdata[i][inflowCol];
                document.getElementById("outflowInput1").value = RFdata[i][outflowCol];
                document.getElementById("housedInput1").value = RFdata[i][housedCol];
                if (RFdata[i + 1][cmtyCol] == selectedCmty && RFdata[i + 1][popCol] == selectedPop && RFdata[i + 1][subpopCol] == selectedSubpop) {
                    document.getElementById("monthDropdown2").value = RFdata[i + 1][monthCol];
                    document.getElementById("inflowInput2").value = RFdata[i + 1][inflowCol];
                    document.getElementById("outflowInput2").value = RFdata[i + 1][outflowCol];
                    document.getElementById("housedInput2").value = RFdata[i + 1][housedCol];
                }
                if (RFdata[i + 2][cmtyCol] == selectedCmty && RFdata[i + 2][popCol] == selectedPop && RFdata[i + 2][subpopCol] == selectedSubpop) {
                    document.getElementById("monthDropdown3").value = RFdata[i + 2][monthCol];
                    document.getElementById("inflowInput3").value = RFdata[i + 2][inflowCol];
                    document.getElementById("outflowInput3").value = RFdata[i + 2][outflowCol];
                    document.getElementById("housedInput3").value = RFdata[i + 2][housedCol];
                }
                dataFound = true;
                break;
            }
        }
        if (!dataFound) {
            document.getElementById("autofillError").innerHTML = "<b>ERROR: </b>Sorry, no data was found.";
        }
    } else {
        document.getElementById("autofillError").innerHTML = "<b>ERROR: </b>Please select a Community, Population, and Subpopulation first.";
    }
};
function hideLoader() {
    document.getElementById("loader").style.display = "none";
}

// DISPLAY RESULTS AND WRITE TO GOOGLE SHEET WHEN "SUBMIT" IS CLICKED
// Calculates averages, calculates goal, displays goal, and submits data to Google Sheets
function submitData(formName){
    const form = document.forms[formName];
    form.addEventListener("submit", (e) => {
        console.log("submit button clicked");
        e.preventDefault();

        // Calculated fields
        // 3 Mo Averages (current inflow/outflow rates)
        var avg3MoInflow = Math.ceil((
            Number(document.getElementById("inflowInput1").value) + 
            Number(document.getElementById("inflowInput2").value) + 
            Number(document.getElementById("inflowInput3").value)) / 3);
        var avg3MoTotalOutflow = Math.ceil((
            Number(document.getElementById("outflowInput1").value) + 
            Number(document.getElementById("outflowInput2").value) + 
            Number(document.getElementById("outflowInput3").value)) / 3);
        var avg3MoHoused = Math.ceil((
            Number(document.getElementById("housedInput1").value) + 
            Number(document.getElementById("housedInput2").value) + 
            Number(document.getElementById("housedInput3").value)) / 3);
        // Targeted Monthly Net Change Rate
        var currentMo = new Date(document.getElementById("currentMonth").value);
        var targetMo = new Date(document.getElementById("targetMonthDropdown").value);
        var monthDiff = (targetMo.getFullYear() - currentMo.getFullYear()) * 12;
        monthDiff -= currentMo.getMonth();
        monthDiff += targetMo.getMonth();
        var timeframe = monthDiff <= 0 ? 0 : monthDiff;
        var targetNetChange = Number(document.getElementById("currentActivelyHomelessInput").value) -  Number(document.getElementById("targetActivelyHomelessInput").value);
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
            document.getElementById("goalMet").style.display = "none";
            document.getElementById("goal").style.display = "none";
            document.getElementById("goalExplanation").style.display = "none";
            document.getElementById("dataValidationWarning").innerHTML = "<b>ERROR: </b>Target Actively Homeless Number should be smaller than the Current Actively Homeless Number";
        } // Data validation - HP should be < Total Outflow 
        else if (outflow1 < hp1 || outflow2 < hp2 || outflow3 < hp3) {
            document.getElementById("goalMet").style.display = "none";
            document.getElementById("goal").style.display = "none";
            document.getElementById("goalExplanation").style.display = "none";
            document.getElementById("dataValidationWarning").innerHTML = "<b>ERROR: </b>Housing Placement numbers must be smaller than the Total Outflow numbers.";
        }
        else if (timeframe <= 0) {
            document.getElementById("goalMet").style.display = "none";
            document.getElementById("goal").style.display = "none";
            document.getElementById("goalExplanation").style.display = "none";
            document.getElementById("dataValidationWarning").innerHTML = "<b>ERROR: </b>Target Month should be after Current Month.";
        } else {
            // Show loader
            document.getElementById("loader").style.display = "inline-block";

            // Display parameters
            document.getElementById("paramNumMonths").innerHTML = timeframe;
            document.getElementById("paramTargetNetChange").innerHTML = targetNetChange;
            document.getElementById('paramAvgInflow').innerHTML = avg3MoInflow;
            document.getElementById("paramAvgHoused").innerHTML = avg3MoHoused;
            document.getElementById("paramAvgOutflow").innerHTML = avg3MoTotalOutflow;
            document.getElementById("dataValidationWarning").innerHTML = "";

            // Display the goal and explanation
            if (targetHousingRate <= avg3MoHoused) {
                document.getElementById("goal").style.display = "none";
                document.getElementById("goalExplanation").style.display = "none";
                document.getElementById("goalMet").style.display = "block";
                document.getElementById("goalMet").innerHTML = "With your current housing placement rate of <b>" + 
                avg3MoHoused + "</b> individuals housed each month, you are already on track to meet your goal. Keep it up!";
            } else {
                document.getElementById("goalMet").style.display = "none";
                document.getElementById("goal").style.display = "block";
                document.getElementById("goalExplanation").style.display = "grid";
                document.getElementById("currentTargetHousingRate").innerHTML = avg3MoHoused;
                document.getElementById("goalTargetHousingRate").innerHTML = targetHousingRate;    
                document.getElementById("goalTargetHousingRate2").innerHTML = targetHousingRate;

                document.getElementById("explanationTargetNetChange").innerHTML = targetNetChange;
                document.getElementById("explanationNumMonths").innerHTML = timeframe;
                document.getElementById("explanationTargetNetChangeRate").innerHTML = targetNetChangeRate;

                document.getElementById("equationTargetNetChange").innerHTML = targetNetChange;
                document.getElementById("equationNumMonths").innerHTML = timeframe;
                document.getElementById("equationTargetNetChangeRate").innerHTML = targetNetChangeRate;

                document.getElementById("explanationAvgInflow").innerHTML = avg3MoInflow; 
                document.getElementById("explanationTargetOutflowRate").innerHTML = targetOutflowRate;

                document.getElementById("equationTargetNetChangeRate2").innerHTML = targetNetChangeRate;
                document.getElementById("equationAvgInflow").innerHTML = avg3MoInflow;
                document.getElementById("equationTargetOutflowRate").innerHTML = targetOutflowRate;

                document.getElementById("explanationAvgTotalOutflow").innerHTML = avg3MoTotalOutflow;
                document.getElementById("explanationAvgHoused").innerHTML = avg3MoHoused;
                document.getElementById("explanationOtherOutflow").innerHTML = avgOtherOutflow;
                document.getElementById("explanationTargetHousingRate").innerHTML = targetHousingRate;

                document.getElementById("equationAvgTotalOutflow").innerHTML = avg3MoTotalOutflow;
                document.getElementById("equationAvgHoused").innerHTML = avg3MoHoused;
                document.getElementById("equationOtherOutflow").innerHTML = avgOtherOutflow;

                document.getElementById("equationTargetOutflowRate2").innerHTML = targetOutflowRate;
                document.getElementById("equationTargetHousingRate").innerHTML = targetHousingRate;          
                document.getElementById("equationOtherOutflow2").innerHTML = avgOtherOutflow;     
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
            
            // Hide loader
            setTimeout(hideLoader, 500);
        }
    });
}
// Submit form data to Google Sheets
submitData('submitToGoogleSheet');