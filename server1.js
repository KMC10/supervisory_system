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
import geolib from "geolib";
import PDFDocument from "pdfkit";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import require from "path";
import moment from "moment";


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

// Define allowed location and radius
//const app = express();
app.use(express.json());

// Define the allowed location and radius
const allowedLocation = {
  latitude: 40.712776,  // Replace with your allowed location latitude
  longitude: -74.005974 // Replace with your allowed location longitude
};
const allowedRadius = 100; // Allowed radius in meters

//get user-login page
app.get("/login", (req, res) => {
  const userError = false;
  res.setHeader('Content-Type', 'text/html');
  res.render(__dirname + "/views/login_page.ejs", { userError });
});

app.get('/cover-page', function (req, res) {
  res.setHeader('Content-Type', 'text/html');
  res.render(__dirname + "/public/cover-page.ejs");
});

// const moment = require('moment'); // Make sure to install moment.js with `npm install moment`



app.get('/announcement', function (req, res) {
  res.setHeader('Content-Type', 'text/html');
  res.render(__dirname + "/public/announcement.ejs", { sent: false });
})
app.get('/attendance', function (req, res) {
  // Query to calculate overall percentage for late arrivals, early departures, early arrivals, and absences
  const overallQuery = `
    SELECT 
      (lateCount * 100 / totalDays) AS latePercentage,
      (departuresCount * 100 / totalDays) AS earlyDeparturePercentage,
      (earlyCount * 100 / totalDays) AS earlyArrivalPercentage,
      (absencesCount * 100 / totalDays) AS absencePercentage
    FROM (
      SELECT 
        COUNT(CASE WHEN checkin_time > '08:00:00' THEN 1 END) AS lateCount,
        COUNT(CASE WHEN checkout_time < '16:00:00' THEN 1 END) AS departuresCount,
        COUNT(CASE WHEN checkin_time < '08:00:00' THEN 1 END) AS earlyCount,
        COUNT(CASE WHEN checkin_time IS NULL OR checkout_time IS NULL THEN 1 END) AS absencesCount,
        COUNT(*) AS totalDays
      FROM attendance
      WHERE MONTH(checkin_time) = MONTH(CURRENT_DATE())
    ) AS counts
  `;

  connection.query(overallQuery, (error, results) => {
    if (error) {
      console.error('Error calculating overall percentages: ', error);
      res.status(500).send('Internal Server Error');
      return;
    }

    // Extract the calculated percentages from the query results
    const latePercentage = parseFloat(results[0].latePercentage).toFixed(2);
    const earlyDeparturePercentage = parseFloat(results[0].earlyDeparturePercentage).toFixed(2);
    const earlyArrivalPercentage = parseFloat(results[0].earlyArrivalPercentage).toFixed(2);
    const absencePercentage = parseFloat(results[0].absencePercentage).toFixed(2);
    // Render the page with the calculated percentages
    res.setHeader('Content-Type', 'text/html');
    res.render(__dirname + "/public/attendance_stats.ejs", {
      sent: true,
      LatePercentage: latePercentage,
      DeparturePercentage: earlyDeparturePercentage,
      EarlyPercentage: earlyArrivalPercentage,
      AbsencePercentage: absencePercentage
    });
  });
});




app.get('/manage', function (req, res) {
  res.setHeader('Content-Type', 'text/html');
  res.render(__dirname + "/public/manage.ejs", { sent: false });
});

app.get('/suggestion_page', function (req, res) {
  res.setHeader('Content-Type', 'text/html');
  res.render(__dirname + "/suggestions.ejs");
  // res.render('suggestions.html');
})

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
  const { username, password } = req.body;
  console.log(req.body);

  // Query to check if the user exists in the database
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
        };
        req.session.g_user = user;
        console.log('User set in session:', req.session.g_user);

        // Set button statuses in session only if they are not already set
        if (!req.session.buttonStatuses) {
          req.session.buttonStatuses = {
            checkinDisabled: false, // Set initial status as needed
            checkoutDisabled: true
          };
        }

        // Calculate early, late, and absent counts for the current month
        const currentMonth = new Date().getMonth() + 1; // Months are zero-based in JS
        const userId = user.id;
        const currentDate = new Date();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDayOfCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

        // Query to get attendance data for the current month
        const attendanceQuery = `
          SELECT 
            DATE(checkin_time) AS checkin_date,
            TIME(checkin_time) AS checkin_time
          FROM attendance
          WHERE user_id = ? AND checkin_time BETWEEN ? AND ?
        `;

        connection.query(attendanceQuery, [userId, firstDayOfMonth, currentDate], (attendanceError, attendanceResults) => {
          if (attendanceError) {
            console.error('Error selecting attendance data: ', attendanceError);
            res.status(500).send('Internal Server Error');
            return;
          }

          // Initialize counts
          let earlyCount = 0;
          let lateCount = 0;
          let absentCount = 0;

          // Create a set of dates for which check-ins are recorded
          const checkinDates = new Set(attendanceResults.map(result => result.checkin_date.toISOString().split('T')[0]));

          // Determine early and late counts
          attendanceResults.forEach(result => {
            const checkinTime = result.checkin_time;
            if (checkinTime < '08:00:00') {
              earlyCount++;
            } else {
              lateCount++;
            }
          });

          // Calculate the total days from the first day of the current month to the current day
          const totalDaysUpToToday = currentDate.getDate();

          // Calculate the absent count by checking the difference between total days up to today and check-in days
          absentCount = totalDaysUpToToday - checkinDates.size;

          // Render the response
          connection.query('SELECT Profile_Image FROM employees WHERE id = ?', [user.id], (err, result) => {
            if (err) throw err;

            const imageSourceFromDatabase = result[0].Profile_Image;
            res.setHeader('Content-Type', 'text/html');
            res.render(__dirname + '/public/myp.ejs', {
              isAdmin: user.isAdmin,
              Name: user.Name,
              Surname: user.Surname,
              Email: user.Email,
              userId: user.id,
              profilePicSrc: imageSourceFromDatabase,
              earlyCount: earlyCount,
              lateCount: lateCount,
              absentCount: absentCount
            });
          });
        });
      });
    } else {
      console.log("fail");
      res.setHeader('Content-Type', 'text/html');
      res.render(__dirname + "/views/login_page.ejs", { userError: true });
    }
  });
});


app.get('/profile', function (req, res) {
  // User in session
  const user = req.session.g_user;

  // Calculate early, late, and absent counts for the current month
  const currentMonth = new Date().getMonth() + 1; // Months are zero-based in JS
  const userId = user.id;
  const currentDate = new Date();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

  // Query to get attendance data for the current month
  const attendanceQuery = `
    SELECT 
      DATE(checkin_time) AS checkin_date,
      TIME(checkin_time) AS checkin_time
    FROM attendance
    WHERE user_id = ? AND checkin_time BETWEEN ? AND ?
  `;

  connection.query(attendanceQuery, [userId, firstDayOfMonth, currentDate], (attendanceError, attendanceResults) => {
    if (attendanceError) {
      console.error('Error selecting attendance data: ', attendanceError);
      res.status(500).send('Internal Server Error');
      return;
    }

    // Initialize counts
    let earlyCount = 0;
    let lateCount = 0;
    let absentCount = 0;

    // Create a set of dates for which check-ins are recorded
    const checkinDates = new Set(attendanceResults.map(result => result.checkin_date.toISOString().split('T')[0]));

    // Determine early and late counts
    attendanceResults.forEach(result => {
      const checkinTime = result.checkin_time;
      if (checkinTime < '08:00:00') {
        earlyCount++;
      } else {
        lateCount++;
      }
    });

    // Calculate the total days from the first day of the current month to the current day
    const totalDaysUpToToday = currentDate.getDate();

    // Calculate the absent count by checking the difference between total days up to today and check-in days
    absentCount = totalDaysUpToToday - checkinDates.size;

    // Render the response
    res.setHeader('Content-Type', 'text/html');
    res.render(__dirname + "/public/myp.ejs", {
      isAdmin: user.isAdmin,
      Name: user.Name,
      Surname: user.Surname,
      Email: user.Email,
      earlyCount: earlyCount,
      lateCount: lateCount,
      absentCount: absentCount
    });
  });
});

app.get('/menu', async function (req, res) {
  // Get the first day of the current month
  const firstDayOfMonth = moment().startOf('month').format('YYYY-MM-DD');
  const currentDate = moment().format('YYYY-MM-DD');

  // SQL query to fetch attendance records for all employees from the first of this month
  const sqlAttendance = `
      SELECT user_id, DATE_FORMAT(checkin_time, "%Y-%m-%d") AS date, checkin_time 
      FROM attendance 
      WHERE DATE(checkin_time) BETWEEN ? AND ?
  `;

  try {
      // Query to select attendance records
      const [attendanceResults] = await connection.promise().query(sqlAttendance, [firstDayOfMonth, currentDate]);

      // Initialize a map to store attendance statistics for each employee
      const attendanceStats = new Map();

      // Loop through attendance records to calculate statistics for each employee
      for (const record of attendanceResults) {
          const { user_id, date, checkin_time } = record;

          // Initialize counters for the employee if not already initialized
          if (!attendanceStats.has(user_id)) {
              attendanceStats.set(user_id, { name: '', earlyCount: 0, lateCount: 0, absentCount: 0 });
          }

          const stats = attendanceStats.get(user_id);

          // Update attendance statistics based on check-in time
          if (!checkin_time) {
              // If check-in is not done, consider the day as absent
              stats.absentCount++;
          } else {
              const checkinHour = moment(checkin_time).hour();
              const checkinMinute = moment(checkin_time).minute();

              if (checkinHour < 8 || (checkinHour === 8 && checkinMinute === 0)) {
                  stats.earlyCount++;
              } else if (checkinHour >= 9) {
                  stats.lateCount++;
              }
          }
      }

      // Calculate the total number of days up to today
      const totalDays = moment().date();

      // Calculate the absent count by subtracting check-in days from total days
      for (const [, stats] of attendanceStats) {
          stats.absentCount = totalDays - (stats.earlyCount + stats.lateCount);
      }

      // Fetch employee names and add them to the attendance statistics
      for (const [userId, stats] of attendanceStats) {
          const [employeeResult] = await connection.promise().query('SELECT Name FROM employees WHERE id = ?', [userId]);
          stats.name = employeeResult[0].Name;
      }

      // Render the main_menu.ejs template with the calculated values
      res.setHeader('Content-Type', 'text/html');
      res.render(__dirname + "/public/main_menu.ejs", { 
          sent: true,
          attendanceStats: [...attendanceStats.values()] // Convert map values to an array
      });

  } catch (error) {
      console.error('Error fetching attendance records: ', error);
      res.status(500).send('Internal Server Error');
  }
});




app.get('/acc_update', function (req, res) {
  const myId = req.session.g_user.id;
  //user in session 
  const user = req.session.g_user;
  const sql = 'SELECT * FROM employees WHERE id = ?';
  connection.query(sql, [myId], function (error, results) {
    if (error) {
      console.error('Error selecting user: ', error);
      res.status(500).send('Server Error');
    } else {
      if (results.length > 0) {
        res.setHeader('Content-Type', 'text/html');
        res.render(__dirname + "/public/account_update.ejs", { Name: user.Name, Surname: user.Surname, Email: user.Email, employee: results[0] });
      } else {
        res.status(404).send('Employee not found');
      }
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
        res.render(__dirname + "/public/manage.ejs", { sent: sent });
        console.log('Data inserted successfully.');
        // alert("Added Successfuly");
        // res.status(200).send('Data inserted successfully');
      }
    });
});

app.get("/leave", (req, res) => {
  //user in session
  const user = req.session.g_user;
  res.setHeader('Content-Type', 'text/html');
  res.render(__dirname + "/public/apply.ejs", { Name: user.Name, Surname: user.Surname, Email: user.Email, sent: false });
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
    //user in session

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
          res.render(__dirname + "/public/apply.ejs", { Name: user.Name, Surname: Surname.name, Email: Email.name, sent: sent });
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

app.post('/checkin', (req, res) => {
  const checkin_time = new Date();
  const user = req.session.g_user;
  const { latitude, longitude } = req.body;

  console.log('User set in session:', user);

  if (user) {
    // Verify the user's location here (this is just an example)
    // const allowedLatitude = 40.7128;  // Example wrong latitude
    // const allowedLongitude = -74.0060; // Example wrong longitude
    // const locationThreshold = 0.1; // Example threshold

    const allowedLatitude = 23.9014395;  // Example correct latitude
    const allowedLongitude = 121.5455163; // Example correct longitude
    const locationThreshold = 0.1; // Example threshold

    const isLocationValid = Math.abs(latitude - allowedLatitude) <= locationThreshold &&
      Math.abs(longitude - allowedLongitude) <= locationThreshold;

    if (!isLocationValid) {
      return res.status(400).json({ message: 'You are not at the correct location' });
    }

    connection.query('INSERT INTO attendance (checkin_time, user_id, isCheckedIn) VALUES (?, ?, 1)', [checkin_time, user.id], (err, result) => {
      if (err) {
        console.error('Error inserting check-in record:', err);
        return res.status(500).json({ message: 'Error updating check-in time' });
      }

      const newRowId = result.insertId;
      req.session.newRowId = newRowId;
      console.log('Check-in time recorded successfully');

      // Update isCheckedIn field using newRowId
      connection.query('UPDATE attendance SET isCheckedIn = ? WHERE user_id = ?', [1, newRowId], (err, result) => {
        if (err) {
          console.error('Error updating isCheckedIn:', err);
          return res.status(500).json({ message: 'Error updating isCheckedIn' });
        }

        console.log('isCheckedIn updated successfully');
        return res.status(200).json({ message: 'Check-in time recorded and isCheckedIn updated successfully' });
      });
    });
  } else {
    console.log('User not found in session');
    return res.status(400).json({ message: 'User not found in session' });
  }
});

// const port = process.env.PORT || 3000;
// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });


app.post("/checkout", (req, res) => {
  // Record check-out time
  const checkout_time = new Date();
  var user = req.session.g_user;
  var newRowId = req.session.newRowId;
  const { latitude, longitude } = req.body;

  if (!latitude || !longitude) {
    return res.status(400).json({ message: 'Latitude and longitude coordinates are required' });
  }

  // Verify the user's location here

  // const allowedLatitude = 40.7128;  // Example of WRONG latitude
  // const allowedLongitude = -74.0060; // Example of WRONG longitude
  // const locationThreshold = 0.1; // Example threshold

  const allowedLatitude = 23.9014395;  // Example of CORRECT latitude
  const allowedLongitude = 121.5455163; // Example of CORRECT longitude
  const locationThreshold = 0.1; // Example threshold

  const isLocationValid = Math.abs(latitude - allowedLatitude) <= locationThreshold &&
    Math.abs(longitude - allowedLongitude) <= locationThreshold;

  if (!isLocationValid) {
    return res.status(400).json({ message: 'You are not at the correct location' });
  }

  // Continue with checkout process
  connection.query('SELECT checkin_time FROM attendance WHERE user_id = ? AND DATE(checkin_time) = CURDATE()', [user.id], (err, result) => {
    if (err) {
      console.error('Error selecting checkin time: ', err);
      res.status(500).json({ message: 'Internal Server Error' });
      return;
    }

    if (result.length > 0) {
      const checkinTime = new Date(result[0].checkin_time);
      const checkoutTime = new Date();

      if (isNaN(checkinTime.getTime()) || isNaN(checkoutTime.getTime())) {
        console.error('Invalid checkin or checkout time');
        res.status(500).json({ message: 'Internal Server Error' });
        return;
      }

      // Calculate the number of hours worked
      const hoursWorked = Math.floor((checkoutTime - checkinTime) / 1000 / 60 / 60);
      connection.query('UPDATE attendance SET checkout_time = ?, isCheckedIn = 0, hours_worked = ? WHERE DATE(checkin_time) = DATE(?) AND user_id = ?', [checkoutTime, hoursWorked, checkinTime, user.id], (err, result) => {
        if (err) {
          console.error("Error updating check-out time: " + err.stack);
          res.status(500).json({ message: 'Error updating check-out time' });
          return;
        }
        console.log('Check-out time recorded successfully');
        res.status(200).json({ message: 'Check-out time recorded successfully' });
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
    res.render(__dirname + "/public/leave.ejs", { data: results });
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
  //user in session
  const user = req.session.g_user;
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
      let hours = Math.floor(results[i].hours_worked);
      let decimal = results[i].hours_worked % 1;
      let minutes = Math.round(decimal * 60);
      totalHoursWorked += hours + minutes / 60;
    }
    totalHoursWorked = totalHoursWorked.toFixed(2);
    // Render the page with attendance records and total hours worked
    res.setHeader('Content-Type', 'text/html');
    res.render(__dirname + "/public/records.ejs", { Name: user.Name, Surname: user.Surname, Email: user.Email, data: results, totalHoursWorked: totalHoursWorked });
  });
});


app.post('/update', (req, res) => {
  const { id, name, surname, email, department, phone, birthday, address } = req.body;

  const sql = `UPDATE employees SET Name = ?, Surname = ?, Email = ?, Phone = ?, Adress = ? WHERE id = ?`;

  connection.query(sql, [name, surname, email, department, phone, new Date(birthday), address, id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    } else {
      res.json({ success: true, message: 'Update successful' });
    }
  });
});

// Function to create a chart image
async function createAttendanceChart(attendanceData) {
  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: 800, height: 400 });
  const configuration = {
    type: 'line',
    data: {
      labels: attendanceData.map(record => record.date),
      datasets: [{
        label: 'Hours Worked',
        data: attendanceData.map(record => record.hours_worked),
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        fill: false
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  };

  return chartJSNodeCanvas.renderToBuffer(configuration);
}
app.get("/download-records", async (req, res) => {
  const myid = req.session.g_user.id;
  const name = req.session.g_user.Name;
  const sqlAttendance = `
    SELECT 
      DATE_FORMAT(checkin_time, "%Y-%m-%d") AS date, 
      checkin_time, 
      checkout_time, 
      IFNULL(hours_worked, 0) AS hours_worked
    FROM 
      attendance 
    WHERE 
      user_id = ? 
      AND MONTH(checkin_time) = MONTH(CURRENT_DATE())
      AND YEAR(checkin_time) = YEAR(CURRENT_DATE())
  `;
  const sqlEmployee = 'SELECT occupation FROM employees WHERE id = ?';

  try {
    // Query to select attendance records
    const [attendanceResults] = await connection.promise().query(sqlAttendance, [myid]);

    // Query to get employee occupation
    const [employeeResults] = await connection.promise().query(sqlEmployee, [myid]);
    const occupation = employeeResults[0].occupation;

    // Determine hourly pay rate based on occupation
    const payRates = {
      Manager: 50,
      Developer: 40,
      Designer: 35,
      Tester: 30,
      // Add more occupations and their respective pay rates as needed
    };
    const hourlyPayRate = payRates[occupation] || 10; // Default to 10 if occupation is not listed

    // Calculate total hours worked and salary
    let totalHoursWorked = 0;
    for (const record of attendanceResults) {
      totalHoursWorked += record.hours_worked;
    }
    const totalSalary = totalHoursWorked * hourlyPayRate;

    // Create a PDF document
    const doc = new PDFDocument({ margin: 30 });
    let filename = `${name}_salary_records.pdf`;
    filename = encodeURIComponent(filename);
    res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-type', 'application/pdf');

    doc.pipe(res);

    // Add some formal pay-slip information
    doc.fontSize(20).text('Pay Slip', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Name: ${name}`);
    doc.text(`Occupation: ${occupation}`);
    doc.text(`Hourly Pay Rate: $${hourlyPayRate}`);
    doc.moveDown();
    doc.text(`Total Hours Worked: ${totalHoursWorked}`);
    doc.text(`Total Salary: $${totalSalary}`);
    doc.moveDown();
    doc.text('Attendance Records:', { underline: true });

    // Define table properties
    const tableTop = doc.y + 20;
    const itemCodeX = 50;
    const descriptionX = 150;
    const quantityX = 300;
    const priceX = 450;

    // Draw table header
    doc.fontSize(12).text('Date', itemCodeX, tableTop);
    doc.text('Check-in Time', descriptionX, tableTop);
    doc.text('Check-out Time', quantityX, tableTop);
    doc.text('Hours Worked', priceX, tableTop);

    // Draw table rows
    attendanceResults.forEach((record, index) => {
      const y = tableTop + 25 + (index * 25);
      doc.fontSize(10).text(record.date, itemCodeX, y);
      doc.text(record.checkin_time, descriptionX, y);
      doc.text(record.checkout_time || 'N/A', quantityX, y);
      doc.text(record.hours_worked.toString(), priceX, y);
    });

    // Create and add the attendance graph
    const chartBuffer = await createAttendanceChart(attendanceResults);
    const chartImagePath = path.join(__dirname, 'attendance_chart.png');
    fs.writeFileSync(chartImagePath, chartBuffer);
    doc.addPage();
    doc.fontSize(20).text('Attendance Chart', { align: 'center' });
    doc.moveDown();
    doc.image(chartImagePath, { fit: [500, 300], align: 'center' });

    // Finalize the PDF and end the stream
    doc.end();

    // Clean up the temporary chart image file
    fs.unlinkSync(chartImagePath);

  } catch (error) {
    console.error('Error generating salary records PDF: ', error);
    res.status(500).send('Internal Server Error');
  }
});
// app.get("/download-records", (req, res) => {
//   const myid = req.session.g_user.id;
//   const name = req.session.g_user.Name;
//   const sql = 'SELECT checkin_time, checkout_time, hours_worked FROM attendance WHERE user_id = ?';

//   // Query to select all attendance records for the employee
//   connection.query(sql, [myid], function (error, results, fields) {
//     if (error) {
//       console.error('Error selecting attendance records: ', error);
//       res.status(500).send('Internal Server Error');
//       return;
//     }

//     // Create a new workbook
//     const workbook = new Excel.Workbook();
//     const worksheet = workbook.addWorksheet('Attendance Records');

//     // Add headers to the worksheet
//     worksheet.addRow(['Check-in Time', 'Check-out Time', 'Hours Worked']);

//     // Add attendance records to the worksheet
//     for (const record of results) {
//       worksheet.addRow([record.checkin_time, record.checkout_time, record.hours_worked]);
//     }

//     // Calculate total hours worked and salary
//     let totalHoursWorked = 0;
//     for (const record of results) {
//       totalHoursWorked += record.hours_worked;
//     }
//     const hourlyPayRate = 10; // Example hourly pay rate (you can replace it with your actual pay rate)
//     const totalSalary = totalHoursWorked * hourlyPayRate;

//     // Add total hours worked and salary to the worksheet
//     worksheet.addRow(['TOTAL Hours', '', totalHoursWorked]);
//     worksheet.addRow(['Total Salary', '', totalSalary]);

//     // Generate the Excel file
//     workbook.xlsx.writeBuffer().then(buffer => {
//       // Set response headers for file download
//       res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//       res.setHeader('Content-Disposition', `attachment; filename=${name}_records.xlsx`);

//       // Send the Excel file as a buffer
//       res.send(buffer);
//     }).catch(err => {
//       console.error('Error generating Excel file: ', err);
//       res.status(500).send('Internal Server Error');
//     });
//   });
// });



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
      //Send error response;
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

//SUGGESTIONS
app.post('/suggestions', (req, res) => {
  const suggestion = req.body.suggestion;

  // Insert suggestion into the database
  const query = 'INSERT INTO suggestions (suggestion) VALUES (?)';
  connection.query(query, [suggestion], (err, result) => {
    if (err) {
      console.error('Error inserting suggestion:', err);
      res.status(500).send({ success: false, message: 'Error inserting suggestion' });
      return;
    }
    //res.redirect('/thank-you.html'); // Redirect to a thank you page
    res.status(200);
    res.status(200).send({ success: true, message: 'Suggestion successfully inserted' });
    return;
  });
});

//GET SUGGESSIONS
app.get('/suggestions', (req, res) => {
  const query = 'SELECT * FROM suggestions';
  connection.query(query, (err, result) => {
    if (err) {
      console.error('Error retrieving suggestions:', err);
      res.status(500).send('Error retrieving suggestions');
      return;
    }
    res.json(result);
  });
});

app.post('/announcements', (req, res) => {
  const { title, content } = req.body;

  // Insert the announcement into the database
  const query = "INSERT INTO announcements (title, content) VALUES (?, ?)";
  connection.query(query, [title, content], (error, results, fields) => {
    if (error) {
      console.error('Error inserting announcement: ' + error.stack);
      res.status(500).json({ error: 'An error occurred while adding the announcement.' });
      return;
    }

    console.log('Announcement added successfully');
    res.sendStatus(201);
  });
});
// Assuming you have already set up your express app and MySQL connection

// Route to get announcements from the database
app.get('/announcements', (req, res) => {
  // Execute SQL query to select all announcements
  connection.query('SELECT * FROM announcements', (error, results, fields) => {
    if (error) {
      console.error('Error fetching announcements: ' + error.stack);
      res.status(500).json({ error: 'An error occurred while fetching announcements.' });
      return;
    }

    // Send the fetched announcements data to the client-side for rendering
    res.json(results);
  });
});
// Route to delete announcements from the database
app.delete('/announcements', (req, res) => {
  connection.query('DELETE FROM announcements', (error, results, fields) => {
    if (error) {
      console.error('Error deleting announcements: ' + error.stack);
      res.status(500).json({ error: 'An error occurred while deleting announcements.' });
      return;
    }

    console.log('Announcements deleted successfully');
    res.sendStatus(200);
  });
});
app.get('/getAttendanceData', (req, res) => {
  //user in session 
  const user = req.session.g_user.id;
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-11

  const sql = `
      SELECT (WEEK(STR_TO_DATE(checkin_time, '%Y-%m-%d %H:%i:%s'), 1) - WEEK(DATE_FORMAT(NOW() ,'%Y-%m-01'), 1) + 1) as week, COUNT(*) as days, SUM(IFNULL(TIMESTAMPDIFF(HOUR, STR_TO_DATE(checkin_time, '%Y-%m-%d %H:%i:%s'), COALESCE(STR_TO_DATE(checkout_time, '%Y-%m-%d %H:%i:%s'), STR_TO_DATE(checkin_time, '%Y-%m-%d %H:%i:%s'))), 0)) as hours
      FROM attendance
      WHERE MONTH(STR_TO_DATE(checkin_time, '%Y-%m-%d %H:%i:%s')) = ? AND user_id = ?
      GROUP BY week
  `;

  connection.query(sql, [currentMonth, user], (error, results) => {
    if (error) throw error;
    res.json(results);
  });
});



// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
open(`http://localhost:${port}`);
