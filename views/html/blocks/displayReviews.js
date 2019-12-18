

function displayReviews () {
			let game = "Alien: Isolation";
			let x = 0;
			let html ="";
			let totalReviews = db.collection(dbCollection2).count({Title: {game}});
			if (x != totalReviews){
				let review = db.collection(dbcollection2.findOne({Message: [x]}));
				x += 1;
				html ='<div class="review_block"><h3>Review ' + x +'</h3><p>' + review +'</p></div>'
			};
				res.send(html);
};
