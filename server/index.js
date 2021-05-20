import app from './server.js';
import dotenv from 'dotenv';
dotenv.config();

// constants
const PORT = process.env.PORT || 8080;
console.log(process.env.PORT);

app.listen(PORT, console.log(`Server listening on port: ${PORT}`));
