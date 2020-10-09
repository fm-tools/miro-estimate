
// Let's catch all references to elements in the view
let totalSelectedElements = document.querySelectorAll('.js-total-selected');
let totalEstimatedElements = document.querySelectorAll('.js-total-estimated');
let sumSelectedElements = document.querySelectorAll('.js-sum-selected');
let avgSelectedElements = document.querySelectorAll('.js-avg-selected');
let statsTable = document.querySelector('.js-stats-table tbody');
let selectButton = document.querySelector('.js-select');
let selectOptions = document.querySelector('.js-select-options');
let exportButtons = document.querySelectorAll('.js-export');

// Global variables, so we can cache the results
let allEstimates = {};
let teamMembers = {};

// Fire off the functionality when miro is ready
miro.onReady(async () => {
    registerListeners();
    await reloadEverything();
});

/**
 * Registers listeners for miro events, as well as clicks etc.
 */
function registerListeners() {
    miro.addListener('CANVAS_CLICKED', async function (event) {
        await writeOutput(allEstimates);
    });

    miro.addListener('SELECTION_UPDATED', async function (event) {
        await writeOutput(allEstimates);
    });

    miro.addListener('DATA_BROADCASTED', async function (event) {
        if (event.data == "change_notification") {
            await reloadEverything();
        }
    });

    selectButton.addEventListener('click', selectWidgets);

    exportButtons.forEach(element => {
        element.addEventListener('click', exportData);
    });
}

/**
 * We are catching many events, debouncing is the wisest way to go
 */
async function reloadEverything() {
    reloadDebounced();
}

const reloadDebounced = debounce(reloadEstimatesAndWriteOutput, 50);

async function reloadEstimatesAndWriteOutput() {
    await processEstimates();
    await writeOutput(allEstimates);
}

/**
 * Integers should stay integers, floats should be rounded to 2 decimal places
 *
 * @param number
 * @returns {string|number}
 */
function roundWithPrecision(number) {
    if (number - Math.round(number) != 0) {
        return parseFloat(number).toFixed(1);
    }
    return Math.round(number);
}

/**
 * Converts widgets' metadata into internally structured estimate object
 *
 * @returns {Promise<void>}
 */
async function processEstimates() {

    let estimated = await fetchEstimatedWidgets();

    allEstimates = estimated.map((widget) => {

        let textField = Config.supported_widgets[widget.type.toLowerCase()];

        return {
            'id': widget.id,
            'estimates': widget.metadata[Config.app_id].estimate,
            'sum': widget.metadata[Config.app_id].estimate,
            'plaintext': widget[textField] === undefined ? '' : widget[textField],
        }
    });

    return allEstimates;
}

/**
 * Fetches all items that have some estimate stored
 */
async function fetchEstimatedWidgets() {

    return (await miro.board.widgets.get())
        .filter(item => {
            // Widget is "not estimated" if we didn't store any estimate in it
            if (item.metadata[Config.app_id] === undefined) {
                return false;
            }

            // The same applies when there's no user estimation stored
            if (!item.metadata[Config.app_id].estimate > 0) {
                return false;
            }

            return true;
        });
}

/**
 * Selects specified group of widgets.
 * Uses a little bit of array magic, so the comments are more thorough
 *
 * @returns {Promise<void>}
 */
async function selectWidgets() {

    let ids = [];

    // Figure out the chosen option for select
    switch (selectOptions.options[selectOptions.selectedIndex].value) {

        case 'with_estimates':
            // Just take all the estimate items' ids
            ids = allEstimates.map(item => item.id);
            break;

        case 'without_estimates':
            // We need to make diff between estimated and all widgets
            // Let's remember ids of estimated ones...
            let estimatedIds = allEstimates.map((item) => item.id);

            // ...then take all widgets...
            ids = (await miro.board.widgets.get())
                // ...remove the ones that have any estimate...
                .filter(widget => !estimatedIds.includes(widget.id))
                // ...and take ids of the rest
                .map(widget => widget.id);
            break;

        case 'my_estimates':
            let userId = await miro.currentUser.getId();
            // Filter out the items, that don't have estimate from current user
            ids = allEstimates
                .filter(item => item.estimates[userId] !== undefined)
                .map(item => item.id);
            break;
    }

    await miro.board.selection.selectWidgets(ids);
}

/**
 * Calculates the numbers and writes them into the tables
 *
 * @param estimates
 * @returns {Promise<void>}
 */
async function writeOutput(estimates) {

    let selectedWidgets = await miro.board.selection.get();

    if (selectedWidgets.length > 0) {
        let onlyIds = selectedWidgets.map(item => item.id);
        estimates = estimates.filter(item => onlyIds.includes(item.id));
    }

    await writeToOverviewTable(estimates, selectedWidgets);
    await writeStatsToTable(estimates);
}

/**
 * (Re)populates the overview table with current values
 */
async function writeToOverviewTable(estimates, selected) {

    // Calculate sum of all estimates
    let estimatesSum = estimates.reduce((accumulator, item) => accumulator + item.sum, 0);

    // Calculate average estimate per widget
    let estimatesAvg = estimates.length > 0 ? estimatesSum / estimates.length : 0;

    // Write total estimates
    totalEstimatedElements.forEach(element => {
        element.innerHTML = estimates.length.toString();
    })

    // Write selection count
    totalSelectedElements.forEach(element => {
        if (selected.length == 0) {
            element.innerHTML = 'all';
        } else {
            element.innerHTML = selected.length.toString();
        }
    })

    // Write sum
    sumSelectedElements.forEach(element => {
        element.innerHTML = roundWithPrecision(estimatesSum).toString();
    })

    // Write average
    avgSelectedElements.forEach(element => {
        element.innerHTML = roundWithPrecision(estimatesAvg).toString();
    })
}

/**
 * Small helper function for creating loading spinner
 */
function createSpinner() {

    // Spinner may already be loaded (async yay)
    if (statsTable.querySelector('.loader-ring') !== null) {
        return false;
    }

    let loadingRow = statsTable.insertRow(0);
    let cell = loadingRow.insertCell();
    cell.setAttribute('colspan', '4');
    cell.innerHTML = Config.spinner_element;

    return loadingRow;
}

/**
 * Create ad-hoc CSV content
 */
function createCsvContent() {
    let content = "data:text/csv;charset=utf-8,";

    allEstimates.forEach(function (item) {
        content += `'${item.id}','${item.plaintext}','${item.sum}'` + "\r\n";
    });

    return encodeURI(content);
}

/**
 * Create ad-hoc XLS content.
 *
 * Here's an example of functionality where external library could be more useful.
 * But we don't want to use any.
 */
function createXlsContent() {

    let content = 'data:application/vnd.ms-excel;base64,';
    let innerContent = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">'
        + '<head>'
        + '<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{Estimates}</x:Name>'
        + '<x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook>'
        + '</xml><![endif]-->'
        + '<meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>'
        + '</head><body><table>';

    innerContent += '<tr><td>Widget ID</td><td>Title</td><td>Sum</td></tr>';

    allEstimates.forEach(function (item) {
        innerContent += `<tr><td>'${item.id}</td><td>${item.plaintext}</td><td>${item.sum}</td></tr>`;
    });

    innerContent += '</table></body></html>';

    return content + window.btoa(unescape(encodeURIComponent(innerContent)));
}

/**
 * Exports estimates file in user selected format
 *
 * @param event
 * @returns {Promise<void>}
 */
async function exportData(event) {

    let format = event.target.value;
    let filename = (await miro.board.info.get()).title + '.' + format;

    let fileContent = '';

    switch (format) {
        case 'csv':
            fileContent = createCsvContent();
            break;
        case 'xls':
            fileContent = createXlsContent();
            break;
    }

    let link = document.createElement("a");
    link.setAttribute("href", fileContent);
    link.setAttribute("download", filename);

    document.body.appendChild(link);
    link.click();
}

/**
 * Debounce function from internets
 * https://stackoverflow.com/questions/24004791/can-someone-explain-the-debounce-function-in-javascript
 *
 * (Who would write his own debounce in 2019, right?)
 */
function debounce(func, wait, immediate) {
    let timeout;
    return function () {
        let context = this;
        let args = arguments;
        let callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(function () {
            timeout = null;
            if (!immediate) {
                func.apply(context, args);
            }
        }, wait);
        if (callNow) func.apply(context, args);
    }
}
