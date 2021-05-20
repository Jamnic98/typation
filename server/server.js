import express from 'express';
import cors from 'cors';

//TODO: import routes

// express configuration
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// TODO: use routes

export default app;
