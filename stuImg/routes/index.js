var express = require('express');
var router = express.Router();
var cloudinary = require('cloudinary');
const multer = require('multer');
const fs = require('fs');
const UPLOAD_PATH = 'public/file';
let upload = multer({
  dest: UPLOAD_PATH
});
let mysql = require('mysql');
let con = mysql.createConnection({
  host: 'mydatas.c1wnd7klhnvf.us-east-2.rds.amazonaws.com',
  port: '3306',
  password: '19931202Ssn.',
  user: 'roots',
  database: 'stu'
});
cloudinary.config({
  cloud_name: 'ssong1202',
  api_key: '682332994234586',
  api_secret: 'zBgiepNCH4Lz7p9UDyIWdO--wLI'
});

router.get('/', function (req, res, next) {
    let d = new Array();
    con.query('select * from student', (err, resu) => {
      if (err) {
        console.log(err);
      } else {
        resu = JSON.parse(JSON.stringify(resu));
        cloudinary.v2.api.resources(
          function (error, resul) {
            // console.log(resul.resources)
            con.query('select * from img', (err, result) => {
              if (err) {
                console.log(err);
              } else {
                let img = JSON.parse(JSON.stringify(result));
                for (let i = 0; i < img.length; i++) {
                  for (let j = 0; j < resul.resources.length; j++) {
                    if (resul.resources[j].public_id == img[i].picid) {
                      let x = {};

                      x.stuid = img[i].stuid;
                      x.url = resul.resources[i].url;
                      x.public_id = img[i].public_id;
                      d.push(x);
                    }
                  }
                }
                res.render('index', {
                  stu: resu,
                  imgstu: d
                })
              }
            })
          });


      }
    })
  })
  .post('/addstudent', (req, res, next) => {
    con.query('insert into student values(?,?)', [req.body.stuid, req.body.stuname], (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(result);
        res.redirect('/');
      }
    })
  })
  .post('/up', upload.single('ifile'), (req, res, next) => {
    const {
      file
    } = req;
    fs.readFile(file.path, (err, data) => {

      cloudinary.uploader.upload(file.path, function (result) {
        console.log(result)
        con.query('insert into img values(?,?)', [req.body.stuid, result.public_id], (err, re) => {
          if (err) {
            console.log(err);
          } else {
            console.log(re);
            res.redirect('/');
          }
        })
      });
    })
  })
  .post('/deletestu', (req, res, next) => {
    con.query('delete from student where stuid=?', [req.body.stuid], (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(result);
        res.redirect('/');
      }
    })
  })
  // .post('/upurl', (req, res, next) => {
  //   console.log(req.body);
  //   cloudinary.uploader.upload(req.body.urls, function (result) {
  //     console.log(result)
  //   });
  //   res.redirect('/');
  // })
  .post('/deletepic', (req, res, next) => {
    cloudinary.v2.api.delete_resources([req.body.picid],
      function (error, result) {
        console.log(result);
        con.query('delete from img where stuid=?', [req.body.stuid], (err, result) => {
          if (err) {
            console.log(err);
          } else {
            res.redirect('/');  
          }
        })
      });
  })
module.exports = router;