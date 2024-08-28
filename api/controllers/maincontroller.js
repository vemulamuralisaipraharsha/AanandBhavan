import { executeQueryAndCloseConnection } from '../db/dbutils.js';

export default (req, res) => {
  res.render('main');
  const query = "select * from property where current_status = 'Yes'";
  const count = 0; // Assuming count is defined elsewhere in your module
  const property_data = []; // Assuming property_data is defined elsewhere in your module
  const duplicate = []; // Assuming duplicate is defined elsewhere in your module
  
  executeQueryAndCloseConnection(query, res, "property", count, property_data, duplicate);
};
