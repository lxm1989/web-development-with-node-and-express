var express = require('express'),
    fortune = require('./lib/fortune.js'),
    formidable = require('formidable'),
    jqupload = require('jquery-file-upload-middleware');

var app = express();

var handlebars = require('express-handlebars').create({ 
	defaultLayout:'main',
	helpers:{
		section:function(name,options){
			if(!this._sections) this._sections = {};
			this._sections[name] = options.fn(this);
			return null;
		}
	}
});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);

app.use(express.static(__dirname + '/public'));
app.use(require('body-parser')());

app.use(function(req, res, next){
	res.locals.showTests = app.get('env') !== 'production' && req.query.test === '1';
	next();
});

// mocked weather data
function getWeatherData(){
    return {
        locations: [
            {
                name: 'Portland',
                forecastUrl: 'http://www.wunderground.com/US/OR/Portland.html',
                iconUrl: 'https://mir-s3-cdn-cf.behance.net/project_modules/disp/0ea76346152113.584973d6f1a9c.gif',
                weather: 'Overcast',
                temp: '54.1 F (12.3 C)',
            },
            {
                name: 'Bend',
                forecastUrl: 'http://www.wunderground.com/US/OR/Bend.html',
                iconUrl: 'https://mir-s3-cdn-cf.behance.net/project_modules/disp/0ea76346152113.584973d6f1a9c.gif',
                weather: 'Partly Cloudy',
                temp: '55.0 F (12.8 C)',
            },
            {
                name: 'Manzanita',
                forecastUrl: 'http://www.wunderground.com/US/OR/Manzanita.html',
                iconUrl: 'https://mir-s3-cdn-cf.behance.net/project_modules/disp/0ea76346152113.584973d6f1a9c.gif',
                weather: 'Light Rain',
                temp: '55.0 F (12.8 C)',
            },
        ],
    };
}

// middleware to add weather data to context
app.use(function(req, res, next){
	if(!res.locals.partials) res.locals.partials = {};
 	res.locals.partials.weatherContext = getWeatherData();
 	next();
});

app.use('/upload', function(req, res, next){
    var now = Date.now();
    jqupload.fileHandler({
        uploadDir: function(){
            return __dirname + '/public/uploads/' + now;
        },
        uploadUrl: function(){
            return '/uploads/' + now;
        },
    })(req, res, next);
});

app.get('/', function(req, res){
	res.render('home');
	//res.type('text/plain');
	//res.send('Meadowlark Travel');
});

app.get('/about', function(req, res){
	res.render('about', { 
				fortune:fortune.getFortune(), 
				pageTestScript:'/qa/tests-about.js'
	});
	//res.type('text/plain');
	//res.send('About Meadowlark Travel');
});

app.get('/tours/hood-river',function(req,res){
	res.render('tours/hood-river');
});

app.get('/tours/oregon-coast', function(req, res){
	res.render('tours/oregon-coast');
});

app.get('/tours/request-group-rate',function(req,res){
	res.render('tours/request-group-rate');
});

app.get('/jquery-test', function(req, res){
	res.render('jquery-test');
});

app.get('/nursery-rhyme', function(req, res){
	res.render('nursery-rhyme');
});

app.get('/data/nursery-rhyme', function(req, res){
	res.json({
		animal: 'squirrel',
		bodyPart: 'tail',
		adjective: 'bushy',
		noun: 'heck',
	});
});

app.get('/thank-you',function(req,res){
	res.render('thank-you');
});

app.get('/newsletter',function(req,res){
	res.render('newsletter',{csrf:'CSRF token goes here'});
});

app.post('/process',function(req,res){
	console.log('Form (from queryingstring):' + req.query.form);
	console.log('CSRF token (from hidden form field): ' + req.body._csrf);
	console.log('Name (from visible form field): ' + req.body.name);
	console.log('Email (from visible form field): ' + req.body.email);
	res.redirect(303, '/thank-you');
	//res.render('thank-you');
});

app.get('/newsletter_ajax',function(req,res){
	res.render('newsletter_ajax',{csrf:'CSRF token goes here'});
});

app.post('/process_ajax',function(req,res){
	console.log(req.get('Accept'));  
	console.log(req.accepts('json','html'));

	if(req.xhr || req.accepts('json,html')==='json'){
		res.send({success : true});
	} else{
		res.redirect(303, '/thank-you');
	}
});

app.get('/contest/vacation-photo',function(req,res){
	var now = new Date();
	res.render('contest/vacation-photo',{
		year:now.getFullYear(),month:now.getMonth()
	});
});

app.get('/contest/jq_vacation-photo',function(req,res){
	var now = new Date();
	res.render('contest/jq_vacation-photo',{
		year:now.getFullYear(),month:now.getMonth()
	});
});

app.post('/contest/vacation-photo/:year/:month',function(req,res){
	var form = new formidable.IncomingForm();
	form.parse(req,function(err, fields, files){
		if(err) return res.redirect(303, '/error');
        	console.log('received fields:');
        	console.log(fields);
        	console.log('received files:');
        	console.log(files);
        	res.redirect(303, '/thank-you');
	});
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
