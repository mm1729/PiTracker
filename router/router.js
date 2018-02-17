var express = require('express')
var router = express.Router()
var pg = require('pg')
var ping = require('ping')


var devDB_URL = 'postgres://databaseuser:pitracker@localhost/pi_tracker'

router.get('/', function(req, res) {
    pg.connect((process.env.DATABASE_URL || devDB_URL) , function(err, client, done) {
        client.query('SELECT * FROM pi_clients', function(err, result) {
            done()
            if(err) {
                console.log(err)
                res.send("Error: " + err)
            } else {
                //console.log(result.rows)
                res.render('../public/html/index', {results: result.rows})
            }
        })
    })
  //res.render('../public/html/index')
})

router.get('/update', function(req, res) {
    console.log(req.query)
    let update_data = req.query 
    let select_query = "SELECT * FROM pi_clients WHERE name='" + update_data.name + "'"
    
    
    pg.connect((process.env.DATABASE_URL || devDB_URL) , function(err, client, done) {
        client.query(select_query, function(err, result) {
            done()
            if(err) {
                logError('notFound', err)
                res.send("Error: " + err)
            } else {
                console.log(result.rows)
                data = result.rows[0]
                if(data) {
                    updateRow(update_data, function(err) {
                        if(err) {
                            logError('updateRow', err)
                            res.send("Error: " + err)
                        } else {
                            res.sendStatus(200)
                        }
                    })
                } else {
                    createRow(update_data, function(err) {
                        if(err) {
                            logError('createRow', err)
                            res.send("Error: " + err)
                        } else {
                            res.sendStatus(200)
                        }
                    })
                }
                //res.sendStatus(200)
                //res.render('../public/html/index', {results: result.rows})
            }
        })
    })
    //res.sendStatus(200)
})

router.get('/checkClientConnectivity', function(req, res) {
    pg.connect((process.env.DATABASE_URL || devDB_URL) , function(err, client, done) {
        client.query('SELECT * FROM pi_clients', function(err, result) {
            done()
            if(err) {
                console.log(err)
                res.send("Error: " + err)
            } else {
                //console.log(result.rows)
                //res.render('../public/html/index', {results: result.rows})
                updateClientStatus(result.rows, function(numUpdated) {
                    console.log(numUpdated)
                    res.sendStatus(200)
                })
            }
        })
    })
})

var updateClientStatus = function(data, callback) {
    let toBeUpdated = []
    let itemsProcessed = 0
    data.forEach(function(client) {
       ping.sys.probe(client.ip, function(isAlive) {
            if(isAlive && client.status === 'off') {
                toBeUpdated.push({
                    'name' : client.name,
                    'ip' : client.ip,
                    'port' : client.port,
                    'status' : 'on'
                })
            } else if (!isAlive && client.status === 'on') {
                toBeUpdated.push({
                    'name' : client.name,
                    'ip' : client.ip,
                    'port' : client.port,
                    'status' : 'off'
                })
            }
            
            if( ++itemsProcessed === data.length ) {
                if (toBeUpdated.length == 0) {
                    callback(0)
                }
                updateDatabase(toBeUpdated, function() {
                    callback(toBeUpdated.length)
                })
            }

       })
    })
}

var updateDatabase = function(data, callback) {
    let doneChecking = 0
    data.forEach(function(row) {
        updateRow(row, function(err) {
            if (err) {
                logError('updateDatabase', err)
            }
            if (++doneChecking === data.length) {
                callback()
            }
        })
    })
}

var updateRow = function(data, callback) {
    let query = "update pi_clients set ip='" + data.ip + "', port='" + data.port 
    + "', status='" + data.status + "' where name='" + data.name + "'"

    pg.connect((process.env.DATABASE_URL || devDB_URL) , function(err, client, done) {
        client.query(query, function(err, result) {
            done()
            callback(err)
        })
    })
}

var createRow = function(data, callback) {
    let query = "insert into pi_clients values (default, '" + data.name + "', '" + data.ip 
    + "', '" + data.port + "', '" + data.status + "');"

    pg.connect((process.env.DATABASE_URL || devDB_URL) , function(err, client, done) {
        client.query(query, function(err, result) {
            done()
            callback(err)
        })
    })
}

var logError = function(context, err) {
    console.log(context + ': ' + JSON.stringify(err, null, 4))

}
module.exports = router