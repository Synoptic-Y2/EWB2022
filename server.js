// server.js
//
// Referenced from https://github.com/WebDevSimplified/Nodejs-Passport-Login/blob/master/server.js


// Initialization
const express = require('express')
const expressLayouts = require('express-ejs-layouts');
const app = express()
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const fs = require('fs')
const bcrypt = require('bcrypt')
const url = require('url');

// We are using passport.js, which is authentication middleware for Node.js
const initializePassport = require('./passport-config')
initializePassport(
    passport,
    username => users.find(user => user.username === username),
    id => users.find(user => user.id === id)
)

app.set('view-engine', 'ejs')
app.use(expressLayouts);
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false })) // https://stackoverflow.com/questions/23259168/what-are-express-json-and-express-urlencoded
app.use(flash())
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

// read user json data
let rawdata = fs.readFileSync('public/data/users.json');
let users = JSON.parse(rawdata);

/************ Home - Home Page ************/
app.get('/', checkAuthenticated, (req, res) => {
    res.render('Home.ejs', { layout: './pages/_Info.ejs', title: 'Home' })
})

/************ Login/Logout ************/
app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('Login.ejs', { layout: './pages/_Info.ejs', title: 'Login' })
})

// The login POST request will be handled in passport-config.js
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})

/************ Register ************/
app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('Register.ejs', { layout: './pages/_Info.ejs', title: 'Register' })
})
app.use(expressLayouts);
app.set("layout", "./pages/_Info");
app.set("view engine", "ejs");


/************ Other Pages ************/
app.get('/info', (req, res) => {
    res.render('Info.ejs', { layout: './pages/_Info.ejs', title: 'Sign Up' })
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const hPass = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            username: req.body.username,
            email: req.body.email,
            password: hPass,
            address: req.body.address,
            priv: req.body.priv
        })
        let userdata = JSON.stringify(users, undefined, 4)
        fs.writeFileSync('public/data/users.json', userdata)
        res.redirect('/login')
    }
    catch {
        res.redirect('/register')
    }
})

/************ Helper Functions ************/
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }

    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}

// Listen on port 3000
app.listen(3000)
console.log("Listening on port 3000 ----> localhost:3000")