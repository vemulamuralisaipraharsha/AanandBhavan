import { fetchDataFromDatabase } from "../db/dbFunctions.js";

function forget(req, res) {
  res.render("contact");
}

function forpost(req, res) {
  let query = `insert into contactus values ('${req.body.data}' , '${req.body.email}' , '${req.body.message}');`;
  fetchDataFromDatabase(query)
    .then(() => {
      res.status(200).json(req.body);
    })
    .catch((error) => {
      console.error("Error executing query:", error);
      res.status(500).json({ error: "Internal Server Error" });
    });
}

export { forget, forpost };
