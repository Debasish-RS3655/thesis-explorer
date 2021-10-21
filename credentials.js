exports.Watson = {
    version: '2018-11-16', 
    apikey: "<your api key here>",
    url: "<your URL here>",
    concepts: {
        required: true,
        limit: 4
    },
    categories: {
        required: false,
        limit: 1,
    },
    entities: {
        required: true,
        limit: 2
    },
    keywords: {
        required: true,
        limit: 2
    },
    metadata: {
        required: false
    }

}