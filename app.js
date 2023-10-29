const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const path = require("path");

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

//initializing DataBase

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (e) {
    consloe.log(`Db Error:${e.message}`);
  }
};

initializeDbAndServer();

//requestQuery functions
const hasPriorityAndStatusProperties = (requestQuery) => {
  return requestQuery.priority != undefined && requestQuery.status != undefined;
};

const hasPriorityProperties = (requestQuery) => {
  return requestQuery.priority != undefined;
};

const hasStatusProperties = (requestQuery) => {
  return requestQuery.status != undefined;
};

//API 1
app.get("/todos/", async (request, response) => {
  let data = null;
  let getQuery = "";
  const { search_q = "", status, priority } = request.query;
  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      getQuery = `
        SELECT * FROM todo
        WHERE todo LIKE '%${search_q}%'
        AND priority = '${priority}'
        AND status = '${status}';`;
      break;

    case hasPriorityProperties(request.query):
      getQuery = `
        SELECT * FROM todo
        WHERE
        todo LIKE '%${search_q}%' AND
        priority = '${priority}';`;
      break;

    case hasStatusProperties(request.query):
      getQuery = `
        SELECT * FROM todo
        WHERE todo LIKE '%${search_q}%'
        AND status = '${status}';`;
      break;
    default:
      getQuery = `
        SELECT * FROM todo
        WHERE todo LIKE '%${search_q}%';`;
  }
  data = await db.all(getQuery);
  response.send(data);
});

//API 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getQuery = `SELECT * FROM todo
     WHERE id = ${todoId};`;
  const dbResponse = await db.get(getQuery);
  response.send(dbResponse);
});

//API 3
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const getQuery = `INSERT INTO todo(id, todo, priority, status)
        VALUES(${id},'${todo}', '${priority}', '${status}');`;
  await db.run(getQuery);
  response.send("Todo Successfully Added");
});

//API 4
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { status, priority, todo } = request.body;
  if (status != undefined) {
    const getQuery = `UPDATE todo
        SET status = '${status}'
        WHERE id = ${todoId};`;
    await db.run(getQuery);
    response.send("Status Updated");
  } else if (priority != undefined) {
    const getQuery = `UPDATE todo
        SET priority = '${priority}'
        WHERE id = ${todoId};`;
    await db.run(getQuery);
    response.send("Priority Updated");
  } else if (todo != undefined) {
    const getQuery = `UPDATE todo
        SET todo = '${todo}'
        WHERE id = ${todoId};`;
    await db.run(getQuery);
    response.send("Todo Updated");
  }
});

//API 5
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getQuery = `
    DELETE FROM todo
    WHERE id = ${todoId};`;
  await db.run(getQuery);
  response.send("Todo Deleted");
});

module.exports = app;
