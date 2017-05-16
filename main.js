/*eslint-env node*/
/*eslint no-unused-vars:0, no-console:0*/

/* This is an example of how to use this library to get all the quizzes in the course
 * and write it out as a CSV file. */


var fs = require('fs'),
    aysync = require('async'),
    request = require('request'),
    getAllPages = require('canvas-pagination'),
    dsv = require('d3-dsv'),
    //domain = 'https://byui.instructure.com',
    fileName = "token.json",
    token = getToken(fileName),
    domain = 'https://byuh.instructure.com',
    //course_id = '15',
    course_id = '1458190',
    apiCall = '/api/v1/courses/' + course_id + '/quizzes',
    query = {
        access_token: token,
        per_page: 20
    };


function main() {
    // Get all of the quizzes
    getAllPages(domain, apiCall, query, function (err, quizes) {
        //var onesWeLike = quizes.filter(quiz => quiz.title.match(/Level \d/) !== null);
        var allQuizzes = quizes;

        // Search through the quizzes for the reflection question and delete the reflection question
        searchQuizzes(allQuizzes);

        /*for (var i = 0; i < allQuizzes.length; i++) {
            console.log(allQuizzes[i].id);
        }*/

        /*console.log("onesWeLike.length:", onesWeLike.length);
        //console.log("onesWeLike:", onesWeLike);
        var colsWeWant = ['id', 'title'];
//        fs.writeFileSync('allTheQuizes.csv', dsv.csvFormat(onesWeLike));
        fs.writeFileSync('allTheQuizesFilteredCols.csv', dsv.csvFormat(onesWeLike, colsWeWant));
        console.log('Finished');*/
    });
}

function getToken(fileName) {
    var fileObj = JSON.parse(fs.readFileSync(fileName, 'utf8'))
    return fileObj.token;
}

function searchQuizzes(allQuizzes) {
    // Make an array of all the urls that we are going to GET request
    var quizUrls = [];
    allQuizzes.forEach(function (quiz) {
        // Make a query URL
        var quizQuestionBaseUrl = 'https://byuh.instructure.com/api/v1/courses/' + course_id + '/quizzes/' + quiz.id + '/questions';
        var quizQuestionUrl = quizQuestionBaseUrl + '?access_token=' + token;

        quizUrls.push({
            getUrl: quizQuestionUrl,
            name: quiz.title
        });
    });

    // Do an async.mapLimit on only one at a time to keep data requests down
    aysync.mapLimit(quizUrls, 15, getRequestQuestions, function (error, results) {
        if (error) {
            console.error('HELLO');
            return;
        } else {
            // We now have a valid array of questions.  Therefore, it should be an array of arrays, with each element being a quiz we searched for.
            var questionsToDelete = [];
            results.forEach(function (quizQuestions) {
                //console.log(Array.isArray(quizQuestions));
                quizQuestions.forEach(function (question) {
                    if (question.question_text.includes('Think about it...')) {
                        // We have found a question to delete!
                        //deleteQuestion(question);

                        //console.log(question.question_text);

                        var parsedQuestion = {
                            quiz_id: question.quiz_id,
                            quiz_name: question.quiz_name,
                            question_id: question.id,
                            question_name: question.question_name,
                            question_text: question.question_text
                        };

                        questionsToDelete.push(parsedQuestion);
                    }
                });
            });

            // Output a file of the found questions that will be deleted before deleting them
            questionsToDelete.forEach(function (question) {
                console.log(question.quiz_name);
            })
            var questionColumns = ['quiz_id', 'quiz_name', 'question_id', 'question_name', 'question_text'];
            fs.writeFileSync('foundQuizQuestionsToDelete.csv', dsv.csvFormat(questionsToDelete));
        }
    });
}

/*function deleteQuestion(foundQuestion) {
    // Make the delete url
    var deleteUrl = quizQuestionBaseUrl + '/' + question.id + '?access_token=' + token;
    console.log(deleteUrl);
    request.delete(deleteUrl, function (error, response, body) {
        if (error) {
            console.error(error);
        } else {
            console.log('QUESTION DELETED');
        }
    });
}*/

function getRequestQuestions(quiz, callback) {
    function addQuizName(question) {
        question.quiz_name = quiz.name;
        return question;
    }

    request.get(quiz.getUrl, function (error, response, body) {
        if (error) {
            callback(error);
        } else {

            var questions = JSON.parse(body).map(addQuizName);
            //console.log(questions);

            //console.log(questions.length);
            callback(null, questions);
        }
    });
}

main();
