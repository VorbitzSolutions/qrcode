let connection;
var oracledb = require('oracledb');

let libPath = process.env.HOME + '/Downloads/instantclient_19_8';
 oracledb.initOracleClient({ libDir: libPath });
 
(async function() {
try{
   connection = await oracledb.getConnection({
        user : 'admin',
        password : 'ceai!$KaPLs6ofTSR!{sD(=gPf',
        connectString : 'db20220507143506_high'
   });
   
   console.log("Successfully connected to Oracle!");
   
  // await connection.execute(`CREATE TABLE employees(id NUMBER, name VARCHAR2(50), email VARCHAR2(100) )`);
   
    const stmts = [
      `DROP TABLE employees`,

     `CREATE TABLE employees(name VARCHAR2(50), email VARCHAR2(100) )`
    ];

    for (const s of stmts) {
      try {
        await connection.execute(s);
      } catch (e) {
        if (e.errorNum != 942)
          console.error(e);
      }
    }
    
 const sqlQuery = `INSERT INTO employees VALUES (:1, :2)`;

binds = [ ["test001", "test001@email.com" ],
          ["test002", "test002@email.com" ],
          ["test003", "test003@email.com" ]];

    // For a complete list of options see the documentation.
    options = {
      autoCommit: true,
      // batchErrors: true,  // continue processing even if there are data errors
      bindDefs: [
        { type: oracledb.STRING, maxSize: 50 },
        { type: oracledb.STRING, maxSize: 20 }
      ]
    };

result = await connection.executeMany(sqlQuery, binds, options);

console.log("Number of inserted rows:", result.rowsAffected);

connection.execute(
      `SELECT *
       FROM employees`,
      [],
     function(err, result) {
        if (err) {
          console.error(err.message);
          return;
        }
        
        result.rows.forEach( (row) => {
			console.dir(row);
		} );
		
        console.log(result.rows);
          
     });
 
	await connection.execute('UPDATE employees SET email = :1 where email like :2 ', ['new@email.com', "test001@email.com"]);

	await connection.execute( 'DELETE FROM employees where name = :1',  ["test001"]);

 //
    // Query the data
    //

    sql = `SELECT * FROM employees`;

    binds = {};

    // For a complete list of options see the documentation.
    options = {
      outFormat: oracledb.OUT_FORMAT_OBJECT,   // query result format
      // extendedMetaData: true,               // get extra metadata
      // prefetchRows:     100,                // internal buffer allocation size for tuning
      // fetchArraySize:   100                 // internal buffer allocation size for tuning
    };

    result = await connection.execute(sql, binds, options);

    console.log("Metadata: ");
    console.dir(result.metaData, { depth: null });
    console.log("Query results: ");
    console.dir(result.rows, { depth: null });
    

    //
    // Show the date.  The value of ORA_SDTZ affects the output
    //
    sql = `SELECT TO_CHAR(CURRENT_DATE, 'DD-Mon-YYYY HH24:MI') AS CD FROM DUAL`;
    result = await connection.execute(sql, binds, options);
    console.log("Current date query results: ");
    console.log(result.rows[0]['CD']);
   
} catch(err) {
    console.log("Error: ", err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch(err) {
        console.log("Error when closing the database connection: ", err);
      }
    }
  }
})()