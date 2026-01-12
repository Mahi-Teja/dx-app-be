import app from "./app.js";
import connectDB from "./database/connection.js";

await connectDB();

export default app;
