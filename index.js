const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();
require('dotenv').config({ path: '.env.local' });
const app = express();

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

app.use(express.static('dist'))

let persons = [
  {
    "id": "1",
    "name": "Arto Hellas",
    "number": "040-123456"
  },
  {
    "id": "2",
    "name": "Ada Lovelace",
    "number": "39-44-5323523"
  },
  {
    "id": "3",
    "name": "Dan Abramov",
    "number": "12-43-234345"
  },
  {
    "id": "4",
    "name": "Mary Poppendieck",
    "number": "39-23-6423122"
  }
];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

app.get('/api/persons', (request, response) => {
  response.json(persons);
});

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id;
  console.log(persons);
  console.log(id);
  const person = persons.find(person => person.id === id);

  if (person) {
    response.status(200).json(person);
  } else {
    response.status(404).end();
  }

});

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id;
  const personIndex = persons.findIndex(person => person.id === id);

  if (personIndex !== -1) {
    const deletedPerson = persons[personIndex];
    persons = persons.filter(person => person.id !== id);
    response.status(200).json(deletedPerson);
  } else {
    response.status(404).json({ message: 'Person not found' });
  }
});

app.put('/api/persons/:id', (request, response) => {
  const id = request.params.id;
  const body = request.body;

  persons = persons.map((person) =>
    person.id !== id ? person : body
  )

  response.status(200).json(body);
});


app.post('/api/persons', (request, response) => {
  const body = request.body;

  if (!body.name && !body.number) {
    return response.status(400).json({
      error: 'content missing'
    });
  } else if (persons.some(person => person.name === body.name)) {
    return response.status(400).json({
      error: 'name must be unique'
    });
  }

  const person = {
    name: body.name,
    number: body.number,
    id: getRandomInt(0, 65535).toString(),
  };

  persons = persons.concat(person);

  response.json(person);
});

app.get('/info', (request, response) => {
  var datetime = new Date();
  const infoData = `
  <div>
  <div>
  <p>Phonebook has records for ${persons.length} ${persons.length === 1 ? 'person' : 'people'}</p>
  </div>
  <div>${datetime.toString()}</div>
  </div>
  `;

  response.send(infoData);
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
}

app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
