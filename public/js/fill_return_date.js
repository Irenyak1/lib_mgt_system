// Function to auto-fill Specified Return Date with a date strictly one week after Issue Date
document.getElementById('issueDate').addEventListener('change', function() {
    var issueDate = new Date(this.value);
    var specifiedReturnDate = new Date(issueDate);
    specifiedReturnDate.setDate(specifiedReturnDate.getDate() + 7);
    var formattedDate = specifiedReturnDate.toISOString().substr(0, 10);
    document.getElementById('specifiedReturnDate').value = formattedDate;
});
