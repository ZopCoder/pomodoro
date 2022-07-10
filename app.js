const path =  require('path');
const express = require('express');
const ejs = require('ejs');
const expressLayouts = require('express-ejs-layouts');
const port = process.env.PORT || 3030;

const app = express();

const publicDirectoryPath = path.join(__dirname, './src/public')
app.use(express.static(publicDirectoryPath))
// #region FOR LAYOUT feature--
// To use layout feature  Following 2 lines are required
// You can omit the 2 lines and just use simple pages 
app.use(expressLayouts);
// # if you use expressLayouts, then you need to set your 
// # layout folder inside the views folder
app.set('layout', './layouts/layout');
// #endregion

//app.engine('ejs', ejs.renderFile);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './src/views'));

// Setup static directory to serve


app.get('/', (req, res, next)=>{
    res.render('index');
})

const server = app.listen(port, (err, req, res)=> {
    if(err){
        console.log('Express server could not be started');
    }
    console.log(`Express server started at port ${port}`);
})