const express = require(`express`);
const app = express();
const bcrypt = require('bcrypt');
const session = require('express-session');
const nunjucks = require(`nunjucks`);
const bodyParser = require(`body-parser`);
const cookie = require('cookie-parser');
const mongoDB = require(`mongodb`);
const mongoClient = mongoDB.MongoClient;
const HOST = `localhost`;
const dbPort = `27017`;
const dbURL = `mongodb://${HOST}`;
const dbName = `spooky`;
const dbCollection = `users`;
const dbCollection2 = 'reviews';
const PORT = 8080;
const port = (process.env.PORT || PORT);
const colors = {
    reset: `\x1b[0m`,
    red: `\x1b[31m`,
    green: `\x1b[32m`,
    yellow: `\x1b[33m`,
};

let db;

nunjucks.configure(`views/html`, {
    express: app,
    autoescape: true
});

mongoClient.connect(`${dbURL}:${dbPort}`, (err, client) => {
    if (err) {
        return console.log(err);
    } else {
        db = client.db(dbName);

        console.log(`MongoDB successfully connected:`);
        console.log(`\tMongo URL:`, colors.green, dbURL, colors.reset);
        console.log(`\tMongo port:`, colors.green, dbPort, colors.reset);
        console.log(`\tMongo database name:`,
            colors.green, dbName, colors.reset, `\n`);
    }
});

app.listen(port, HOST, () => {
    console.log(`Host successfully connected:`);
    console.log(`\tServer URL:`, colors.green, `localhost`, colors.reset);
    console.log(`\tServer port:`, colors.green, port, colors.reset);
    console.log(`\tVisit http://localhost:${port}\n`);
});

app.set(`view engine`, `njk`);
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(`views`));
app.use(cookie());

// load homepage
app.get(`/`, (req, res) => {
    res.render(`index.html`);
});

// get and render all the pages
app.get(`/*`, (req, res) => {
		res.render(req.params[0] + ".html");
});

// set up sessions
app.use(session({
	secret: 'spook',
	resave: false,
	saveUninitialized: false
}));

// login
app.post(`/get-user-from-db`, (req, res) => {
		let username = req.body.username;
		let password = req.body.password;

		// check to see if username matches existing user
    db.collection(dbCollection).findOne({username: username}, function(err, user) {
        if (err) {
        	return console.log(err);
        }
				else if(!user){
					// if user does not exist
					console.log(`\nUser does not exist.\n`);
					return res.redirect("/login");
				}
				else {
					// check to see if password matches existing password
					bcrypt.compare(req.body.password, user.password, function (err, match) {
						if (err) {
							return console.log(err);
						}
						if (match) {
							// if password is correct
							console.log(`\nUser exists.\n`);

							req.session.userID = user.username;
							req.session.userPass = user.password;
							console.log(req.session);
							console.log('\n');

							return res.redirect("/index");
						}
						else {
							console.log(`\nPassword is incorrect.\n`);
							return res.redirect("/login");
						}
					});
				}
    });
});

// register a user
app.get(`/register`, (req, res) => {
    res.render(`register.njk`);
});

app.post(`/create-user-in-db`, (req, res) => {
		let fname = req.body.firstname;
		let lname = req.body.lastname;
		let email = req.body.email;
		let username = req.body.username;
		let password = req.body.password;

		// hash and salt password before inserting into db
		bcrypt.hash(password, 10,function(err, hash) {
				db.collection(dbCollection).insertOne({fname, lname, email, username, password: hash}, (err) => {
						if(err) {
							return console.log(err);
						}
						else {
							console.log(`\nCreated user account in database.\n`);
							res.redirect("/login");
						}
				});
		});
});

// user profile
app.get(`/profile`, (req, res) => {
		res.render(`profile.njk`);
});

app.post(`/update-user-password`, (req, res) => {
		let current_user = req.session.userID;
		let old_pass = req.session.userPass;
		let new_pass = req.body.new_password;

		bcrypt.hash(new_pass, 10,function(err, hash) {
				db.collection(dbCollection).updateOne({password: old_pass}, {$set: {password: hash}}, function (err) {
					if (err) {
						return console.log(err);
					}
					else {
						console.log(`\nUpdated user password in database.\n`);
						res.redirect('/update');
					}
				});
		});
});

// delete user account
app.post(`/delete-a-user`, (req, res) => {
		res.redirect("/delete");
});

// user confirms they want to delete account
app.post(`/confirm-delete`, (req, res) => {
		let current_user = req.session.userID;

		db.collection(dbCollection).deleteOne({username: current_user}, (err) => {
			if(err) {
				return console.log(err);
			}
			else {
				console.log('\n' + current_user + ` deleted from database.\n`);
				res.redirect("/index");
			}
		});
});

// user wants to keep account
app.post(`/keep-account`, (req, res) => {
	res.redirect("/profile");
});





// leave a review
app.post(`/put-review-in-db`, (req, res) => {
		let reviewMessage = req.body.review;
		let reviewScore = req.body.rating;
		let game = req.body.title;
		db.collection(dbCollection2).insertOne({Title: game, Score: reviewScore, Message: reviewMessage}, (err) => {
				if(err) {
					return console.log(err);
				}
				else {
					console.log(`Inserted one review into Mongo via an HTML form using POST.\n`);
				}
		});
});

// get reviews
app.post("/get-reviews", function (req,res) {
		let html ="";
		let totalReviews = 3;
		let game = "Alien: Isolation";

		for (var i = 0; i !== totalReviews; i++) {
				db.collection(dbCollection2).find({},{projection:{_id:0, Title: 0}}).toArray(function (err, result){
						html +='<div class="review_block"><h3>Review ' + i +'</h3><p>' + result +'</p></div>';
						res.send(html);
				});
		}
});
