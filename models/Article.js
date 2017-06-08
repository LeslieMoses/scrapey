// Require mongoose
var mongoose = require("mongoose");
// Create Schema class
var Schema = mongoose.Schema;

// Create article schema
var ArticleSchema = new Schema({
    // title is a required stringo
    title: {
        type: String,
        required: true
    },
    // link is a required string
    link: {
        type: String,
        required: true
    },
    // This only saves one note's ObjectId, ref refers to the Note model
    note: {
        // id that mongo assigns to 
        type: Schema.Types.ObjectId,
        // pull note for this article
        ref: "Note"
    }
});

// Create the Article model with the ArticleSchema
var Article = mongoose.model("Article", ArticleSchema);

// Export the model
module.exports = Article;