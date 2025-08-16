const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// --- Connect to MongoDB ---
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/studyDashboard';
mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));

// --- Define Schemas and Models ---
const topicSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String, required: true },
    status: { type: String, default: 'Not Started' },
});
const Topic = mongoose.model('Topic', topicSchema);

const checklistItemSchema = new mongoose.Schema({
    text: { type: String, required: true },
    completed: { type: Boolean, default: false },
});
const ChecklistItem = mongoose.model('ChecklistItem', checklistItemSchema);

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
});
const Category = mongoose.model('Category', categorySchema);

const scheduleItemSchema = new mongoose.Schema({
    type: { type: String, required: true, enum: ['weekday', 'weekend'] },
    time: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    isWarning: { type: Boolean, default: false },
    isSuccess: { type: Boolean, default: false },
    order: { type: Number, required: true },
});
const ScheduleItem = mongoose.model('ScheduleItem', scheduleItemSchema);


// --- API Routes for Schedules ---
app.get('/api/schedules/:type', async (req, res) => {
    try {
        const count = await ScheduleItem.countDocuments();
        if (count === 0) {
            // If the collection is empty, populate it with initial data
            const initialSchedules = getInitialSchedules();
            await ScheduleItem.insertMany(initialSchedules);
        }
        const schedule = await ScheduleItem.find({ type: req.params.type }).sort('order');
        res.json(schedule);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.put('/api/schedules/:type', async (req, res) => {
    const { type } = req.params;
    const items = req.body;
    try {
        // Use a transaction to ensure atomicity
        const session = await mongoose.startSession();
        session.startTransaction();
        await ScheduleItem.deleteMany({ type }, { session });
        const itemsToInsert = items.map((item, index) => ({ ...item, type, order: index }));
        await ScheduleItem.insertMany(itemsToInsert, { session });
        await session.commitTransaction();
        session.endSession();

        const newSchedule = await ScheduleItem.find({ type }).sort('order');
        res.json(newSchedule);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


// --- API Routes for Categories ---
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/categories', async (req, res) => {
    const newCategory = new Category({ name: req.body.name });
    try {
        const savedCategory = await newCategory.save();
        res.status(201).json(savedCategory);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.delete('/api/categories/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });

        await Topic.deleteMany({ category: category.name });
        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: 'Category and associated topics deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// --- API Routes for Topics ---
app.get('/api/topics', async (req, res) => {
    try {
        const topics = await Topic.find();
        res.json(topics);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/topics', async (req, res) => {
    const newTopic = new Topic({
        title: req.body.title,
        category: req.body.category,
        status: 'Not Started'
    });
    try {
        const savedTopic = await newTopic.save();
        res.status(201).json(savedTopic);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.patch('/api/topics/:id', async (req, res) => {
    try {
        const updatedTopic = await Topic.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        res.json(updatedTopic);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.delete('/api/topics/:id', async (req, res) => {
    try {
        const deletedTopic = await Topic.findByIdAndDelete(req.params.id);
        if (!deletedTopic) return res.status(404).json({ message: 'Topic not found' });
        res.json({ message: 'Topic deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// --- API Routes for Checklist ---
app.get('/api/checklist', async (req, res) => {
    try {
        const items = await ChecklistItem.find();
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.patch('/api/checklist/:id', async (req, res) => {
    try {
        const updatedItem = await ChecklistItem.findByIdAndUpdate(req.params.id, { completed: req.body.completed }, { new: true });
        res.json(updatedItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.delete('/api/checklist/:id', async (req, res) => {
    try {
        const deletedItem = await ChecklistItem.findByIdAndDelete(req.params.id);
        if (!deletedItem) return res.status(404).json({ message: 'Checklist item not found' });
        res.json({ message: 'Checklist item deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/checklist/reset', async (req, res) => {
    try {
        await ChecklistItem.deleteMany({});
        const initialChecklist = [
            { text: "Complete 2 DSA problems", completed: false },
            { text: "Review Aptitude concepts", completed: false },
            { text: "Code for 1 hour on project", completed: false },
            { text: "Plan tomorrow's study blocks", completed: false },
        ];
        await ChecklistItem.insertMany(initialChecklist);
        res.status(200).json({ message: 'Checklist reset successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

const PORT = 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

function getInitialSchedules() {
    return [
        // Weekday
        { type: 'weekday', order: 0, time: "5:00 AM - 5:15 AM", description: "Wake Up & Prepare", category: "personal" },
        { type: 'weekday', order: 1, time: "5:15 AM - 7:15 AM (2h)", description: "Study Block 1: DSA", category: "dsa" },
        { type: 'weekday', order: 2, time: "7:15 AM - 8:15 AM (1h)", description: "Study Block 2: Aptitude (Part 1)", category: "aptitude" },
        { type: 'weekday', order: 3, time: "8:15 AM - 9:00 AM", description: "Breakfast & Commute", category: "personal" },
        { type: 'weekday', order: 4, time: "9:00 AM - 5:00 PM (8h)", description: "Class Time", category: "class" },
        { type: 'weekday', order: 5, time: "5:00 PM - 6:30 PM", description: "Commute Home & Dinner", category: "personal" },
        { type: 'weekday', order: 6, time: "6:30 PM - 10:30 PM (4h)", description: "Study Block 3: Development", category: "dev" },
        { type: 'weekday', order: 7, time: "10:30 PM - 11:30 PM (1h)", description: "Study Block 4: Aptitude (Part 2)", category: "aptitude" },
        { type: 'weekday', order: 8, time: "11:30 PM - 5:00 AM", description: "Sleep (5 hours)", category: "personal", isWarning: true },
        // Weekend
        { type: 'weekend', order: 0, time: "8:00 AM - 9:00 AM", description: "Wake Up & Breakfast", category: "personal" },
        { type: 'weekend', order: 1, time: "9:00 AM - 1:00 PM (4h)", description: "Morning Study: Development", category: "dev" },
        { type: 'weekend', order: 2, time: "1:00 PM - 2:00 PM", description: "Lunch Break", category: "personal" },
        { type: 'weekend', order: 3, time: "2:00 PM - 4:00 PM (2h)", description: "Afternoon Study: DSA", category: "dsa" },
        { type: 'weekend', order: 4, time: "4:00 PM - 6:00 PM (2h)", description: "Afternoon Study: Aptitude", category: "aptitude" },
        { type: 'weekend', order: 5, time: "6:00 PM onwards", description: "Critical Free Time & Recovery", category: "personal", isSuccess: true },
        { type: 'weekend', order: 6, time: "11:00 PM", description: "Sleep (Aim for 8-9 hours)", category: "personal" }
    ];
}
