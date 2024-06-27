const express = require('express');
const app = express ();
app.use(express.json());
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server Listening on PORT:", PORT);
  });

app.get("/status", (request, response) => {
    const status = {
       "Status": "Running"
    };
    
    response.send(status);
 });

 app.post('/edtData', function(request, response) {
    // req.file (singular) is the file
    console.log(request.body);
    const status = {"Status": "OK"};
    response.send(status);
});