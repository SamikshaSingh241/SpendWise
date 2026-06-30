const Expense = require('../models/Expense');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');

const rates = { INR: 1, USD: 0.012, EUR: 0.011, GBP: 0.0095 };
const symbols = { INR: 'Rs.', USD: '$', EUR: '€', GBP: '£' };

const generateCsvReport = async (req, res) => {
  const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 });
  
  if (!expenses || expenses.length === 0) {
    return res.status(404).json({ message: 'No expenses found' });
  }

  const reqCurrency = req.query.currency || 'INR';
  const rate = rates[reqCurrency] || 1;

  const fields = ['amount', 'category', 'description', 'date'];
  const opts = { fields };
  
  try {
    const formattedExpenses = expenses.map(exp => ({
      ...exp._doc,
      amount: (exp.amount * rate).toFixed(2)
    }));
    const parser = new Parser(opts);
    const csv = parser.parse(formattedExpenses);
    res.header('Content-Type', 'text/csv');
    res.attachment('expenses.csv');
    return res.send(csv);
  } catch (err) {
    res.status(500).json({ message: 'Error generating CSV' });
  }
};

const generatePdfReport = async (req, res) => {
  const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 });

  if (!expenses || expenses.length === 0) {
    return res.status(404).json({ message: 'No expenses found' });
  }

  const reqCurrency = req.query.currency || 'INR';
  const rate = rates[reqCurrency] || 1;
  const symbol = symbols[reqCurrency] || 'Rs.';

  const doc = new PDFDocument();
  let filename = 'expenses.pdf';
  
  res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
  res.setHeader('Content-type', 'application/pdf');
  
  doc.pipe(res);
  doc.fontSize(20).text('Expense Report', { align: 'center' });
  doc.moveDown();

  let total = 0;
  expenses.forEach(exp => {
    total += exp.amount;
    const convertedAmount = (exp.amount * rate).toFixed(2);
    doc.fontSize(12).text(`Date: ${new Date(exp.date).toLocaleDateString()} - Category: ${exp.category} - Amount: ${symbol}${convertedAmount}`);
    if (exp.description) {
      doc.fontSize(10).text(`Description: ${exp.description}`, { indent: 20 });
    }
    doc.moveDown(0.5);
  });

  doc.moveDown();
  const convertedTotal = (total * rate).toFixed(2);
  doc.fontSize(14).text(`Total Spending: ${symbol}${convertedTotal}`);

  doc.end();
};

module.exports = { generateCsvReport, generatePdfReport };
