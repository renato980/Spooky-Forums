const express = require(`express`);
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

// Express’ way of setting a variable. In this case, “view engine” to “njk”.
app.set(`view engine`, `njk`);

// Express middleware to parse incoming, form-based request data before processing
// form data.
app.use(bodyParser.urlencoded({extended: true}));

// Express middleware to parse incoming request bodies before handlers.
app.use(bodyParser.json());

// Express middleware to server HTML, CSS, and JS files.
app.use(express.static(`views`));

// load homepage
app.get(`/`, (req, res) => {
    res.render(`index.html`);
});

// get and render all the pages
app.get(`/*`, (req, res) => {
		res.render(req.params[0] + ".html");
});

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
					console.log(`User does not exist.\n`);
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
							console.log(`User exists.\n`);
							return res.redirect("/index");
						} else {
							console.log(`Password is incorrect.\n`);
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
							console.log(`Inserted one record into Mongo via an HTML form using POST.\n`);
							res.redirect("/login");
						}
				});
		});
});

//submitting Reviews for each game
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
					res.redirect("back");
				}
		});
	});

//original review submission
/*	app.post(`/alien-review-in-db`, (req, res) => {
			let reviewMessage = req.body.review;
			let game = "Alien: Isolation";
			db.collection(dbCollection2).insertOne({Title: game, Message: reviewMessage}, (err) => {
					if(err) {
						return console.log(err);
					}
					else {
						console.log(`Inserted one review into Mongo via an HTML form using POST.\n`);
						res.redirect("back");
					}
			});
		}); */
