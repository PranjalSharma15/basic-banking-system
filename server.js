const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/basic_banking_system', {
  
});

const CustomerSchema = new mongoose.Schema({
  name: String,
  email: String,
  balance: Number
});
const TransferSchema = new mongoose.Schema({
  from: String,
  to: String,
  amount: Number,
  date: { type: Date, default: Date.now }
});

const Customer = mongoose.model('Customer', CustomerSchema);
const Transfer = mongoose.model('Transfer', TransferSchema);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Home Page
app.get('/', async (req, res) => {
  const customers = await Customer.find();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// View Customer
app.get('/view/:id', async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) return res.status(404).send('Customer not found');
  res.sendFile(path.join(__dirname, 'public', 'view.html'));
});

// Transfer Money
app.get('/transfer', async (req, res) => {
  const fromId = req.query.from;
  const customers = await Customer.find();
  res.sendFile(path.join(__dirname, 'public', 'transfer.html'));
});

app.post('/transfer', async (req, res) => {
  const { fromId, toId, amount } = req.body;
  const fromCustomer = await Customer.findById(fromId);
  const toCustomer = await Customer.findById(toId);

  if (fromCustomer.balance >= amount) {
    fromCustomer.balance -= amount;
    toCustomer.balance += amount;

    await fromCustomer.save();
    await toCustomer.save();

    const transfer = new Transfer({
      from: fromCustomer.name,
      to: toCustomer.name,
      amount
    });
    await transfer.save();

    res.redirect('/');
  } else {
    res.send('Insufficient balance.');
  }
});

// API to fetch customer data
app.get('/api/customers', async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/customers/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (customer) {
      res.json(customer);
    } else {
      res.status(404).json({ message: 'Customer not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
