import pool from './dbConnector.js';

function fetchDataFromDatabase(query) {
  return new Promise((resolve, reject) => {
    pool.query(query, (error, results, fields) => {
      if (error) {
        // Check if it's a foreign key constraint failure
        if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.code === 'ER_NO_REFERENCED_ROW') {
          reject(new Error('Foreign key constraint failed'));
        } else {
          // Handle other types of errors
          reject(new Error(`Database query error: ${error.message}`));
        }
      } else {
        resolve(results);
      }
    });
  });
}

export { fetchDataFromDatabase };
