import express from "express";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mysql from "mysql2";
import bodyParser from "body-parser";
import cheerio from "cheerio";
import fetch from 'node-fetch';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 5000;
app.set('view engine', 'ejs');
app.set('views', 'path/to/views/directory');

//get admin-login page
app.get("/", (req, res) =>{
  const userError = false; 
  res.setHeader('Content-Type', 'text/html'); 
    // Render the login page with the showError variable
    res.render(__dirname + "/views/admin_login.ejs", { userError });
    console.log("got admin-login");
   // next();
});

async function handleLogin(username, password) {
  try {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);


  } catch (error) {
    console.error("Error:", error);
    return 'An error occurred';
  }
};

 const username = 'example_username';
 const password = 'example_password';

handleLogin(username, password);

// MySQL database connection setup
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'kunjani411021348',
  database: 'kmc_company'
});


connection.connect((err) => {
  if (err) {
      console.error('Database connection failed: ' + err.stack);
      return;
  }
  console.log("Connected to database.");
});

// Middleware to parse incoming JSON requests
app.use(bodyParser.urlencoded({extended: true}));

// Serve static files from the 'public' directory
app.use(express.static("public"));
app.use(express.json());

// Route to handle admin login
app.post("/submit", (req, res) => {
  const { username, password } = req.body;
  console.log(req.body)
  
  // Query the database for the provided username and passwhttp://localhost:3000/loginord
  connection.query("SELECT * FROM admin_login WHERE username = ? AND password = ?", [username, password], (error, results) => {
    if (error) {
      console.log("server error");
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    // If the query returned a result, login was successful
    if (results.length > 0) {
      console.log("sucess1");
      res.sendFile(__dirname + '/public/admin.html');
      
    } else {
      console.log("fail1");
      //userError = true;
      res.setHeader('Content-Type', 'text/html');
      res.render(__dirname + "/views/admin_login.ejs", { userError: true });
    }
  });
});


//get user-login page
app.get("/", (req, res) =>{
  const userError = false; 
  res.setHeader('Content-Type', 'text/html'); 
    // Render the login page with the showError variable
    res.render(__dirname + "/views/login_page.ejs", { userError });
    //next();
});


// Route to handle user login
app.post("/submit", (req, res) => {
  const { username, password } = req.body;
  console.log(req.body);
  
  

  // Query the database for the provided username and passwhttp://localhost:3000/loginord
  connection.query("SELECT * FROM user_login WHERE username = ? AND password = ?", [username, password], (error, results) => {
    if (error) {
      console.log("server error");
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    // If the query returned a result, login was successful
    if (results.length > 0) {
      console.log("sucess");
      res.sendFile(__dirname + '/public/edited_acc.html', { userError: false });
      
    } else {
      console.log("fail");
      res.setHeader('Content-Type', 'text/html');
      res.render(__dirname + "/views/login_page.ejs", { userError: true });
      
    }
  });
});



// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

//DELETE   DELETE  DELETE   DELETE   DELETE   DELETE   DELETE   DELETE   DELETE   DELETE   DELETE
// First route for checking in
app.post('/checkin', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  // Example query to check if the user exists in the userlogin info table
  connection.query('SELECT * FROM userlogin_info WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
      if (error) {
          console.log("Error checking login credentials:", error);
          res.status(500).send("Error checking login credentials");
      } else {
          if (results.length > 0) {
              // User exists, fetch user details from the employees table
              connection.query('SELECT * FROM employees WHERE username = ?', [username], function(error, results, fields) {
                  if (error) {
                      console.log("Error fetching user details:", error);
                      res.status(500).send("Error fetching user details");
                  } else {
                      if (results.length > 0) {
                          // Store user object in request object for later use
                          req.user = results[0];
                          res.status(200).send("User checked in successfully");
                      } else {
                          res.status(404).send("User details not found");
                      }
                  }
              });
          } else {
              res.status(401).send("Invalid username or password");
          }
      }
  });
});

// Second route that can access user data stored in req object
app.post('/anotherRoute', function(req, res) {
  if (req.user) {
      // Access user object stored in req object
      var user = req.user;
      // Use user object in your logic
      console.log(user);
      res.status(200).send("User object accessed successfully");
  } else {
      res.status(400).send("User object not found");
  }
});

// Middleware to fetch user data by ID
app.use('/route1', function(req, res, next) {
  var userId = req.body.userId; // Assuming userId is sent in the request body

  // Example MySQL query to fetch user data by ID
  connection.query('SELECT * FROM users WHERE id = ?', [userId], function(error, results, fields) {
      if (error) {
          console.log("Error fetching user data:", error);
          res.status(500).send("Error fetching user data");
      } else {
          if (results.length > 0) {
              // Store user object in request object for later use
              req.user = results[0];
              next(); // Call the next middleware or route handler
          } else {
              res.status(404).send("User not found");
          }
      }
  });
});

// Second route that can access user data fetched by the middleware
app.post('/route2', function(req, res) {
  var userData = req.user; // Access user object stored in the request object

  // Now you can use userData in your second route
  // Example: console.log(userData);

  // Handle the rest of your logic for route2 here
});


// Middleware to fetch user data by ID
app.use('/firstRoute', function(req, res, next) {
  var userId = req.body.userId; // Assuming userId is sent in the request body

  // Example MySQL query to fetch user data by ID
  connection.query('SELECT * FROM users WHERE id = ?', [userId], function(error, results, fields) {
      if (error) {
          console.log("Error fetching user data:", error);
          res.status(500).send("Error fetching user data");
      } else {
          if (results.length > 0) {
              // Store user object in request object for later use
              req.user = results[0];
              next(); // Call the next middleware or route handler
          } else {
              res.status(404).send("User not found");
          }
      }
  });
});

// Second route that can access user data fetched by the middleware
app.post('/secondRoute', function(req, res) {
  var userIdFromFirstRoute = req.user.userId; // Access userId stored in req.user

  // Use userIdFromFirstRoute in your second route
  console.log(userIdFromFirstRoute);

  // Proceed with your logic for second route...
});

