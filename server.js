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
const dbCollection3 = 'contact';
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
		res.clearCookie('user', { path: '/' });
    res.render(`index.html`);
});

app.get("/index", (req, res) => {
		res.clearCookie('user', { path: '/' });
    res.render(`index.html`);
});

app.get("/contact", (req, res) => {
    res.render(`contact.html`);
});

app.get("/register", (req, res) => {
		res.clearCookie('user', { path: '/' });
    res.render(`register.html`);
});

app.get("/login", (req, res) => {
    res.render(`login.html`);
});

// set up sessions
app.use(session({
	key: 'user',
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

							return res.redirect("/profile");
						}
						else {
							console.log(`\nPassword is incorrect.\n`);

							return res.redirect("/login");
						}
					});
				}
    });
});

// create a user
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

// update password
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

				req.session.destroy();
				res.clearCookie('user', { path: '/' });

				res.redirect("/index");
			}
		});
});

// user wants to keep account
app.post(`/keep-account`, (req, res) => {
	res.redirect("/profile");
});

// put contact message into database
app.get(`/contact`, (req, res) => {
	res.render(`contact.njk`);
});

app.post(`/send-a-message`, (req, res) => {
		let name = req.body.name;
		let email = req.body.email;
		let message = req.body.message;

		db.collection(dbCollection3).insertOne({name, email, message}, (err) => {
			if(err) {
				return console.log(err);
			}
			else {
				console.log(`\nContact message put into database.\n`);
				res.redirect("/sent-contact");
			}
		});
});

// user wants to log out
app.get(`/logout`, (req, res) => {
	res.render("/logout.njk");
});

app.post(`/logout`, (req, res) => {
	console.log(req.session);

	req.session.destroy();
	res.clearCookie('user', { path: '/' });

	console.log('\n' + req.session);
	res.redirect("/index");
});






app.get(`/games`, (req, res) => {
    res.render(`games.html`);
});



// leave a review
app.post(`/put-review-in-db`, (req, res) => {
		let reviewMessage = req.body.review;
		let reviewScore = req.body.rating;
		let game = req.body;
		db.collection(dbCollection2).insertOne({Title: game.title, Score: reviewScore, Message: reviewMessage}, (err) => {
				if(err) {
					return console.log(err);
				}
				else {
					console.log(`Inserted one review into Mongo via an HTML form using POST.\n`);
					res.redirect('back')
				}
		});
});

// get reviews
app.get('/get-reviews-from-db',(req,res)  => {
let id = req.query.id;
				if (id== "alien"){
				db.collection(dbCollection2).find({Title: "Alien: Isolation"},{projection:{_id:0, Title: 0, }}).toArray((err, result)  => {
					if (err) {
					 return console.log(err);
			 	} else {
					 console.log(`User requested http://${HOST}:${port}/get-alien-reviews`);
					 console.log(`Responding to request with file`,
						 colors.green, `forum-alien.html`, colors.reset, `via GET.\n`);
						  res.render('forum-alien.html',{mongoDBArray: result});
			 				}
					});
				} else if (id== "ds"){
					db.collection(dbCollection2).find({Title: "Dead Space"},{projection:{_id:0, Title: 0, }}).toArray((err, result)  => {
						if (err) {
						 return console.log(err);
				 	} else {
						 console.log(`User requested http://${HOST}:${port}/get-deadspace-reviews`);
						 console.log(`Responding to request with file`,
							 colors.green, `forum-ds1.html`, colors.reset, `via GET.\n`);
							  res.render('forum-ds1.html',{mongoDBArray: result});
				 }
				});
			}	else if (id== "ds2"){
					db.collection(dbCollection2).find({Title: "Dead Space 2"},{projection:{_id:0, Title: 0, }}).toArray((err, result)  => {
						if (err) {
						 return console.log(err);
				 	} else {
						 console.log(`User requested http://${HOST}:${port}/get-deadspace2-reviews`);
						 console.log(`Responding to request with file`,
							 colors.green, `forum-ds2.html`, colors.reset, `via GET.\n`);
							  res.render('forum-ds2.html',{mongoDBArray: result});
					}
				})
			}else if (id== "doki-doki"){
				db.collection(dbCollection2).find({Title: "Doki-Doki Literature Club"},{projection:{_id:0, Title: 0, }}).toArray((err, result)  => {
					if (err) {
					 return console.log(err);
				} else {
					 console.log(`User requested http://${HOST}:${port}/get-doki-doki-reviews`);
					 console.log(`Responding to request with file`,
						 colors.green, `forum-dokidoki.html`, colors.reset, `via GET.\n`);
							res.render('forum-dokidoki.html',{mongoDBArray: result});
						}
					})
			}else if (id== "hk"){
				db.collection(dbCollection2).find({Title: "Hollow Knight"},{projection:{_id:0, Title: 0, }}).toArray((err, result)  => {
					if (err) {
					 return console.log(err);
				} else {
					 console.log(`User requested http://${HOST}:${port}/get-hk-reviews`);
					 console.log(`Responding to request with file`,
						 colors.green, `forum-hk.html`, colors.reset, `via GET.\n`);
							res.render('forum-hk.html',{mongoDBArray: result});
						}
					})
			}else if (id== "ib"){
				db.collection(dbCollection2).find({Title: "Ib"},{projection:{_id:0, Title: 0, }}).toArray((err, result)  => {
					if (err) {
					 return console.log(err);
				} else {
					 console.log(`User requested http://${HOST}:${port}/get-ib-reviews`);
					 console.log(`Responding to request with file`,
						 colors.green, `forum-ib.html`, colors.reset, `via GET.\n`);
							res.render('forum-ib.html',{mongoDBArray: result});
						}
					})
				}else if (id== "lm"){
					db.collection(dbCollection2).find({Title: "Luigi's Mansion 3"},{projection:{_id:0, Title: 0, }}).toArray((err, result)  => {
						if (err) {
						 return console.log(err);
					} else {
						 console.log(`User requested http://${HOST}:${port}/get-lm-reviews`);
						 console.log(`Responding to request with file`,
							 colors.green, `forum-lm.html`, colors.reset, `via GET.\n`);
								res.render('forum-lm.html',{mongoDBArray: result});
							}
						})
					}else if (id== "pm"){
						db.collection(dbCollection2).find({Title: "Pocket Mirror"},{projection:{_id:0, Title: 0, }}).toArray((err, result)  => {
							if (err) {
							 return console.log(err);
						} else {
							 console.log(`User requested http://${HOST}:${port}/get-pm-reviews`);
							 console.log(`Responding to request with file`,
								 colors.green, `forum-pm.html`, colors.reset, `via GET.\n`);
									res.render('forum-pm.html',{mongoDBArray: result});
								}
							})
						}else if (id== "re"){
							db.collection(dbCollection2).find({Title: "Resident Evil"},{projection:{_id:0, Title: 0, }}).toArray((err, result)  => {
								if (err) {
								 return console.log(err);
							} else {
								 console.log(`User requested http://${HOST}:${port}/get-re1-reviews`);
								 console.log(`Responding to request with file`,
									 colors.green, `forum-re1.html`, colors.reset, `via GET.\n`);
										res.render('forum-re1.html',{mongoDBArray: result});
									}
								})
							}else if (id== "re2"){
								db.collection(dbCollection2).find({Title: "Resident Evil 2"},{projection:{_id:0, Title: 0, }}).toArray((err, result)  => {
									if (err) {
									 return console.log(err);
								} else {
									 console.log(`User requested http://${HOST}:${port}/get-re2-reviews`);
									 console.log(`Responding to request with file`,
										 colors.green, `forum-re2.html`, colors.reset, `via GET.\n`);
											res.render('forum-re2.html',{mongoDBArray: result});
										}
									})
								}else if (id== "re3"){
									db.collection(dbCollection2).find({Title: "Resident Evil 3"},{projection:{_id:0, Title: 0, }}).toArray((err, result)  => {
										if (err) {
										 return console.log(err);
									} else {
										 console.log(`User requested http://${HOST}:${port}/get-re3-reviews`);
										 console.log(`Responding to request with file`,
											 colors.green, `forum-re3.html`, colors.reset, `via GET.\n`);
												res.render('forum-re3.html',{mongoDBArray: result});
											}
										})
									}else if (id== "sh2"){
										db.collection(dbCollection2).find({Title: "Silent Hill 2"},{projection:{_id:0, Title: 0, }}).toArray((err, result)  => {
											if (err) {
											 return console.log(err);
										} else {
											 console.log(`User requested http://${HOST}:${port}/get-sh2-reviews`);
											 console.log(`Responding to request with file`,
												 colors.green, `forum-sh2.html`, colors.reset, `via GET.\n`);
													res.render('forum-sh2.html',{mongoDBArray: result});
												}
											})
										}

		});
