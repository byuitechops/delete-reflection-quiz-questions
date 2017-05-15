/*eslint-env node*/
/*eslint no-unused-vars:0, no-console:0*/

/* This is an example of how to use this library to get all the quizzes in the course
 * and write it out as a CSV file. */


var fs = require('fs'),
    token,
    getAllPages = require('./canvas-pagination.js'),
    dsv = require('d3-dsv'),
    domain = 'https://byui.instructure.com',
    //domain = 'https://byuh.instructure.com',
    course_id = '15',
    //course_id = '1458190',
    apiCall = `/api/v1/courses/${course_id}/quizzes`;


function main() {
    // Get all of the quizzes

    // 1. Get the Token
    var fileName = "token.json";
    var token = getToken(fileName);

    // 2. Make the query
    var query = {
        access_token: token,
        per_page: 20
    };

    // 3. Get all of the quizzes
    getAllPages(domain, apiCall, query, function (err, quizes) {
        //var onesWeLike = quizes.filter(quiz => quiz.title.match(/Level \d/) !== null);
        var onesWeLike = quizes;

        console.log("onesWeLike.length:", onesWeLike.length);
        var colsWeWant = ['id', 'title', 'html_url', 'mobile_url'];
        fs.writeFileSync('allTheQuizes.csv', dsv.csvFormat(onesWeLike));
        fs.writeFileSync('allTheQuizesFilteredCols.csv', dsv.csvFormat(onesWeLike, colsWeWant));
    });


    // Search through the quizzes for the reflection question

    // Delete the reflection question
}

function getToken(fileName) {
    var fileObj = JSON.parse(fs.readFileSync(fileName, 'utf8'))
    return fileObj.token;
}
