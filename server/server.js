const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const Song = require('./models/Song');

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors()); 
app.use(express.json()); 
app.use(express.static(path.join(__dirname, '../public'))); 


const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is missing in your .env file!");
        }
        
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Successfully connected to MongoDB Atlas');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        process.exit(1); 
    }
};

app.get('/api/songs', async (req, res) => {
    try {
        const songs = await Song.find().select('-__v'); 
        
        if (songs.length === 0) {
            return res.status(404).json({ message: 'No songs found in the database.' });
        }
        
        res.status(200).json(songs);
    } catch (error) {
        console.error("Error fetching songs:", error);
        res.status(500).json({ error: 'Internal Server Error while fetching songs' });
    }
});

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server is running light and fast on http://localhost:${PORT}`);
    });
});