/* Scrape and Display (18.3.8)
 * (If you can do this, you should be set for your hw)
 * ================================================== */

// STUDENTS:
// Complete the routes with TODOs inside.
// Your specific instructions lie there

// Good luck!

// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
// Requiring our Note and Article models
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");
// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");
// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;


// Initialize Express
var app = express();

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static dir
app.use(express.static("public"));

// Database configuration with mongoose
// TRIAL another db name? (instead of week18day3mongoose)
mongoose.connect("mongodb://localhost/Scrapey");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});


// Routes
// ======

// TRIAL add
// Main route (simple Hello World Message)
app.get("/", function(req, res) {
  res.send("Hello, world");
});

// TRIAL add:

// Retrieve data from the db
app.get("/all", function(req, res) {
  // Find all results from the scrapedData collection in the db
Article.find({}, function(error, found) {
    // Throw any errors to the console
    if (error) {
      console.log(error);
    }
    // If there are no errors, send the data to the browser as a json
    else {
      res.json(found);
    }
  });
});


// A GET request to scrape the echojs website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  request("http://www.echojs.com/", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    // pass in the string of this website, which is, in this case, all the html
    // so all the html in the website is passed to Cheerio, 
    // Cheerio loads it 
    var $ = cheerio.load(html);
      // it's passed to the dollar sign
    // Then, sort of a jQuery select, (but its a cheerio select)
  // Now, we grab every h2 within an article tag, and do the following:
//   select every part of the pg w/ an article tag
//   and the child, h2  (lloing for h2 that is a child of the article)
// once we get that, .each to loop thru all of them
    $("article h2").each(function(i, element) {

      // Save an empty result object
      var result = {};

      // Add the text and href of every link ("a"), 
    //   save them as properties of the result object
    //  study these:
      result.title = $(this).children("a").text();
      result.link = $(this).children("a").attr("href");

      // Using our Article model, create a new entry
      // This effectively passes the result object to the entry (+ the title and link)
      var entry = new Article(result);

      // Now, save that entry to the db
      entry.save(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        // Or log the doc
        // data from server to front end
        // i cut ln 119 
        else {
          console.log(doc)};
        
      });

    });
  });
  // Tell the browser that we finished scraping the text
  res.send("Scrape Complete");
});

// This will get the articles we scraped from the mongoDB
// easiest route, just return JSON of articles
app.get("/articles", function(req, res) {

  // TODO: Finish the route so it grabs all of the articles
// queing up to for things to find
// trying db first


Article.find({}, function(err, doc){
console.log("doc", doc);
res.json(doc);

})

});

// This will grab an article by it's ObjectId
// just get the article with the note
app.get("/articles/:id", function(req, res) {

    // when we interact w/ the model, we interact w/ the indiv one
    // so we say 
  Article.findOne({"_id": req.params.id})
    // findOne bc we just want to get one
    // get the article by the article id
    // which we get by the 
    // article will store id to the note, not the note itself

// so if we see a ref to note with obj, id will pull data and return it
.populate("note")
.exec(function(error, doc){
    if (error){
       console.log(error);
    }
else{
    res.json(doc);
}
})

  // TODO
  // ====

  // Finish the route so it finds one article using the req.params.id,

  // and run the populate method with "note",

  // then responds with the article with the note included


});

// Create a new note or replace an existing note
// posting a new note to an article
app.post("/articles/:id", function(req, res) {

// TODO
// save new note posted to Notes collection
// then find an article from the req.params.id
// & update it's "note" property with the _id of the new note
// req.body is the form input,so we expect something n this we'll send& map 2 a note
// req.body sld @ least < 2 properties: title and body

//creating new note from txt coming in from our front end (may be an AJAX call, or form submit, somehting that does a post)
var newNote = new Note(req.body);

newNote.save(function(err, data)  {
    if (err) {
        console.log(err);
    }
    // or log the doc
    else {
        console.log(data);
        // update article w/ cooresponding note via article id entered in URL 
        // update w/ the set (setting the note value to the data.id)
        // article, set the note to the data id
        // if multiple notes, may not use "set"
        // ...but "push" if we think of there being an array of notes
        Article.update({"_id": req.params.id}, {$set: { note: data.id} }, {new: true})
            .exec(function(err, data){
                if (err) {
                    console.log(err);
                    res.send(err);
                }
                else {
                    res.send(data)
                }
            });    
    }
})
});

// Listen on port 8080
app.listen(8080, function() {
  console.log("App running on port 8080!");
});
