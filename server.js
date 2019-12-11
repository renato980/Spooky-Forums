const express = require(`express`);
const app = express();
const b = require("bcrypt");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const nunjucks = require(`nunjucks`);
const bodyParser = require(`body-parser`);
const mongoDB = require(`mongodb`);
const mongoClient = mongoDB.MongoClient;
const HOST = `localhost`;
const dbPort = `27017`;
const dbURL = `mongodb://${HOST}`;
const dbName = `project`;
const dbCollection = `users`;
const PORT = 3000;
const port = (process.env.PORT || PORT);
const colors = {
    reset: `\x1b[0m`,
    red: `\x1b[31m`,
    green: `\x1b[32m`,
    yellow: `\x1b[33m`,
};

let db;

nunjucks.configure(`app/controllers/blocks`, {
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
app.use(express.static(`app/views`));

/**
 * Note:
 *    — All req(uests) are from the client/browser.
 *    — All res(ponses) are to the client/browser.
 */

/**
 * This router handles all GET requests to the root of the web site.
 */
app.get(`/`, (req, res) => {
    console.log(`User requested root of web site.`);
    console.log(`Responding to request with file`,
        colors.green, `index.njk`, colors.reset, `via GET.`);

    res.render(`index.njk`);
});

// login
app.get(`/read-a-db-record`, (req, res) => {
		// check to see if username matches existing user
		let userUsername = req.body.username;
    db.collection(dbCollection).find().toArray((err, arrayObject) => {
        if (err) {
            return console.log(err);
        } else {
						// if user does not exist in database
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
				b.compare(req.body.password, userPassword, function(err, match) {
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
										return res.redirect("/login");
								}
    			});
			});
	});

// register a user
app.get(`/create-a-db-record`, (req, res) => {
    res.render(`register.njk`);
});

app.post(`/create-a-db-record`, (req, res) => {
		let userFirst = req.body.firstname;
		let userLast = req.body.lastname;
		let userEmail = req.body.email;
		let userUsername = req.body.username;
		let userPassword = req.body.password;
		//hash password
		db.collection(dbCollection).insertOne(req.body, (err) => {
			if(err){
				return console.log(err);
			}
			else if(result.length === 0){
				b.hash(req.body.password.toString(), 10, function(err, hash) {
					if(err){
						return console.log(err);
					}
					// insert user into DB
					db.collection(dbCollection).insertOne(req.body, (err) => {
						if(err) {
							return console.log(err);
						}
						else {
							console.log(
	                `Inserted one record into Mongo via an HTML form using POST.\n`);
							return res.redirect("/login");
						}
					});
				});
			}
			else {
				return res.redirect("/register");
			}
		});
});
