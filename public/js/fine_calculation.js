// Auto-fill fine status if actual return date is greater than specified return date
document.getElementById('actualReturnDate').addEventListener('change', function() {
    var actualReturnDate = new Date(this.value);
    var specifiedReturnDate = new Date(document.getElementById('specifiedReturnDate').value);
    var fineStatusInput = document.getElementById('fineStatus');
    if (actualReturnDate > specifiedReturnDate) {
        fineStatusInput.value = 10;
    } else {
        fineStatusInput.value = '';
    }
});
