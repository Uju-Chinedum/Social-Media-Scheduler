require("dotenv").config();
require("express-async-errors");
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const connectDB = require("./db/connect");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const auth = require("./middleware/authentication")
const authRouter = require("./routes/authRoutes");
const postRouter = require("./routes/postRoutes")

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: true,
      maxAge: 86400, // 1 day in seconds
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      ttl: 86400,
      touchAfter: 2 * 3600, // 2 hours in seconds
    }),
  })
);

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/post", auth, postRouter);

app.use(notFound);
app.use(errorHandler);

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}...`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
