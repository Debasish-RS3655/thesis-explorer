var documentType = document.getElementById("documentType");
var input = document.getElementById("data");
var labelData = document.getElementById('labelData');
var resultCaption = document.getElementById('resultCaption');
var results = document.getElementById('resultArea');
const textbtn = document.getElementById("textbtn");
const urlbtn = document.getElementById("urlbtn");
const searchbtn = document.getElementById("search");
var searchType = undefined;

textbtn.addEventListener('click', () => {
    searchType = 'text';
    documentType.innerHTML = "<h2>Document type: Text</h2>";
    labelData.innerText = "Type or paste the text right here: ";
})

urlbtn.addEventListener('click', () => {
    searchType = "url";
    documentType.innerHTML = "<h2>Document type: Website</h2>";
    labelData.innerText = "Type or paste the URL right here: ";
})

searchbtn.addEventListener('click', () => {
    if (searchType !== undefined && input.value !== "") {
        fetch('http://127.0.0.1:3000/search', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify({
                type: searchType,
                data: input.value
            })
        })
            .then(r => r.json())
            .then(res => {
                console.log(res.data);
                displayResults(res);
                searchType = undefined;     //clear the search type after we have made the search
            })
            .catch(err => {
                errorDisplay(err);
            });
    }
    else
        resultCaption.innerText = (searchType == undefined) ? "Please choose the document type to search" : "Please enter the data to search";
})

function displayResults(data) {
    if (data.status == 'success') {
        resultCaption.innerHTML = "<h3>Here's what you wanted,</h3>";
        //Google scholar results 
        //https://scholar.google.com/scholar?q=affective+computing
        let GSsearch_query = "https://scholar.google.com/scholar?q=" + data.data.replace(" ", "+");
        document.getElementById('GStitle').innerHTML = `<h2 align="center">Google Scholar results</h2>
        <a href="${GSsearch_query}" target="_blank""><h3 align="center">Go to Google Scholar results</h3></a>`;

        //Microsoft Academic
        document.getElementById('MSAtitle').innerHTML = "<h2>Microsoft Academic results</h2><br>";
        //https://academic.microsoft.com/search?q=affective%20computing
        let MSAsearch_query = "https://academic.microsoft.com/search?q=" + data.data.replace(" ", "%20");
        let MSacademic = document.createElement('iframe');
        results.appendChild(MSacademic);
        MSacademic.width = "100%";
        MSacademic.src = MSAsearch_query;
        MSacademic.height = "700px";
    }
    else errorDisplay();
}

function errorDisplay(err) {
    var errMsg = '<h2>Oops! Looks like something went wrong.</h2>';
    if (err) errMsg += `<br><h3>Error Message: ${err}</h3>`;
    resultCaption.innerHTML = errMsg;
}