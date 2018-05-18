var express = require('express')
var path = require('path')
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var _ = require('underscore')

var port = process.env.PORT || 3000
var app = express()
var Movie = require('./models/movie')

// create application/json parser
var jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

mongoose.connect('mongodb://localhost/movieApp')
app.set('views', './views/pages')
app.set('view engine', 'jade')
app.use(urlencodedParser)
app.use(express.static(path.join(__dirname, 'public')))
app.listen(port)
app.locals.moment = require('moment')

console.log('Hello, serve started on port ' + port)

app.get('/', function(req, res) {
	Movie.fetch(function (err, movies) {
		if (err) {console.log(err)}

		res.render('index', {
			title: '电影',
			movies: movies
		})
	})
})

app.get('/movie/:id', function(req, res) {
	var id = req.params.id
	console.log(id)

	Movie.findById(id, function (err, movie) {
		if (err) {console.log(err)}

		res.render('detail', {
			title: '详情页',
			movie: movie
		})
	})
})

app.get('/admin/movie', function(req, res) {
	res.render('admin', {
		title: '后台录入',
		movie: {
			title: "",
			doctor: "",
			country: "",
			language: "",
			year: "",
			summary: "",
			poster: '',
			flash: ''
		}
	})
})


app.get('/admin/update/:id', function (req, res) {
	var id = req.params.id
	console.log('/admin/update/'+id)

	if (id) {
		Movie.findById(id, function (err, movie) {
			if (err) {console.log(err)}
			console.log(movie)
			res.render('admin', {
				title: '更新movie',
				movie: movie
			})
		})
	}
})


app.post('/admin/movie/new', urlencodedParser, function (req, res) {
	var id = req.body._id
	var movieObj = req.body
	console.log(movieObj)
	var _movie

	if (id !== 'undefined') {
		Movie.findById(id, function (err, movie) {
			if (err) {console.log(err)}

			_movie = _.extend(movie, movieObj)
			_movie.save(function (err, movie) {
				if (err) {console.log(err)}

				res.redirect('/movie/' + movie._id)
			})
		})
	} else {
		_movie = new Movie({
			title: movieObj.title,
			doctor: movieObj.doctor,
			country: movieObj.country,
			language: movieObj.language,
			year: movieObj.year,
			summary: movieObj.summary,
			poster: movieObj.poster,
			flash: movieObj.flash,
		});

		_movie.save(function (err, movie) {
			if (err) {console.log(err)}

			res.redirect('/movie/' + movie._id)
		})
	}
})

app.get('/admin/list', function(req, res) {
	Movie.fetch(function (err, movies) {
		if (err) {console.log(err)}

		res.render('list', {
			title: '电影列表',
			movies: movies
		})
	})

})

//list delete movie
app.delete('/admin/list', function(req, res) {
	var id = req.query.id
	if (id) {
		Movie.remove({_id: id}, function (err, movie) {
			if (err) {console.log(err)}
				else {
					res.json({success: 1})
				}
		})
	}
})