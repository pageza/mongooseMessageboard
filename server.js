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
mongoose.connect('mongodb://localhost/mongooseMessageboard', {useNewUrlParser: true, useUnifiedTopology: true });

// Creating Schema and model 
let Schema = mongoose.Schema;

const CommentSchema = new mongoose.Schema({
  _message: {type: Schema.Types.ObjectId, ref: 'Message'},
  commenter: {type: String, required: [true, "Comments must have a name"]},
  comment: {type: String, required:[true, "Must make comment"], minlength: [10, "Comments must be at least 10 characters long."]}
},{timestamps: true})

const MessageSchema = new mongoose.Schema({
  name: {type: String, required: [true, "Messages must have a name"]},
  message: {type: String, required: [true, "Must have a message"], minlength: [20, "Messages must be at least 20 characters long"]},
  comments: [{type: Schema.Types.ObjectId, ref:'Comment'}]
},{timestamps:true})
mongoose.model('Message', MessageSchema)
mongoose.model('Comment', CommentSchema)

// create an object that contains methods for mongoose to interface with MongoDB
const Comment = mongoose.model('Comment', CommentSchema);
const Message = mongoose.model('Message', MessageSchema);

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

//These are the routes
app.get('/', (req, res) => {
  Message.find({})
    .populate("comments")
    .exec((err,messages) => {
      if(err){res.json(err)}
      else{res.render('index', {messages:messages})}
    })
});

app.post('/addMessage', (req, res) => {
  const message = new Message();
  message.name = req.body.userName;
  message.message = req.body.message;
  message.save()
    .then(data => res.redirect('/'))
    .catch(err => res.json(err))
});

app.post('/message/:id/comment', (req, res) => {
  var message_id = req.params.id;
	Message.findOne({_id: message_id}, function(err, message){
		var newComment = new Comment({commenter: req.body.commenterName, comment: req.body.comment});
		newComment._message = message_id;
		newComment.save(function(err){
			if(err){
				console.log(err);
				res.render('index', {errors: newComment.errors});
			}
			else{
				Message.update({_id: message._id}, {$push: {"comments": newComment}}, function(err){
					if(err){
						console.log(err)
					} 
					else {
						res.redirect('/')
					}
				});
				console.log(req.body);
			}
		})
	}) 
});

// app.post('/message/:id/comment', (req, res) => {
//   const comment = new Comment(req.body);
//   comment.save();
//   Message.findOneAndUpdate({_id:req.params.id},{$push:{comments:comment}},function(err,data) {
//     res.redirect('/')
//   })
// });

//This sets the Express app to listen to port 8000 on our localhost
app.listen(8080, () => console.log("listening on 8080"));

