const express = require(`express`);
const app = express();
const bcrypt = require("bcrypt");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const nunjucks = require(`nunjucks`);
const bodyParser = require(`body-parser`);
const mongoDB = require(`mongodb`);
const mongoClient = mongoDB.MongoClient;
const HOST = `localhost`;
const dbPort = `27017`;
const dbURL = `mongodb://${HOST}`;
const dbName = `spooky`;
const dbCollection = `users`;
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
app.set(`view engine`, `html`);

// Express middleware to parse incoming, form-based request data before processing
// form data.
app.use(bodyParser.urlencoded({extended: true}));

// Express middleware to parse incoming request bodies before handlers.
app.use(bodyParser.json());

// Express middleware to server HTML, CSS, and JS files.
app.use(express.static(`views`));

// This router handles all GET requests to the root of the web site.
app.get(`/`, (req, res) => {
    console.log(`User requested root of web site.`);
    console.log(`Responding to request with file`,
        colors.green, `index.html`, colors.reset, `via GET.`);

    res.render(`index.html`);
});

// get and render all the pages
app.get(`/*`, (req, res) => {
		res.render(req.params[0] + ".html");
});

// login **DOES NOT WORK
app.post(`/get-user-from-db`, (req, res) => {
		// check to see if username matches existing user
		let userUsername = req.body.username;
    db.collection(dbCollection).findOne({username: req.body.username}, function(err, user) {
        if (err) {
            return console.log(err);
        } else {
						// if user does not exist in database
						console.log(`User does not exist.\n`);
						console.log(`Username entered is ` + req.body.username + '\n');
						return res.redirect("/login");
				}
				// extract user info
				let userUsername;
				let userPassword;
				if(user !== undefined) {
						userUsername = user.username;
						userPassword = user.password;
				}
				// check to see if password matches existing password
				bcrypt.compare(req.body.password, userPassword, function(err, match) {
						if(err) {
								return console.log(err);
						}
						// if password is correct
						if(match) {
								// get private key
								fs.readFile(path.join(__dirname, "private.key"), function(err, key){
										if(err){
												return console.log(err);
										}
										// send cookie to user
										else {
												jwt.sign({
														username: userUsername,
														email: userEmail
												}, key, function(err, token) {
														if(err) {
																return console.log(err);
														}
														res.cookie("user_info", {
																											token: token,
																											username: userUsername,
																											email: userEmail
																										},
																{httpOnly: true, domain: "localhost"});
														return res.redirect("/auth/index");
														});
												}
										});
								}
								// if password is incorrect, reload page
								else {
										console.log(`Password is incorrect.\n`);
										return res.redirect("/login");
								}
    			});
			});
	});

// register a user
app.get(`/register`, (req, res) => {
    res.render(`register.njk`);
});

app.post(`/create-user-in-db`, (req, res) => {
		// hash and salt password before inserting into db
		let fname = req.body.firstname;
		let lname = req.body.lastname;
		let email = req.body.email;
		let username = req.body.username;
		let password = req.body.password;
		bcrypt.hash(password, 10,function(err, hash) {
				db.collection(dbCollection).insertOne({fname, lname, email, username, password: hash}, (err) => {
						if(err) {
							return console.log(err);
						}
						else {
							console.log(`Inserted one record into Mongo via an HTML form using POST.\n`);
							console.log('HASH: ', hash);
							res.redirect("/login");
						}
				});
		});
});
