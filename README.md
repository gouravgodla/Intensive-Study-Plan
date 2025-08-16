# Intensive Study Plan Dashboard

This is a full-stack, single-page application designed to help users manage an intensive study schedule. It provides an interactive, Notion-inspired dashboard to visualize daily schedules, track study topics, and manage daily tasks. The application is built with a vanilla JavaScript frontend and a Node.js/Express backend, using MongoDB for data persistence.

---

## Features

- **Interactive Schedules:**

  - View and manage separate schedules for weekdays and weekends.
  - Click "Edit" to open a modal and modify the time, description, and category for any schedule block.
  - All schedule changes are saved to the database.

- **Dynamic Topic Database:**

  - Add new study topics with a title and a subject (category).
  - Update the status of any topic (`Not Started`, `In Progress`, `Completed`).
  - Filter the topic view by subject.
  - Delete topics individually.

- **Subject Management:**

  - Add new custom subjects (e.g., "System Design," "History").
  - Delete subjects, which also removes all associated topics.
  - The subject list dynamically updates all relevant UI components, including filters and dropdowns.

- **Daily Checklist:**

  - A persistent daily checklist to track your tasks.
  - Mark tasks as complete with a satisfying strikethrough effect.
  - Delete individual tasks.
  - Reset the checklist to its default state with a single click.

- **Visual Breakdown:**
  - An interactive doughnut chart that provides a visual breakdown of the number of topics per subject.
  - The chart automatically updates as you add or delete subjects and topics.

---

## Technology Stack

- **Frontend:**

  - HTML5
  - Tailwind CSS (for styling)
  - Vanilla JavaScript (for all logic and API communication)
  - Chart.js (for the "Breakdown" visualization)

- **Backend:**

  - Node.js
  - Express.js (for the server and API routes)
  - Mongoose (for interacting with the MongoDB database)
  - `dotenv` (for managing environment variables)

- **Database:**
  - MongoDB (managed locally or with MongoDB Atlas for deployment)

---

## Project Setup and Installation

To run this project locally, you will need Node.js and MongoDB installed on your machine.

**1. Clone the Repository:**

```bash
git clone <your-repository-url>
cd study-dashboard
```

**2. Install Dependencies:**
Navigate to the project's root directory (where `package.json` is located) and run:

```bash
npm install
```

**3. Set Up Environment Variables:**

- Create a file named `.env` in the project's root directory.
- Add your MongoDB connection string to this file:
  ```
  MONGO_URI=mongodb://localhost:27017/studyDashboard
  ```

**4. Run the Application:**
You need to have three terminals open and running simultaneously.

- **Terminal 1: Start the Database**

  ```bash
  mongod
  ```

- **Terminal 2: Start the Backend Server**

  ```bash
  node api/index.js
  ```

  You should see the message `MongoDB Connected...` in this terminal.

- **Terminal 3 (Optional): Use Live Server**
  For the best development experience, use the "Live Server" extension in VS Code. Right-click on the `public/index.html` file and select "Open with Live Server".

---

## Deployment to Vercel

This project is configured for easy deployment to Vercel.

1.  **Set Up a Cloud Database:**

    - Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
    - Get your connection string and replace `<password>` with your database password. Make sure to add your database name (e.g., `studyDashboard`) to the string.

2.  **Push to GitHub:**
    Ensure your project, with the `api` and `public` folders and the `vercel.json` file, is pushed to a GitHub repository.

3.  **Import to Vercel:**

    - Connect your Vercel account to GitHub and import the project repository.
    - In the project settings, go to **Environment Variables**.
    - Create a variable named `MONGO_URI` and paste your MongoDB Atlas connection string as the value.

4.  **Deploy:**
    Vercel will automatically build and deploy the project.

---

## API Endpoints

All API routes are prefixed with `/api`.

| Method   | Endpoint           | Description                                  |
| :------- | :----------------- | :------------------------------------------- |
| `GET`    | `/schedules/:type` | Get the schedule for `weekday` or `weekend`. |
| `PUT`    | `/schedules/:type` | Update a schedule.                           |
| `GET`    | `/categories`      | Get all subjects.                            |
| `POST`   | `/categories`      | Add a new subject.                           |
| `DELETE` | `/categories/:id`  | Delete a subject and its topics.             |
| `GET`    | `/topics`          | Get all topics.                              |
| `POST`   | `/topics`          | Add a new topic.                             |
| `PATCH`  | `/topics/:id`      | Update a topic's status.                     |
| `DELETE` | `/topics/:id`      | Delete a topic.                              |
| `GET`    | `/checklist`       | Get all checklist items.                     |
| `POST`   | `/checklist/reset` | Reset the checklist to its default state.    |
| `PATCH`  | `/checklist/:id`   | Update a checklist item's status.            |
| `DELETE` | `/checklist/:id`   | Delete a checklist item.                     |
