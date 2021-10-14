var express = require('express');
var fortune = require('./lib/fortune.js')
var app = express();

var handlebars = require('express-handlebars').create({ defaultLayout:'main'});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);

app.use(express.static(__dirname + '/public'));


app.get('/', function(req, res){
	res.render('home');
	//res.type('text/plain');
	//res.send('Meadowlark Travel');
});

app.get('/about', function(req, res){
	res.render('about', { fortune:fortune.getFortune() });
	//res.type('text/plain');
	//res.send('About Meadowlark Travel');
});

app.use(function(req, res, next){
	res.status(404);
	res.send('404');
});

app.use(function(err, req, res, next){
	console.error(err.stack);
	res.status(500);
	res.send('500');
});

/*
app.use(function(req, res){
	res.type('text/plain');
	res.status(404);
	res.send('404 - not found');
});

app.use(function(err, req, res, next){
	console.error(err.stack);
	res.type('text/plain');
	res.status(500);
	res.send('500 - server error');
});
*/

app.listen(app.get('port'), function(){
	console.log( 'Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.' );
});
