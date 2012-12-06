var app = require('express').createServer();
app.get('/', function(req, res) {
    res.send('Hello from Cloud Foundry after update');
});
app.listen(3000);