import { fetchDataFromDatabase } from "../db/dbFunctions.js";

let id_data;
let agent_id;
let fetch;

function setData(data) {
  id_data = data;
  agent_id = data;
}

async function forget(req, res) {
  let query = `select property_id, no_of_bedrooms, property_type, rent_sell, current_status , agent_id from property where agent_id = ${id_data};`;
  try {
    fetch = await fetchDataFromDatabase(query);
    res.render("agentproperty", { fetch });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function forpost(req, res) {
  let property_id = req.body.property_id;
  let query = `select property_id , no_of_bedrooms , property_type , rent_sell , current_status from property where property_id = ${property_id};`;
  try {
    fetch = await fetchDataFromDatabase(query);
    res.send(fetch);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function forpopup(req, res) {
  let adding_data = req.body;
  let property_count;

  let count_query = "select count(property_id) as count from property;";
  try {
    property_count = await fetchDataFromDatabase(count_query);
  } catch (error) {
    console.log(error);
  }

  try {
    // Replace 'query' with the actual query you want to execute for 'forpopup'
    await fetchDataFromDatabase(query);
    res.send({ data: "fine" });
  } catch (error) {
    console.log(error.message);
    if (error.message === "Foreign key constraint failed") {
      res.send({ data: "foreign_key_constraint_failed" });
    } else {
      res.send({ data: "notfine" });
    }
  }
}

export { forget, setData, forpost, forpopup };
