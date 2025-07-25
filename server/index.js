import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { ResultService } from './resultService.js';

// Load environment variables
dotenv.config();

const app = express();

// MongoDB Atlas connection
const connectDB = async () => {
    try {
        // Replace with your MongoDB Atlas connection string
        const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/result_cache?retryWrites=true&w=majority';
        
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Atlas connected successfully');
    } catch (error) {
        console.error('MongoDB Atlas connection error:', error);
        process.exit(1);
    }
};

// Connect to MongoDB
connectDB();

app.use(cors(
   {
    origin: ['https://result-gray-five.vercel.app','localhost:3000']
   }
));

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.post('/results', async (req, res) => {
    try {
        const formData = req.body;
        console.log('Request for:', formData);
        
        // Use ResultService for caching logic
        const data = await ResultService.getResults(formData);
        
        res.json(data);
    } catch (error) {
        console.error('Error in /results endpoint:', error);
        res.status(500).json({ 
            error: 'Failed to fetch results',
            message: error.message 
        });
    }
});

// Additional endpoint to clear cache if needed
app.delete('/cache', async (req, res) => {
    try {
        const formData = req.body;
        await ResultService.clearBatchCache(formData);
        res.json({ message: 'Cache cleared successfully' });
    } catch (error) {
        console.error('Error clearing cache:', error);
        res.status(500).json({ 
            error: 'Failed to clear cache',
            message: error.message 
        });
    }
});

app.listen(process.env.PORT || 8000, () => {
    console.log(`Server is running on port ${process.env.PORT || 8000}`)
});