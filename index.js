var express = require("express");
var app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");
app.listen(3000);
const pg = require('pg');

var config = {
  user: 'postgres', //env var: PGUSER
  database: 'quanlyvideo', //env var: PGDATABASE
  password: '680214', //env var: PGPASSWORD
  host: 'localhost', // Server hosting the postgres database
  port: 5432, //env var: PGPORT
  max: 10, // max number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
};
//import thu vien body parser
var bodyParser = require('body-parser');

var urlencodedParser = bodyParser.urlencoded({ extended: false });
//import thu vien upload file
var multer  = require('multer');

//cau hình storage
var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './public/upload') //luu file o upload
	},
	filename: function (req, file, cb) {
		cb(null, file.originalname)
	}
})

//lay duong dan tu uploadfile (name ejs)
var upload = multer({ storage: storage }).single('uploadfile');

const pool = new pg.Pool(config);


//trang home
app.get("/", function(req, res){
	pool.connect(function(err, client, done) {
		if(err) {
			return console.error('error fetching client from pool', err);
		}

  		//use the client for executing the query
  		client.query('select * from video', function(err, result) {
	    //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
	    done();

	    if(err) {
	    	res.end();
	    	return console.error('error running query', err);
	    }
	    res.render("home",{data:result});
	    //output: 1
	});
  	});
});

//trang them video
app.get("/admin/list", function(req, res){
	pool.connect(function(err, client, done) {
		if(err) {
			return console.error('error fetching client from pool', err);
		}

  		//use the client for executing the query
  		client.query('select * from video', function(err, result) {
	    //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
	    done();

	    if(err) {
	    	res.end();
	    	return console.error('error running query', err);
	    }
	    res.render("list",{data:result});
	    //output: 1
	});
  	});
});
//chuc nang xoa
app.get("/admin/delete/:id",function(req,res){
	var id = req.params.id;
	pool.connect(function(err, client, done) {
		if(err) {
			return console.error('error fetching client from pool', err);
		}

  		//use the client for executing the query
  		client.query('delete from video where id='+ id, function(err, result) {
	    //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
	    done();

	    if(err) {
	    	res.end();
	    	return console.error('error running query', err);
	    }
	    res.redirect("../list");
	    //output: 1
	});
  	});
});
//chuc nang them video vao csdl
app.get("/admin/add", function(req,res){
	res.render("add");
});

app.post("/admin/add", urlencodedParser,function(req,res){
	upload(req,res,function(err){
		if (err) {
			res.send("Xay ra loi trong qua trinh them video");
		}else{
			if(typeof(req.file)=="underfined"){
				res.send("loi");
			}else{
				pool.connect(function(err, client, done) {
					if(err) {
						return console.error('error fetching client from pool', err);
					}
					var sql = "insert into video (title, description, key, image) values ('"+req.body.title+"','"+req.body.description+"','"+req.body.key+"','"+req.file.originalname+"')";
					client.query(sql, function(err, result) {
				    //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
				    done();

				    if(err) {
				    	res.end();
				    	return console.error('error running query', err);
				    }
				    res.redirect("./list");
				    //output: 1
				});
				});
			}
		}
	});
});

//chuc nang edit
app.get("/admin/edit/:id",function(req,res){
	var id = req.params.id;
	pool.connect(function(err, client,done){
		if(err){
			return console.error('error fetching client from pool', err);
		}

		client.query('select * from video where id='+ id, function(err,result){
			done();
			if (err) {
				res.end();
				return console.error('error running query', err);
			}
			res.render("edit",{data:result.rows[0]});
		});
	});
});

//update 
app.post("/admin/edit/:id",urlencodedParser,function(req,res){
	var id = req.params.id;
	upload(req,res,function(err){
		if (err) {
			res.send("Xảy ra lỗi trong quá trình upload");
		}else{
			if(typeof(req.file) == 'undefined'){

				pool.connect(function(err, client,done){
					if(err){
						return console.error('error fetching client from pool', err);
					}
					var sql = "UPDATE video set title='"+req.body.title+"', description='"+ req.body.description+"',key='"+req.body.key+"' WHERE id="+ id;
					client.query(sql,function(err,result){
						done();
						if (err) {
							return console.error('error running query', err);
						}
						res.redirect("../list");
					});
				});

			}else{
				pool.connect(function(err, client,done){
					if(err){
						return console.error('error fetching client from pool', err);
					}
					var sql ="UPDATE video set title='"+req.body.title+"', description='"+ req.body.description+"', key='"+req.body.key+"', image='"+req.file.originalname+"' WHERE id="+ id;
					client.query(sql,function(err,result){
						done();
						if (err) {
							return console.error('error running query', err);
						}
						res.redirect("../list");
					});
				});
			}
		}

	});
});

				