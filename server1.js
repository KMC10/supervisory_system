import express from "express";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mysql from "mysql2";
import bodyParser from "body-parser";
import open from "open";
import session from "express-session";
import { body, validationResult } from 'express-validator';
import { createServer } from 'http';
import { Server } from 'socket.io';
import Excel from 'exceljs';
import nodemailer from 'nodemailer';
import multer from "multer";
import fs from "fs";


multer({ dest: 'uploads/' })
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
  cb(null, new Date().toISOString() + file.originalname);
  }
});

const upload = multer({ storage: storage });
const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const server = createServer(app);
const io = new Server(server);
const port = 5000;
app.set('view engine', 'ejs');
app.set('views', 'path/to/views/directory');

//get user-login page
app.get("/login", (req, res) => {
  const userError = false;
  res.setHeader('Content-Type', 'text/html');
  res.render(__dirname + "/views/login_page.ejs", { userError });
});



app.get("/admin", (req, res) => {
  const userError = false;
  res.setHeader('Content-Type', 'text/html');
  res.render(__dirname + "/public/admin.ejs", { sent: false });
});

app.get("/password", (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.render(__dirname + "/public/password.ejs");
});


app.get("/", (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.render(__dirname + "/public/cover-page.ejs", { sent: false });
});

app.get("/email", (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.render(__dirname + "/public/email.ejs");
});


app.get("/error_verify", (req, res) => {
  const V_error = true;
  res.setHeader('Content-Type', 'text/html');
  res.render(__dirname + "/public/verification.ejs", { V_error });
});

app.get("/verification", (req, res) => {
  const V_error = false;
  res.setHeader('Content-Type', 'text/html');
  res.render(__dirname + "/public/verification.ejs", { V_error });
});


app.get("/leave", (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.render(__dirname + "/public/apply.ejs", { sent: false });
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
  host: 'az900.mysql.database.azure.com',
  user: 'KMC',
  password: 'kunjani411021348.',
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
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static("public"));
app.use(express.json());

app.use(session({
  secret: 'kmc',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Note: secure should be true if you're using HTTPS
}));




// Route to handle user login
app.post("/submit", (req, res) => {
  //console.log(req.body);
  const { username, password } = req.body;
  //var UserID = req.user.id;
  console.log(req.body);
  //query to check if the user exists in the database
  connection.query("SELECT * FROM user_login WHERE username = ? AND password = ?", [username, password], (error, results) => {
    if (error) {
      console.log("server error");
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    // If the query returned a result, login was successful
    if (results.length > 0) {
      console.log("success");

      const query = 'SELECT * FROM employees WHERE username = ?';
      connection.query(query, [username], (err, rows) => {
        if (err) {
          console.error('Error selecting user: ', err);
          res.status(500).send('Internal Server Error');
          return;
        }

        if (rows.length === 0) {
          res.status(404).send('User not found');
          return;
        }

        // Extract user details from the first row
        var user = {
          id: rows[0].id,
          Name: rows[0].Name,
          Surname: rows[0].Surname,
          Email: rows[0].Email,
          Department: rows[0].Department,
          Phone: rows[0].Phone,
          Birthday: rows[0].Birthday,
          Salary: rows[0].Salary,
          Adress: rows[0].Adress,
          Occupation: rows[0].Occupation,
          username: rows[0].username,
          isAdmin: rows[0].isAdmin,
          // Add more properties as needed
        };
        req.session.g_user = user;
        console.log('User set in session111111111:', req.session.g_user);

        // Set button statuses in session only if they are not already set
        if (!req.session.buttonStatuses) {
          req.session.buttonStatuses = {
            checkinDisabled: false, // Set initial status as needed
            checkoutDisabled: true
          };
        }

        // Render the response
        connection.query('SELECT Profile_Image FROM employees WHERE id = ?', [user.id], (err, result) => {
          if (err) throw err;

          const imageSourceFromDatabase = result[0].Profile_Image;
          res.setHeader('Content-Type', 'text/html');
          res.render(__dirname + '/public/edited_acc.ejs', { isAdmin: user.isAdmin, Name: user.Name, Surname: user.Surname, Email: user.Email, userId: user.id, profilePicSrc: imageSourceFromDatabase });
        });

        //res.render(__dirname + '/public/edited_acc.ejs', { isAdmin: user.isAdmin, Name: user.Name, Surname: user.Surname, Email: user.Email, userId: user.id, profilePicSrc: imageSourceFromDatabase });
      });
    } else {
      console.log("fail");
      res.setHeader('Content-Type', 'text/html');
      res.render(__dirname + "/views/login_page.ejs", { userError: true });
    }
  });
});

//const fs = require('fs');
//const path = require('path');
// Assuming pool is already defined and connected to your database

app.post('/upload', upload.single('profilePicture'), (req, res) => {
  console.log(req.file.path);
  const userId = req.session.g_user.id;
  const fileName = `${userId}_${new Date().toISOString().replace(/:/g, '-')}.png`;
  const newPath = path.join(__dirname, 'profile_pictures', fileName);
  if (!req.file) {
    res.status(400).send('No file uploaded');
    return;
  }


  fs.rename(req.file.path, newPath, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error uploading profile picture');
      return;
    }

    // Store the image path in your MySQL database
    const query = 'UPDATE users SET profile_picture = ? WHERE id = ?';
    connection.query(query, [newPath, userId], (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error updating profile picture');
        return;
      }

      res.redirect('/profile');
    });
  });
});


app.get('/employees', (req, res) => {
  const sql = 'SELECT * FROM employees';
  connection.query(sql, (err, rows) => {
    if (err) {
      throw err;
    }
    res.setHeader('Content-Type', 'text/html');
    res.render(__dirname + "/public/employees.ejs", { employees: rows });
  });
});

app.use((req, res, next) => {
  console.log('Session ID:', req.session.id);
  console.log('Session Data:', req.session.g_user);
  next();
});
app.get('/results', (req, res) => {
  //get username from session
  const myid = req.session.g_user.id;
  // console.log('User set in session:', user_id);
  const sql = 'SELECT leave_id, start_date, applied, Accepted FROM leave_requests WHERE leave_id LIKE ?';
  connection.query(sql, [myid + '%'], function (error, results, fields) {
    if (error) throw error;
    res.setHeader('Content-Type', 'text/html');
    res.render(__dirname + "/public/leave_results.ejs", { data: results });
    //  res.render('index', { data: results });
  });
});

//Insert new member into the database
app.post("/add", (req, res) => {
  const { id, Name, Surname, Email, Department, Phone, Birthday, Salary, Adress, Occupation, username, isAdmin } = req.body;

  // Insert into database
  connection.query('INSERT INTO employees (id, Name, Surname, Email, Department, Phone, Birthday, Salary, Adress, Occupation, username, isAdmin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, Name, Surname, Email, Department, Phone, Birthday, Salary, Adress, Occupation, username, isAdmin], (error, results, fields) => {
      if (error) {
        console.error('Error inserting data: ' + error);
        res.status(500).send('Error inserting data into database');
        return;
      }
      else {
        const sent = true;
        res.render(__dirname + "/public/admin.ejs", { sent: sent });
        console.log('Data inserted successfully.');
        // alert("Added Successfuly");
        // res.status(200).send('Data inserted successfully');
      }
    });
});




app.post("/apply",
  // Input validation
  [
    body('start_date').isDate(),
    body('end_date').isDate()
  ],
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    //get the current user's id
    const user_id = req.session.g_user.id;
    console.log('User set in session:', user_id);

    const { start_date, end_date, reason } = req.body;

    //concatenate the user_id and start_date to create a unique id
    const leave_id = user_id + " " + start_date;

    try {
      // Insert into database
      connection.query('INSERT INTO leave_requests (leave_id, start_date, end_date, reason, applied, Accepted, Rejected) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [leave_id, start_date, end_date, reason, 1, "To be Reviewed", "pending"], (error, results, fields) => {
          if (error) {
            throw error;
          }

          const sent = true;
          res.setHeader('Content-Type', 'text/html');
          res.render(__dirname + "/public/apply.ejs", { sent: sent });
          console.log('LOKHONA:', req.session.g_user.id);
        });
    } catch (error) {
      console.error('Error inserting data: ' + error);
      res.status(500).send('Error applying for leave');
    }
    //create leave_id variable to use in another requests using session
    req.session.leave_id = leave_id;
    console.log('leave_id:', leave_id);
  }
);

// Define a route to handle button clicks

app.post("/checkin", (req, res) => {
  const checkin_time = new Date();
  const user = req.session.g_user;
  console.log('User set in session:', user);

  if (user) {
    connection.query('INSERT INTO attendance (checkin_time, user_id, isCheckedIn) VALUES (?, ?, 1)', [checkin_time, user.id], (err, result) => {
      if (err) {
        console.error('Error inserting check-in record:', err);
        return res.status(500).send('Error updating check-in time');
      }

      const newRowId = result.insertId;
      req.session.newRowId = newRowId;
      console.log('Check-in time recorded successfully');

      // Update isCheckedIn field using newRowId
      connection.query('UPDATE attendance SET isCheckedIn = ? WHERE newRowId = ?', [1, newRowId], (err, result) => {
        if (err) {
          console.error('Error updating isCheckedIn:', err);
          return res.status(500).send('Error updating isCheckedIn');
        }

        console.log('isCheckedIn updated successfully');
        return res.status(200).send("Check-in time recorded and isCheckedIn updated successfully");
      });
    });
  } else {
    console.log('User not found in session');
    return res.status(400).send('User not found in session');
  }

  connection.query('SELECT isCheckedIn FROM attendance WHERE user_id = ? ORDER BY checkin_time DESC LIMIT 1', [user.id], (err, result) => {
    if (err) {
      console.error("Error fetching isCheckedIn: " + err.stack);
      res.status(500).send("Error fetching isCheckedIn");
      return;
    }

    // Set the state of the buttons based on the fetched isCheckedIn value
    let isCheckedIn = result[0].isCheckedIn;
    //res.status(200).send(isCheckedIn.toString());
    // ...
  });
});


app.post("/checkout", (req, res) => {
  // Record check-out time
  const checkout_time = new Date();
  var user = req.session.g_user;
  var newRowId = req.session.newRowId;
  connection.query('SELECT checkin_time FROM attendance WHERE user_id = ? AND DATE(checkin_time) = CURDATE()', [user.id], (err, result) => {
    if (err) {
      console.error('Error selecting checkin time: ', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    if (result.length > 0) {
      const checkinTime = new Date(result[0].checkin_time);
      const checkoutTime = new Date();

      if (isNaN(checkinTime.getTime()) || isNaN(checkoutTime.getTime())) {
        console.error('Invalid checkin or checkout time');
        res.status(500).send('Internal Server Error');
        return;
      }

      // Calculate the number of hours worked
      const hoursWorked = (checkoutTime - checkinTime) / 1000 / 60 / 60;
      connection.query('UPDATE attendance SET checkout_time = ?, isCheckedIn = 0, hours_worked = ? WHERE DATE(checkin_time) = DATE(?) AND user_id = ?', [checkoutTime, hoursWorked, checkinTime, user.id], (err, result) => {
        if (err) {
          console.log(hoursWorked);
          console.error("Error updating check-out time: " + err.stack);
          res.status(500).send("Error updating check-out time");
          return;
        }
        console.log('Check-out time recorded successfully');
        res.status(200).send("Check-out time recorded successfully");
        // res.render(__dirname + '/public/edited_acc.ejs', { checkoutDisabled: checkoutDisabled });
      });
    }
  });
});

// app.get("/getUserId", (req, res) => {
//   var user = req.session.g_user;
//   if (user) {
//     res.status(200).send(user.id.toString());
//   } else {
//     res.status(400).send('User not found in session');
//   }
// });

app.get("/isCheckedIn", (req, res) => {
  var userId = req.query.userId;
  if (userId) {
    connection.query('SELECT isCheckedIn FROM attendance WHERE user_id = ? ORDER BY checkin_time DESC LIMIT 1', [userId], (err, result) => {
      if (err) {
        console.error("Error fetching isCheckedIn: " + err.stack);
        res.status(500).send("Error fetching isCheckedIn");
        return;
      }

      res.status(200).send(result[0].isCheckedIn.toString());
    });
  } else {
    res.status(400).send('User ID not provided');
  }
});


app.post('/leave-application', function (req, res) {
  // Get request body
  const requestBody = req.body;

  // Send notification to admin page
  // This will depend on your implementation
  // You might use WebSocket or Server-Sent Events for real-time notifications

  // Send response
  res.json({ message: 'Leave application received' });
});


app.get('/requests', (req, res) => {
  const sql = 'SELECT * FROM leave_requests WHERE applied = 1';
  connection.query(sql, (err, results, fields) => {
    if (err) throw err;
    res.setHeader('Content-Type', 'text/html');
    res.render(__dirname + "/public/leaves.ejs", { data: results });
    //  res.render('index', { data: results });
  });
});

app.post('/approve', (req, res) => {
  const leaveId = req.body.leaveId;
  const tick = '✔';
  //get user id from session
  //const user_id = req.session.g_user.id;
  const leave_id = req.session.leave_id;
  //console.log('User set in session:', user_id);

  //const id = req.params.id;
  const query = 'UPDATE leave_requests SET applied = ?, Accepted = ?, Rejected = ? WHERE leave_id = ?';
  const values = ['Reviewed', tick, 'no', leaveId];

  connection.query(query, values, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('An error occurred while updating the record.');
      return;
    }
    res.status(200).send(result);
  });
});

app.post('/reject', (req, res) => {
  const leaveId = req.body.leaveId;
  //get user id from session
  //const user_id = req.session.g_user.id;
  const leave_id = req.session.leave_id;
  //console.log('User set in session:', user_id);

  //const id = req.params.id;
  const query = 'UPDATE leave_requests SET applied = ?, Accepted = ?, Rejected = ? WHERE leave_id = ?';
  const values = ['assesed', 'no', 'yes', leaveId];

  connection.query(query, values, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('An error occurred while updating the record.');
      return;
    }
    res.status(200).send(result);
    console.log('LOBUKIWE:', req.session.g_user.Name);
  });
});

app.get("/button_state", (req, res) => {
  const state_id = req.session.g_user.id;
  const buttonStatuses = req.session.buttonStatuses || {};

  // Query attendance table for user id of user in session and checkin_time containing current date
  connection.query("SELECT user_id FROM attendance WHERE user_id = ? AND DATE(checkin_time) = CURDATE() ORDER BY checkin_time DESC LIMIT 1", [state_id], (err, result) => {
    if (err) {
      console.error('Error selecting check-in status: ', err);
      res.status(500).send('Internal Server Error');
      return;
    }

    // Update buttonStatuses based on whether the user is checked in
    if (result.length > 0) {
      // If there is a check-in record, check if there's a corresponding checkout record
      connection.query("SELECT user_id FROM attendance WHERE user_id = ? AND DATE(checkout_time) = CURDATE()", [state_id], (err, checkoutResult) => {
        if (err) {
          console.error('Error selecting check-out status: ', err);
          res.status(500).send('Internal Server Error');
          return;
        }
        if (checkoutResult.length > 0) {
          buttonStatuses.checkinDisabled = true;
          buttonStatuses.checkoutDisabled = true; // Both buttons disabled if checked in and checked out
        } else {
          buttonStatuses.checkinDisabled = true;
          buttonStatuses.checkoutDisabled = false; // Only check-out button enabled if checked in but not checked out
        }
        res.json(buttonStatuses);
      });
    } else {
      buttonStatuses.checkinDisabled = false;
      buttonStatuses.checkoutDisabled = true; // Only check-in button enabled if not checked in
      res.json(buttonStatuses);
    }
  });
});


app.get("/records", (req, res) => {
  const myid = req.session.g_user.id;
  const sql = 'SELECT checkin_time, checkout_time, hours_worked FROM attendance WHERE user_id = ?';

  // Query to select all attendance records for the employee
  connection.query(sql, [myid], function (error, results, fields) {
    if (error) {
      console.error('Error selecting attendance records: ', error);
      res.status(500).send('Internal Server Error');
      return;
    }

    // Calculate total hours worked
    let totalHoursWorked = 0;
    for (let i = 0; i < results.length; i++) {
      totalHoursWorked += results[i].hours_worked;
    }

    // Render the page with attendance records and total hours worked
    res.setHeader('Content-Type', 'text/html');
    res.render(__dirname + "/public/attendance_records.ejs", { data: results, totalHoursWorked: totalHoursWorked });
  });
});

app.get("/download-records", (req, res) => {
  const myid = req.session.g_user.id;
  const name = req.session.g_user.Name;
  const sql = 'SELECT checkin_time, checkout_time, hours_worked FROM attendance WHERE user_id = ?';

  // Query to select all attendance records for the employee
  connection.query(sql, [myid], function (error, results, fields) {
    if (error) {
      console.error('Error selecting attendance records: ', error);
      res.status(500).send('Internal Server Error');
      return;
    }

    // Create a new workbook
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('Attendance Records');

    // Add headers to the worksheet
    worksheet.addRow(['Check-in Time', 'Check-out Time', 'Hours Worked']);

    // Add attendance records to the worksheet
    for (const record of results) {
      worksheet.addRow([record.checkin_time, record.checkout_time, record.hours_worked]);
    }

    // Calculate total hours worked and salary
    let totalHoursWorked = 0;
    for (const record of results) {
      totalHoursWorked += record.hours_worked;
    }
    const hourlyPayRate = 10; // Example hourly pay rate (you can replace it with your actual pay rate)
    const totalSalary = totalHoursWorked * hourlyPayRate;

    // Add total hours worked and salary to the worksheet
    worksheet.addRow(['TOTAL Hours', '', totalHoursWorked]);
    worksheet.addRow(['Total Salary', '', totalSalary]);

    // Generate the Excel file
    workbook.xlsx.writeBuffer().then(buffer => {
      // Set response headers for file download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${name}_attendance_records.xlsx`);

      // Send the Excel file as a buffer
      res.send(buffer);
    }).catch(err => {
      console.error('Error generating Excel file: ', err);
      res.status(500).send('Internal Server Error');
    });
  });
});



app.get('/logout', (req, res) => {
  // Check if the user is logged in
  if (!req.session.g_user) {
    res.status(401).send('Unauthorized');
    return;
  }

  // Destroy session
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      res.status(500).send('Error logging out');
      return;
    }
    // Clear any authentication-related cookies
    res.clearCookie('yourCookieName');

    // Redirect to login page
    res.redirect('/login');
  });
});


//RESET PASSWORD TO
app.post("/request-password-reset", (req, res) => {
  const { email } = req.body;
  const sql = 'SELECT * FROM employees WHERE Email = ?';
  connection.query(sql, [email], (error, results) => {
    if (error) {
      console.error('Error checking email existence: ', error);
      res.status(500).send('Internal Server Error');
      return;
    }

    if (results.length === 0) {
      // Email does not exist
      res.status(404).send('Email not found');
      return;
    }
    function generateVerificationCode() {
      const length = 6; // You can adjust the length of the verification code as needed
      const characters = '0123456789'; // Characters to include in the code
      let code = '';
      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters[randomIndex];
      }
      return code;
    }
    function storeVerificationCode(email, verificationCode) {
      // You can implement code here to store the verification code in the database or a temporary storage like Redis
      // For example, if you're using MySQL:
      const sql = 'INSERT INTO password_reset_tokens (email, verification_code) VALUES (?, ?)';
      connection.query(sql, [email, verificationCode], (error, results) => {
        if (error) {
          console.error('Error storing verification code:', error);
          // Handle error (e.g., return an error response to the client)
          return;
        }
        console.log('Verification code stored successfully');
      });
    }

    // Create a transporter using SMTP transport
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: '411021348@gms.ndhu.edu.tw',
        pass: 'kunjani411021348'
      }
    });

    function sendVerificationEmail(email, verificationCode) {
      // Email content
      const mailOptions = {
        from: '411021348@gms.ndhu.edu.tw',
        to: email,
        subject: 'Password Reset Verification Code',
        text: `Your verification code for password reset is: ${verificationCode}`
      };

      // Send email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending verification email:', error);
          // Handle error (e.g., return an error response to the client)
          return;
        }
        console.log('Verification email sent:', info.response);
      });
    }

    // Email exists, generate verification code
    const verificationCode = generateVerificationCode();

    // Store verification code in database or temporary storage
    storeVerificationCode(email, verificationCode);

    // Send verification code to the user's email
    sendVerificationEmail(email, verificationCode);

    // Redirect user to verification page
    res.redirect('/verification');
  });
});

app.post("/verify-code", (req, res) => {
  const verificationCode = req.body.verification_code;

  // Check if the verification code exists in the password_reset_tokens table
  const sql = 'SELECT * FROM password_reset_tokens WHERE verification_code = ?';
  connection.query(sql, [verificationCode], (error, results) => {
    if (error) {
      console.error('Error verifying verification code:', error);
      // Send error response
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    if (results.length > 0) {
      // Verification code does not exist
      // Send error response
      //res.setHeader('Content-Type', 'text/html');
      //res.render(__dirname + "/public/verification.ejs", { V_error: false });
      // res.status(200).render(__dirname + "/public/verification.ejs", { V_error: false, results: "Enter New Password Below" });
      console.log("Verification code exists");

      return;
    }
    else {

      // Send fail response
      res.setHeader('Content-Type', 'text/html');
      //res.render(__dirname + "/public/verification.ejs", { V_error: true });
      res.status(400).json({ error: 'Invalid verification code' });
      console.log("Verification code does not exist");
      return;

    }


  });
});



// Step 8: Update Password
app.post("/reset-password", (req, res) => {
  const verificationCode = req.body.verification_code;
  const newPassword = req.body.new_password;
  const confirmPassword = req.body.confirm_password;

  // Check if verification code exists in the password_reset_tokens table
  const sql = 'SELECT * FROM password_reset_tokens WHERE verification_code = ?';
  connection.query(sql, [verificationCode], (error, results) => {
    if (error) {
      console.error('Error checking verification code:', error);
      // Send error response
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    if (results.length === 0) {
      // Verification code does not exist
      // Send error response
      res.status(400).json({ error: 'Invalid verification code' });
      console.log("n00000##################");
      return;
    }

    // Verification code exists, proceed to reset password
    if (newPassword === confirmPassword) {
      // Passwords match, update password
      // Add your code here to update the password in the database or wherever it is stored

      // Send success response
      res.status(200).json({ message: 'Password updated successfully' });
    } else {
      // Passwords do not match
      // Send error response
      res.status(400).json({ error: 'Passwords do not match' });
    }
  });
});

app.post('/delete-employee', (req, res) => {
  const username = req.body.username;

  const sql = 'DELETE FROM employees WHERE username = ?';

  connection.query(sql, username, (err, result) => {
    if (err) throw err;
    console.log(`Deleted ${result.affectedRows} row(s)`);
    res.send(`Deleted ${result.affectedRows} row(s)`);
  });
});


// Start the server
// app.listen(port, () => {
//   console.log(`Server is listening on port ${port}`);
// });
// open(`http://localhost:${port}`);
