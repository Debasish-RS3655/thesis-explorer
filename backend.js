//the backend is analyszes the document using Watson NLU
//and then sends the search keywords back to the frontend
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', false); //no cookies needed
    next(); //pass to the next layer of middleware
});
app.use(bodyParser.json());
app.use('/file', express.static(path.join(__dirname)));

//initialising Watson NLU with credentials
const credentials = require("./credentials.js");
const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1');
const { IamAuthenticator } = require('ibm-watson/auth');
const naturalLanguageUnderstanding = new NaturalLanguageUnderstandingV1({
    version: credentials.Watson.version,
    authenticator: new IamAuthenticator({
        apikey: credentials.Watson.apikey,
    }),
    url: credentials.Watson.url,
});

//receive and handle search requests using POST
app.post('/search', (req, res) => {
    //initiate to extract the desired features
    var params = {
        //the features to be analysed in the speech, will be included later
        'features': {}
    };

    //determine the type of the request: text or url
    switch (req.body.type) {
        case 'url': params.url = req.body.data; break;
        case 'text': params.text = req.body.data; break;
    }

    if (credentials.Watson.concepts.required == true) params.features.concepts = { limit: credentials.Watson.concepts.limit };
    if (credentials.Watson.categories.required == true) params.features.categories = { limit: credentials.Watson.categories.limit };
    if (credentials.Watson.keywords.required == true) params.features.keywords = { limit: credentials.Watson.keywords.limit };
    if (credentials.Watson.entities.required == true) params.features.entities = { limit: credentials.Watson.entities.limit };
    if (credentials.Watson.metadata.required == true) params.features.metadata = {};

    //now we analyse the input data to extract the necessary features
    naturalLanguageUnderstanding.analyze(params)
        .then(analysisResult => {
            console.log(JSON.stringify(analysisResult));
            //since we have the analyzed results we now extract the features from the JSON data
            //extracting concepts
            var concepts = new Array(0);
            if (analysisResult.result.concepts !== undefined)
                for (var i = 0; i < analysisResult.result.concepts.length; i++)
                    concepts[i] = analysisResult.result.concepts[i].text;
            console.log('Concepts: ', concepts);

            //extracting entities 
            var entities = new Array(0);
            if (analysisResult.result.entities !== undefined)
                for (var i = 0; i < analysisResult.result.entities.length; i++)
                    entities[i] = analysisResult.result.entities[i].text;
            console.log('Entities: ', entities);

            //extracting keywords
            var keywords = new Array(0);
            if (analysisResult.result.keywords !== undefined)
                for (var i = 0; i < analysisResult.result.keywords.length; i++) {
                    keywords = analysisResult.result.keywords[i].text;
                }
            console.log('Keywords: ', keywords);

            //extracting categories
            var categories = new Array(0);
            if (analysisResult.result.categories !== undefined)
                for (var i = 0; i < analysisResult.result.categories.length; i++) {
                    var tempData = analysisResult.result.categories[i].label;
                    //one category result contains slashes to separate words
                    //but we need only the words, so we extract the words in between the slashes
                    tempData = tempData.slice(1);   //the first char is a / so we remove that
                    if (tempData.includes('/'))
                        while (tempData.includes('/')) {
                            var slashPos = tempData.indexOf('/');
                            var onecategory = tempData.slice(0, slashPos);
                            tempData = tempData.slice(slashPos + 1);
                            categories.push(onecategory);
                        }
                    else categories.push(tempData);
                }

            console.log('Categories: ', categories);

            //extracting the metadata
            var metadata = new Array(0);
            if (analysisResult.result.metadata !== undefined) {
                let tempRes = analysisResult.result.metadata;
                if (tempRes.title !== undefined) metadata.push(tempRes.title);
                if (tempRes.publication_date !== undefined) {
                    let date = (tempRes.publication_date.includes('T')) ? tempRes.publication_date.slice(0, tempRes.publication_date.indexOf('T')) : tempRes.publication_date;
                    date.replace('-', " ");
                    metadata.push(date);
                }
                if (tempRes.authors !== undefined)
                    for (let i = 0; i < tempRes.authors.length; i++)
                        metadata.push(tempRes.authors[i]);
            }

            var searchKeywords = new Array(0);
            searchKeywords = concepts.concat(entities, keywords, metadata, categories);
            //we send the keywords found back to the frotend
            res.json({
                status: 'success',
                data: convString(getUnique(searchKeywords))
            })
        })
        .catch(err => {
            console.error('error: ', err);
            res.json({ status: "error" });
        });

    function getUnique(arr) {
        return [...new Set(arr)];
    }

    //convert the array into string and remove the extra words
    function convString(array) {
        var theString = "";
        var len = array.length;
        for (var i = 0; i < len; i++)
            theString += array[i] + ' ';
        console.log('Search query: ', theString);
        return theString;
    }
})

app.listen(3000, () => console.log('Article search server running on http://127.0.0.1:3000/'))