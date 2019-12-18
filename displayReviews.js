/*const express = require(`express`);
const app = express();
const bcrypt = require("bcrypt");
const nunjucks = require(`nunjucks`);
const bodyParser = require(`body-parser`);
const mongoDB = require(`mongodb`);
const mongoClient = mongoDB.MongoClient;
const HOST = `localhost`;
const dbPort = `27017`;
const dbURL = `mongodb://${HOST}`;
const dbName = `spooky`;
const dbCollection = `users`;
const dbCollection2= 'reviews';
const PORT = 8080;
const port = (process.env.PORT || PORT);
const colors = {
    reset: `\x1b[0m`,
    red: `\x1b[31m`,
    green: `\x1b[32m`,
    yellow: `\x1b[33m`,
};

app.post(`/alien-review-in-db`, (req, res) => {
		let reviewMessage = req.body.review;
		let reviewScore = req.body.rating;
		let game = "Alien: Isolation";
		db.collection(dbCollection2).insertOne({Title: game, Score: reviewScore, Message: reviewMessage}, (err) => {
				if(err) {
					return console.log(err);
				}
				else {
					console.log(`Inserted one review into Mongo via an HTML form using POST.\n`);
					let html ="";
					let totalReviews = 7;
					for (var i = 0; i != totalReviews; i++) {
						let review = db.collection(dbCollection2).find({Message: {$slice: i}});
						html +='<div class="review_block"><h3>Review ' + i +'</h3><p>' + review +'</p></div>';
						res.send(html);
					}
				}
		});
})
*/
