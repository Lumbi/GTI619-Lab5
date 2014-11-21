/**
 * Created by Gus on 11/20/2014.
 */
var redis=require('redis');
client = redis.createClient();


function getQuestion(cookies,user,res){

var qa=generateQuestion(user);
console.log("Q "+qa[0]);
console.log("A "+qa[1]);

    client.set(cookies, qa[1], function (err, reply) {

        res.render('gridcard.ejs', { question: qa[0] });

    });
    client.expire(cookies,60*4);

}


function validateAnswer(cookies,answer,req,res){

    client.get(cookies,function (err, reply) {
        if(answer==reply){
            req.session.twofactor=true;
            res.redirect('/profile');

        }
        else{
            res.redirect('/logout');
        }
    });
}

function generateQuestion(user){
var question=''
var answer='';
var gridCard= getcard(user.local.gridcard);

    for( var i=0; i < 4; i++ ) {
        var letter = Math.floor(Math.random() * 9 + 1);
        var number = Math.floor(Math.random() * 9 + 1);
        question+=gridCard[0][letter]+gridCard[number][0];
        answer+=gridCard[number][letter];

        if(i!=3){
            question+='-';
            answer+='-'
        }

    }
    return[question,answer]


}
function getcard(cardString){
    var cardOneDimensionArray=cardString.split(';')
    var cardTwoDimensionArray=[];

    for (var i = 0; i < cardOneDimensionArray.length; i++) {
        cardTwoDimensionArray[i] = cardOneDimensionArray[i].split(',');
    }
return cardTwoDimensionArray;
}
exports.getQuestion=getQuestion;
exports.validateAnswer=validateAnswer