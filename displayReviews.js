const mongoClient = mongoDB.MongoClient;
const HOST = `localhost`;
const dbPort = `27017`;
const dbURL = `mongodb://${HOST}`;
const dbName = `spooky`;
const dbCollection = `users`;
const dbCollection2= 'reviews';
const PORT = 8080;
const port = (process.env.PORT || PORT);

function displayReviews () {
			let game = "Alien: Isolation";
	app.get(`/get-review-from-db`, (req, res) => {
			let x = 0;
			let html ="";
			let totalReviews = db.collection(dbCollection2).count({Title: {game}});
			if (x != totalReviews){
				x += 1;
				html ='<div class="review_block"><h3>Review ' + x +'</h3><p>' + db.Collection(collection2).Message[x] +'</p></div>'
			};
				res.send(html);
	});
};
