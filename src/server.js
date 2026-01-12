import app from "./app.js";
// import env from "./config/env.js";
import connectDB from "./database/connection.js";

await connectDB();
// changed to work with vercel serverless
// async function startServer() {

//   app.listen(env.APP.PORT, "0.0.0.0", () => {
//     console.log(`Server running on port ${env.APP.PORT}`);
//   });
// }

// startServer();

export default app;
