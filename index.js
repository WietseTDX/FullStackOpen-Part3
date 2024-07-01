const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();

const MongoDB = require('./modules/PhoneBook');

const app = express();

app.use(express.static('dist'))
app.use(express.json());

morgan.token('req-body', (req, res) => {
  return JSON.stringify(req.body);
});
morgan.format('custom', ':method :url :status :res[content-length] - :response-time ms ":req-body"');

app.use(morgan('custom'));


const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    console.log(origin);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.get('/api/persons', (request, response) => {
  MongoDB.find({}).then((mongoData) => {
    response.json(mongoData);
  });
});

app.get('/api/persons/:id', (request, response, next) => {
  MongoDB.findById(request.params.id)
    .then((result) => {
      if (result) {
        response.status(200).json(result);
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => next(error));
});

app.delete('/api/persons/:id', (request, response, next) => {
  MongoDB.findByIdAndDelete(request.params.id)
    .then((result) => {
      if (result) {
        response.status(200).json(result);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.put('/api/persons/:id', (request, response) => {
  const body = request.body;

  MongoDB.findByIdAndUpdate(request.params.id, body, { new: true, runValidators: true })
    .then((result) => {
      response.status(200).json(body);
    })
    .catch((error) => {
      if (error.name == "ValidationError") {
        const errors = Object.values(error.errors);
        for (const err of errors) {
          if (err.path == "name" && err.kind == "minlength") {
            return response.status(400).send({ error: "Name must be at leased 3 chars long" });
          } else if (err.path == "number" && err.kind == "user defined") {
            return response.status(400).send({ error: "The number must be a total of 8 digits and 2-3 digits before -" });
          }
        }
      }
    });
});


app.post('/api/persons', (request, response, next) => {
  const body = request.body;

  if (!body.name && !body.number) {
    return response.status(400).json({
      error: 'content missing'
    });
  }

  MongoDB.create({
    name: body.name,
    number: body.number
  }).then((SetPerson) => {
    response.json(SetPerson)
  }).catch((error) => {
      if (error.name == "ValidationError") {
        const errors = Object.values(error.errors);
        for (const err of errors) {
          if (err.path == "name" && err.kind == "minlength") {
            return response.status(400).send({ error: "Name must be at leased 3 chars long" });
          } else if (err.path == "number" && err.kind == "user defined") {
            return response.status(400).send({ error: "The number must be a total of 8 digits and 2-3 digits before -" });
          }
        }
      }
    });
});

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name == "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name == "BSONError") {
    return response.status(400).send({ error: "id must be 24 chars" });
  }

  next(error)
}

app.get('/info', (request, response) => {
  MongoDB.find({}).then((mongoData) => {
    var datetime = new Date();
    const infoData = `
  <div>
  <div>
  <p>Phonebook has records for ${mongoData.length} ${mongoData.length === 1 ? 'person' : 'people'}</p>
  </div>
  <div>${datetime.toString()}</div>
  </div>
  `;

    response.send(infoData);
  });
});


app.use(errorHandler);

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
}

app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
