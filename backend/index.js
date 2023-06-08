import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import connectDB from './mongodb/connect.js';
import postRoutes from './routes/postRoutes.js';
import toPDFRoute from './routes/toPDFRoute.js';
import processingRoutes from './routes/processingRoutes.js';


dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
// app.use(express.json({ limit: '50mb' }));

app.use('/api/v1/post', postRoutes);
app.use('/api/v1/toPDF', toPDFRoute);
app.use('/api/v1/processing', processingRoutes);

app.get('/', async (req, res) => {
  res.status(200).json({
    message: 'Hello from IdigiZen!',
  });
});

const startServer = async () => {
  try {
    connectDB(process.env.MONGODB_URL);
    app.listen(8080, () => console.log('Server started on port 8080'));
  } catch (error) {
    console.log(error);
  }
};

startServer();