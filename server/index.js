const express = require('express');
const fs = require('fs');

const app = express ();
app.use(express.json());
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server Listening on PORT:", PORT);
  });

var counter = 0;
app.get("/status", (request, response) => {
    console.log("GET /status");
    const status = {
       "Status": "Running"
    };
    
    response.send(status);
 });

 app.post('/edtData', function(request, response) {
    // req.file (singular) is the file
    console.log(request.body);
    counter++;
    var file_name = "./data/edtData_"+counter+"_"+Date.now()+".json";
    console.log(file_name);
    fs.writeFile(file_name, JSON.stringify(request.body), async(err) => {
        if (err) {
            console.error(err);
          } else {
            console.log("Successfully Written to File.");
          }
      });
    const status = {"Status": "OK"};
    response.send(status);
});