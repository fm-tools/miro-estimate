// Catch references to elements
let estimateInputElement = document.querySelector('.js-estimate');
let estimatePlusMinusElements = document.querySelectorAll('.js-estimate-plus-minus');
let logInputElement = document.querySelector('.js-log');
let logPlusMinusElements = document.querySelectorAll('.js-log-plus-minus');

// Place to cache info about current modal
let modalInfo = {};

// Wait for Miro to be ready
miro.onReady(async () => {

    // Cache these values, they won't change during the runtime
    modalInfo = {
        widgets: await miro.board.selection.get(),
        userId: await miro.currentUser.getId()
    };

    registerListeners();
});

// Registers listeners to clicks, enters etc.
function registerListeners() {

    estimatePlusMinusElements.forEach(element => {
        element.addEventListener('click', (event) => {
            let val = changeInputValue(estimateInputElement, event.target.value);
            updateEstimates(val, 'estimate');
        });
    });

    logPlusMinusElements.forEach(element => {
        element.addEventListener('click', (event) => {
            let val = changeInputValue(logInputElement, event.target.value)
            updateEstimates(val, 'logged')
        });
    });
}

// Update the estimates for the widget
async function updateEstimates(value, type) {

    let widgetsToUpdate = [];

    modalInfo.widgets.forEach((widget) => {

        let metadata = widget.metadata;

        // If our app didn't write any estimate for this widget before, we
        // need to create the whole structure anew
        if (metadata[Config.app_id] === undefined) {
            let alttype = type === "estimate" ? "logged" : "estimate";
            metadata = { [Config.app_id]: { [type]: value, [alttype]: 0 } };
        } else {
            // We already have the structure ready, let's just write new value
            metadata[Config.app_id][type] = value;
        }

        widgetsToUpdate.push({
            id: widget.id,
            card: {
                customFields: [{
                    value: `${metadata[Config.app_id].logged} / ${metadata[Config.app_id].estimate}`,
                    iconUrl: "https://cdn2.iconfinder.com/data/icons/dark-action-bar-2/96/select_all-512.png"
                }]
            },
            metadata: metadata
        });
    });

    // Store new metadata in bulk
    if (widgetsToUpdate.length > 0) {
        await miro.board.widgets.update(widgetsToUpdate);
    }
}

// Change the value of an input element
function changeInputValue(element, delta) {
    let estimate = element.value;

    if (!isNumeric(estimate)) {
        estimate = 0;
    }

    element.value = (parseFloat(estimate) + parseInt(delta) >= 0 ? parseFloat(estimate) + parseInt(delta) : 0).toString();

    return element.value
}

// Number check helper function
function isNumeric(value) {
    if (isNaN(parseFloat(value)) || !isFinite(value)) {
        return false;
    }

    return true;
}