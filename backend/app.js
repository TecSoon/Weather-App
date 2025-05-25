const dotenv = require('dotenv');
dotenv.config({ path: process.env.NODE_ENV === 'development' ? '.env.local' : '.env' });

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const swaggerDocument = YAML.load('./openapi.yaml');

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies

app.get('/', (req, res)=>{
    res.status(200);
    res.send("Health Check: Server is running!");
});

app.get('/weather/average', require('./routes/weather'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(PORT, (error) =>{
    if(!error)
        console.log("App is listening on port "+ PORT)
    else 
        console.log("Error occurred, server can't start", error);
    }
);

module.exports = app;
