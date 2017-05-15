/*eslint-env node*/
/*eslint no-unused-vars:0, no-console:0*/

/* This is an example of how to use this library to get all the quizzes in the course
 * and write it out as a CSV file. */


var fs = require('fs'),
    token = require('./getToken.js')('./token.json'),
    getAllPages = require('./canvas-pagination.js'),
    dsv = require('d3-dsv'),
    domain = 'https://byuh.instructure.com',
    course_id = '1458190',
    apiCall = `/api/v1/courses/${course_id}/quizzes`,

    query = {
        access_token: token,
        per_page: 20
    };



getAllPages(domain, apiCall, query, function (err, quizes) {
    //var onesWeLike = quizes.filter(quiz => quiz.title.match(/Level \d/) !== null);
    var onesWeLike = quizes;

    console.log("onesWeLike.length:", onesWeLike.length);
    var colsWeWant = ['id', 'title', 'html_url', 'mobile_url'];
    fs.writeFileSync('allTheQuizes.csv', dsv.csvFormat(onesWeLike));
    fs.writeFileSync('allTheQuizesFilteredCols.csv', dsv.csvFormat(onesWeLike, colsWeWant));
});