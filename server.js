const express = require(`express`);
const app = express();
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

// Express’ way of setting a variable. In this case, “view engine” to “njk”.
app.set(`view engine`, `njk`);

// Express middleware to parse incoming, form-based request data before processing
// form data.
app.use(bodyParser.urlencoded({extended: true}));

// Express middleware to parse incoming request bodies before handlers.
app.use(bodyParser.json());

// Express middleware to server HTML, CSS, and JS files.
app.use(express.static(`public`));

/**
 * This route is invoked when a user visits
 * http://localhost:3000/create-a-db-record/.
 */
app.get(`/create-a-db-record`, (req, res) => {
    res.render(`register.html`);
});

/**
 * This route is invoked when a POST request from the form in
 * create-a-record-in-database.njk is submitted.
 */
app.post(`/create-a-db-record`, (req, res) => {
    db.collection(dbCollection).insertOne(req.body, (err) => {
        console.log(req.body);

        if (err) {
            return console.log(err);
        } else {
            console.log(
                `Inserted one record into Mongo via an HTML form using POST.\n`);

            res.redirect(`login.html`);
        }
    });
});
