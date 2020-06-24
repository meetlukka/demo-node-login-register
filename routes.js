const express = require('express')
const app = express()
const routes = express.Router();
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const user = require('./models.js')  
const passport = require('passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash'); 

routes.use(bodyParser.urlencoded({extended : true}));
routes.use(require('body-parser').urlencoded({ extended: true }));
routes.use(cookieParser('secret'));
routes.use(session({
    secret:'secret',
    maxAge:3600000,    //2 week of time for cookie persistance
    resave:true,
    saveUninitialized:true,
}));

routes.use(passport.initialize());
routes.use(passport.session());
routes.use(flash());
routes.use(function(req,res,next){
    //Global variables
    res.locals.success_message = req.flash('success_message');
    res.locals.error_message = req.flash('error_message');
    res.locals.error = req.flash('error');
    next();
})

routes.get('/',(req,res)=>{
    res.render('register');
})


routes.post('/register',(req,res)=>{
    var {email,password,firstname,lastname,number,gender} = req.body;
    console.log(email,password,firstname,lastname,number,gender);

    if(!email || !password || !firstname || !lastname || !number || !gender ){
        err = "Please fill all the fields..."
        res.render('register',{'err':err, email:email,firstname:firstname,lastname:lastname,number:number});
    }

    if(typeof err =='undefined'){
        user.findOne({ email:email},function(err, data){
            if(err) throw err;
            if(data){
                console.log("User Exists!");
                err = "User already exists with given Email...";
                res.render('register',{'err':err,'firstname':firstname,'lastname':lastname,'number':number});
            }
            else{
                bcrypt.genSalt(10,(err,salt)=> {
                    if(err) throw err;
                    bcrypt.hash(password,salt,(err,hash)=>{
                        if(err) throw err;
                        password=hash;
                        user({
                            email,
                            password,
                            firstname,
                            lastname,
                            number,
                            gender
                        }).save((err,data)=>{
                            if(err) throw err;
                            req.flash('success_message',"Registered Successfully");
                            res.redirect('/login');
                        })
                    })
                })
            }
        });
    }


    
});

//Authentication Strategy for Login 

var localStrategy = require('passport-local').Strategy;
passport.use(new localStrategy({usernameField : 'email'},(email,password,done)=>{
    
    user.findOne({ email:email},function(err,data){
       
        if(err) throw err;
        if(!data){
            return done(null,false,{ message :"User does not exists!"});
        }
        bcrypt.compare(password,data.password,(err,match)=>{
            if(err){
                return done(null,false);
            }
            if(!match){
                return done(null,false,{ message :"Password incorrect!!!"});
            }
            if(match){
               
                return done(null,data);
            }
        });
    });
}));

passport.serializeUser(function(user,cb){
    cb(null,user.id);
});

passport.deserializeUser(function(id,cb){
    user.findById(id,function(err,user){
        cb(err,user);
    });
});

routes.get('/login',(req,res)=>{
    res.render('login');
});

routes.post('/login',(req,res,next)=>{
    passport.authenticate('local',{
       
        successRedirect:'/success',
         failureRedirect:'/login',
        failureFlash: true
    })(req,res,next);
});

const checkAuthenticated = function(req,res,next){
    if(req.isAuthenticated()){
        res.set('Cache-Control','no-cache,private,no-store,must-revalidate,post-check=0,pre-check=0');
        return next();
    }else{
        res.redirect("/login");
    }
}

routes.get('/success',checkAuthenticated,(req,res)=>{
    res.render('success',{'user':req.user});
});

routes.get('/logout',(req,res)=>{
    req.logout();
    res.redirect('/login');
});

routes.post('/addmessage',checkAuthenticated,(req,res)=>{
    console.log(req.body['message']);
    user.findOneAndUpdate(
        
        {email : req.user.email},
        { $push :{
            messages : req.body['message']
            
        } },(err,data)=>{
            if(err) throw err;
            if(data) console.log("added");
        }
        
    );
    res.redirect('/success');
});

module.exports = routes;