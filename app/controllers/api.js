var Transaction = require('../models/transaction');
var Dock = require('../models/dock');
var Bike = require('../models/bike');
var Admin = require('../models/admin');
var API = new Object();

API.checkOut = function (req, res) {
	// TODO
    //Get string data from card and send to other API - get studentID back
    var cardString = req.body.cardString;
    var dockID = req.body.dockID;

    //Look up if student currently has another bike out
    Dock.findOne({ dockID: dockID}, function(err, dock) {
        console.log(dock.bikeID);
		if (err) res.send(err);
		var bikeID = dock.bikeID;

        Transaction.findOne().sort('-transactionID').select('transactionID').exec(function (err, object) {
            //callback function to create transaction
            var transaction = new Transaction();
            transaction.bikeID = bikeID;
            transaction.dockID = dockID;
            transaction.studentID = cardString;
            transaction.action = 'out';
            transaction.transactionID = object == null ? 1 : ++object.transactionID;
            transaction.success = true;
            transaction.save(function(err) {
                //callback function to handle response
                if (err) res.send(err);
                    console.log(bikeID);
                    console.log(dockID);
                    Dock.update({dockID: dockID}, {bikeID: null}, function(err) {
                        if (err) res.send(err);
                    });

                    Bike.update({bikeID: bikeID}, {state: 'out', dockID: null, cardString: cardString}, function(err) {
                        if (err) res.send(err);
                    });
                res.sendStatus(200);
		    });
        });
    });
};

API.checkIn = function (req, res) {
	// TODO

    var cardString = req.body.cardString;
    var dockID = req.body.dockID;

        Bike.findOneAndUpdate({cardString: cardString}, { dockID: dockID, state: 'in'}, function(err, bike) {
		if (err) res.send(err);
        console.log(bike);
		var bikeID = bike.bikeID;

        Transaction.findOne().sort('-transactionID').select('transactionID').exec(function (err, object) {
            //callback function to create transaction
            var transaction = new Transaction();
            transaction.bikeID = bikeID;
            transaction.dockID = dockID;
            transaction.studentID = cardString;
            transaction.action = 'in';
            transaction.transactionID = object == null ? 1 : ++object.transactionID;
            transaction.success = true;
            transaction.save(function(err) {
                //callback function to handle response
                if (err) res.send(err);

                    Dock.update({dockID: dockID}, {state: 'in', bikeID: bikeID}, function(err) {
                        if (err) res.send(err);
                    });

			        res.sendStatus(200);
		    });
        });
    });

};

API.register = function (req, res) {
	// TODO
};

API.createDock = function (req, res) {
	//find largest dockID
	Dock.findOne().sort('-dockID').select('dockID').exec(function (err, object) {
		//callback function to create dock
		var dock = new Dock();
		dock.location = null;
		dock.bikeID = 1;
		dock.dockID = object == null ? 1 : ++object.dockID;
		dock.status = true;
		dock.save(function(err) {
			//callback function to handle response
			if (err) res.send(err);
	
			res.sendStatus(200);
		});
	});
};

API.findDockStatus = function (req, res) {
	var dockID = req.body.dockID;
	//Need to talk to PI people on the best way to tackle this.
};

API.setDockLocation = function (req, res) {
	// TODO
	var dockID = req.body.dockID;
	var location = req.body.location;
	Dock.update({dockID: dockID}, {location: location}, function (err) {
		//callback function to handle response
		if (err) res.send(err);
	
		res.sendStatus(200);
	});
};

API.createBike = function (req, res){
	//find largest bikeID
	Bike.findOne().sort('-bikeID').select('bikeID').exec(function (err, object) {
		//callback function to create bike
		var bike = new Bike();
		bike.isDamaged = false; //FIX BOOLEAN
		bike.state = 'in'; 		//FIX ENUM
		bike.dockID = 1;
		bike.bikeID = object == null ? 1 : ++object.bikeID;
		bike.save(function(err) {
			//callback function to handle response
			if (err) res.send(err);
	
			res.sendStatus(200);
		});
	});
};

API.findAllBikes = function (req, res) {
	Bike.find(function (err, bikes) {
		if(err) res.send(err);
	
		res.send(bikes);
	});
};

API.setBikeDamage = function (req, res){
	var isDamaged = req.body.isDamaged;
	var bikeID = req.body.bikeID;
	Bike.update({bikeID: bikeID}, {isDamaged: isDamaged}, function (err) {
		//callback function to handle response
		if (err) res.send(err);
	
		res.sendStatus(200);
	});
};

API.createAdmin = function (req, res){
	var admin = new Admin();
	admin.cardString = req.body.cardString;
	admin.save(function(err) {
		if (err) res.send(err);
	
		res.sendStatus(200);
	});
};

API.removeAdmin = function (req, res){
	var cardString = req.body.cardString;
	Admin.findOneAndRemove({'cardString': cardString}, function (err) {
		if (err) res.send(err);
		
		res.sendStatus(200);
	});
};

API.findAllAdmins = function (req, res){
	Admin.find(function(err, admins) {
		if (err) res.send(err);
			
		res.json(admins);
	})
};

API.findBikeById = function (req, res){
	var bikeID = req.params.bikeID;
	Bike.where({ bikeID: bikeID}).findOne(function(err, bike) {
		if (err) res.send(err);
			
		res.json(bike);
	});
};

API.findDockById = function (req, res){
	var dockID = req.params.dockID;
	Dock.where({dockID: dockID}).findOne(function(err, dock) {
		if (err) res.send(err);
			
		res.json(dock);
	});
};

API.findAllTransactions = function(req, res){
    Transaction.find(function(err, transactions) {
		if (err)
			res.send(err);

		res.json(transactions);
	});
};

API.findTransactionsByParamId = function(req, res){

};

//Method used for debugging purposes
API.blowitup = function (req, res){
	Bike.collection.remove(function () { console.log("Bike collection went Boom")});
	Dock.collection.remove(function () { console.log("Dock collection is now exploded")});
	Transaction.collection.remove(function () { console.log("Transaction collection? More like TNT collection")});
	Admin.collection.remove(function () { console.log("Admin collection went kaboom")});
	res.sendStatus(200);
};

module.exports = API;