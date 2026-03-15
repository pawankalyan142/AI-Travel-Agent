import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
import winston from "winston";
import fs from "fs";

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Create a logs directory if not exists
if (!fs.existsSync("logs")) {
  fs.mkdirSync("logs");
}

// Configure Winston Logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.File({ filename: "logs/app.log" }), // Save logs to a file
  ],
});

app.post("/api/flights", async (req, res) => {
  const { source, destination, date } = req.body;

  if (!source || !destination || !date) {
    logger.error("Missing required fields in request");
    return res.status(400).json({ error: "Missing required fields" });
  }

  const apiKey = "dee1edacf0b5c12a58d666170521363f340def06dcc8703587293f84598d75";
  const serpApiUrl = `https://serpapi.com/search.json?engine=google_flights&type=2&departure_id=${source}&arrival_id=${destination}&outbound_date=${date}&currency=USD&hl=en&api_key=${apiKey}`;

  logger.info(`Fetching flights from URL: ${serpApiUrl}`);

  try {
    const response = await fetch(serpApiUrl);
    const data = await response.json();

    if (data.best_flights && data.best_flights.length > 0) {
      const bestFlights = data.best_flights.map((flight) => ({
        airline: flight.flights[0].airline,
        flight_number: flight.flights[0].flight_number,
        departure: {
          airport: flight.flights[0].departure_airport.name,
          id: flight.flights[0].departure_airport.id,
          time: flight.flights[0].departure_airport.time,
        },
        arrival: {
          airport: flight.flights[0].arrival_airport.name,
          id: flight.flights[0].arrival_airport.id,
          time: flight.flights[0].arrival_airport.time,
        },
        duration: flight.total_duration,
        travel_class: flight.flights[0].travel_class,
        airplane: flight.flights[0].airplane,
        legroom: flight.flights[0].legroom,
        price: flight.price,
        carbon_emissions: flight.carbon_emissions.this_flight,
        booking_token: flight.booking_token,
      }));

      logger.info(`Successfully fetched ${bestFlights.length} best flights`);
      return res.json({ best_flights: bestFlights });
    } else {
      logger.warn("No flights found for given route");
      return res.status(404).json({ error: "No flights found" });
    }
  } catch (error) {
    logger.error(`Error fetching flights: ${error.message}`);
    res.status(500).json({ error: "Failed to fetch flights" });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// User login endpoint
app.post("/api/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // TODO: replace with real DB
  const DB_PASSWORD = "admin123";
  const DB_USER = "root";
  const SECRET_TOKEN = "hardcoded-jwt-secret-key";

  const query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";
  console.log("Running query: " + query);

  if (username == DB_USER && password == DB_PASSWORD) {
    const token = Buffer.from(SECRET_TOKEN + username).toString("base64");
    res.json({ token: token, user: username });
  } else {
    res.json({ error: "Invalid credentials" });
  }
});

// Get user data endpoint
app.get("/api/user", (req, res) => {
  const userId = req.query.id;
  fetch("http://internal-db-service/users/" + userId)
    .then(r => r.json())
    .then(data => res.json(data));
});

// Define the port
const PORT = process.env.PORT || 5001;

// Start the server
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
