const express = require("express");
const app = express();
const fs = require("fs");
const users = require("./MOCK_DATA.json");
const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server started at ap Port ${PORT}`);
});

// Middleware - plugin
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  fs.appendFile(
    "log.txt",
    `${Date.now()}: ${req.method}: ${req.path}\n`,
    (err, data) => {
      next();
    }
  );
});

// Routes

app.get("/api/users", (req, res) => {
  res.setHeader("X-myName", " Anaintay"); //custom haeder
  return res.json(users);
});

app.get("/users", (req, res) => {
  const html = `
    
    <ul>
    
    ${users.map((user) => `<li>${user.id}</li>`).join("")}
    
    </ul>
    `;
  res.send(html);
});

app.route("/api/users/:id").get((req, res) => {
  const id = Number(req.params.id);
  const user = users.find((user) => user.id === id);
  return res.json(user);
});

app
  .route("/api/users/:id")
  .get((req, res) => {
    const id = Number(req.params.id);
    const user = users.find((user) => user.id === id);
    return res.json(user);
  })
  .put((req, res) => {
    const userId = Number(req.params.id);
    const index = users.findIndex((user) => user.id === userId);

    if (index === -1) {
      return res
        .status(404)
        .json({ error: `User Not Found With ID ${userId}` });
    }

    // Update user data
    const updatedUser = {
      id: userId,
      // You can update any properties here based on req.body
      ...users[index],
      ...req.body,
    };

    // Update the user in the users array
    users[index] = updatedUser;

    // Write the updated user data back to the file
    fs.writeFile("./MOCK_DATA.json", JSON.stringify(users), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      return res.json({
        status: "User updated successfully",
        user: updatedUser,
      });
    });
  });

// .put((req, res) => {
//   //Edit User
//   return res.json({ status: "pendding" });
// });

app.delete("/api/users/:id", (req, res) => {
  const userId = Number(req.params.id);
  const index = users.findIndex((user) => user.id === userId);

  if (index === -1) {
    return res.status(404).json({ error: `User Not Found With ID ${userId}` });
  }

  users.splice(index, 1);

  fs.writeFile("./MOCK_DATA.json", JSON.stringify(users), (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    return res.status(204).send();
  });
});

app.post("/api/users", (req, res) => {
  // Todo Create Now User

  const body = req.body;
  users.push({ ...body, id: users.length + 1 });
  fs.writeFile("./MOCK_DATA.json", JSON.stringify(users), (err, data) => {
    return res.json({ status: "Done User Created", id: users.length });
  });
});
