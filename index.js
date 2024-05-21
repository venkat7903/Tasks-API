const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

const dbPath = path.join(__dirname, "task.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3001, () => {
      console.log("Server is running at http://localhost:3001");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
  }
};

initializeDBAndServer();

// Get Todos API
app.get("/tasks/", async (req, res) => {
  const { search_q = "" } = req.query;
  const getTodosQuery = `
    SELECT * FROM task WHERE name LIKE '%${search_q}%';
    `;
  const tasksArray = await db.all(getTodosQuery);
  res.send(tasksArray);
});

//Add Todos API
app.post("/tasks/", async (req, res) => {
  const { name, description, status, deadline } = req.body;
  const addTodoQuery = `
    INSERT INTO task(name, description, status, deadline)
    VALUES ('${name}', '${description}', '${status}', '${deadline}');
    `;
  const dbResponse = await db.run(addTodoQuery);
  res.send({
    taskId: dbResponse.lastID,
    message: `Task Created with id ${dbResponse.lastID}`,
  });
});

// Update Task API
app.put("/tasks/:taskId", async (req, res) => {
  const { taskId } = req.params;
  const getTaskQuery = `
    SELECT * FROM task WHERE id=${taskId};
    `;
  const dbTask = await db.get(getTaskQuery);

  const {
    name = dbTask.name,
    description = dbTask.description,
    status = dbTask.status,
    deadline = dbTask.deadline,
  } = req.body;

  const updateTaskQuery = `
    UPDATE task
    SET 
        name='${name}',
        description='${description}',
        status='${status}',
        deadline='${deadline}'
    WHERE 
        id=${taskId};
  `;
  await db.run(updateTaskQuery);
  res.send({ message: "Task is updated successfully" });
});

// Delete Task API
app.delete("/tasks/:taskId", async (req, res) => {
  const { taskId } = req.params;
  const deleteTaskQuery = `
    DELETE FROM task
    WHERE id=${taskId};
  `;
  await db.run(deleteTaskQuery);
  res.send({ message: "Task Deleted Successfully" });
});