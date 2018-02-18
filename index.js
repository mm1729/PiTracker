var express = require('express')
var path = require('path')
var router = require('./router/router.js')
var app = express()

app.set('port', (process.env.PORT || 3000))

app.set('view engine', 'ejs')

app.use(express.static(path.join(__dirname, 'public')))
console.log(path.join(__dirname, 'public'))
app.use('/', router)

app.listen(app.get('port'), function() {
    console.log('PiTracker running on port ' + app.get('port'))
})

module.exports = app;