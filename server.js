var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var path = require("path");

var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = process.env.PORT || 3000;

var app = express();

app.use(logger("dev"));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static("public"));

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/webNewsScraper";

mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, {
  useMongoClient: true
});

// Routes

app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname, "public/index.html"));
  });


app.get("/saved", function(req, res) {
    res.sendFile(path.join(__dirname, "public/savedArticles.html"));
});

// A GET route for scraping the website
app.get("/scrape", function(req, res) {
  // This method grabs the body of the html with request
  axios.get("http://www.latimes.com/business/technology/").then(function(response) {
    // Then, loads it into cheerio and saves it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // The syntax below grabs every h2 tag within an article, and does the following

        let counter = 0;
        // var dataArr = [];
    $("article").each(function(i, element) {
      // Save an empty result object
      var result = {};
      
      var storyDiv = $(this).children("div.story-body")
      result.url = storyDiv.children("a").attr("href")
      var metaDiv = storyDiv.children("a").children("div.story-meta")
      result.headline = metaDiv.children("h2").text()
      result.summary = metaDiv.children("p.summary").text();

      // Create a new Article using the `result` object built from scraping
     if (result.headline && result.url){

      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
          counter++;
          // dataArr.push(dbArticle)
          console.log("added " + counter + " new items")
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          return res.json(err);
        });
        // console.log(result)
        // console.log("added " + incr + " new items")
      }
          

    });


    // If we were able to successfully scrape and save an Article, send a message to the client
    res.sendFile(path.join(__dirname, "public/index.html"));

  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});


// Route for grabbing a specific Article by id, and update it's isSaved property
app.put("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that updates the matching one in our db...
  db.Article.update({ _id: req.params.id}, {$set: {isSaved: true}})

    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});




// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});




// route for deleting an article
  app.delete("/articles/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that updates the matching one in our db...
    db.Article.remove({ _id: req.params.id})

    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});


// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});