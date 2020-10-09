function changeInputValue(element, delta) {
    let estimate = element.value;

    if (!isNumeric(estimate)) {
        estimate = 0;
    }

    element.value = (parseFloat(estimate) + parseInt(delta)).toString();
}