const { test } = require('node:test');
const assert = require('node:assert');
const { CustomerHealthScoreEngine } = require('../src/index.js');

test('CustomerHealthScoreEngine: scores thriving account with high engagement', () => {
  const engine = new CustomerHealthScoreEngine();
  const res = engine.scoreAccount({
    accountId: '1',
    accountName: 'Titan Enterprise',
    usageRate: 95,
    unresolvedTickets: 0,
    negativeSentiments: 0,
    hasOverdueInvoices: false,
    daysSinceExecutiveContact: 5
  });
  assert.ok(res.totalScore >= 85);
  assert.strictEqual(res.status, 'THRIVING');
  assert.strictEqual(res.grade, 'A');
});

test('CustomerHealthScoreEngine: accurately discounts overdue invoices and tickets', () => {
  const engine = new CustomerHealthScoreEngine();
  const res = engine.scoreAccount({
    accountId: '2',
    accountName: 'Lapsing Co',
    usageRate: 40,
    unresolvedTickets: 3,
    negativeSentiments: 2,
    hasOverdueInvoices: true,
    daysSinceExecutiveContact: 45
  });
  assert.ok(res.totalScore < 50);
  assert.strictEqual(res.status, 'ENDANGERED');
  assert.ok(res.topRiskFactor.length > 0);
});

test('CustomerHealthScoreEngine: factor contributions sum accurately to total score', () => {
  const engine = new CustomerHealthScoreEngine();
  const res = engine.scoreAccount({
    accountId: '3',
    accountName: 'Mid Corp',
    usageRate: 80,
    unresolvedTickets: 1,
    negativeSentiments: 0,
    hasOverdueInvoices: false,
    daysSinceExecutiveContact: 10
  });
  const sum = res.factors.usage.contribution + res.factors.support.contribution + res.factors.payment.contribution + res.factors.engagement.contribution;
  assert.ok(Math.abs(sum - res.totalScore) <= 2);
});
