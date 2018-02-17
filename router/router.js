var express = require('express')
var router = express.Router()
var pg = require('pg');

router.get('/', function(req, res) {
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        client.query('SELECT * FROM pi_clients', function(err, result) {
            done()
            if(err) {
                console.log(err)
                res.send("Error: " + err)
            } else {
                console.log(result.rows)
                res.render('../public/html/index', {results: result.rows})
            }
        })
    })
  //res.render('../public/html/index')
})

module.exports = router