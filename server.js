//Importing the Express framework
const express = require("express");
// Importing animal
const mongoose = require("mongoose");
// Requiring Sessions for express flash
const session = require('express-session');
// Requiring Express-flash for validations
const flash = require('express-flash');
//Assigning Express to an object so we can use the functions
const app = express();

// Connecting mongoose to the MongoDB
mongoose.connect('mongodb://localhost/mongooseMessageboard2', {useNewUrlParser: true, useUnifiedTopology: true });

// **Models and Schemas** 

// Message Schema
const MessageSchema = new mongoose.Schema({
    name: {type: String, required:true, min:4},
    message: {type: String, required:true},
    comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}]
})
// Comments Schema
const CommentSchema = new mongoose.Schema({
    _message: {type: mongoose.Schema.Types.ObjectId, ref:'Message'},
    name: {type: String, required:true},
    comment: {type: String, required:true}
})

const Message = mongoose.model('Message', MessageSchema);
const Comment = mongoose.model('Comment', CommentSchema);

//Setting the Express app to use the static folder
app.use(express.static(__dirname + "/static"));
//Setting the Express app to accept POST requests
app.use(express.urlencoded({extended: true}));
// Setting the app to use session
app.use(session({
  saveUnitialized: true,
  resave: 'true',
  secret: 'thisismysecret',
  cookie: {maxAge: 60000}
}));
// Setting the app to use flash
app.use(flash());

//Setting the Express app to use the EJS view enging and setting the directory for the views
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// **Routes** 

app.get('/', (req, res) => {
    Message.find({})
        .populate('comments')
        .exec((err,messages) => {
            
        })
});


//This sets the Express app to listen to port 8000 on our localhost
app.listen(8080, () => console.log("listening on 8080"));
