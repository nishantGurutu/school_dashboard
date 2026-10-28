import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import React from 'react';
import {renderToString} from 'react-dom/server';
import {accountTab,accountRows,accountPayload} from './accountForm.js';
test('Accounts page renders its shell without undefined state or icons',async()=>{
 const server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom'});
 try{
  const {AccountsModule}=await server.ssrLoadModule('/src/components/modules/AccountsModule.jsx');
  const {ThemeProvider}=await server.ssrLoadModule('/src/context/ThemeContext.jsx');
  const html=renderToString(React.createElement(ThemeProvider,null,React.createElement(AccountsModule)));
  for(const text of ['Transactions','Income Head','Income List','Expense Head','Expense List','Total Income','Loading accounts'])assert.ok(html.includes(text),text);
  assert.doesNotMatch(html,/840,500|512,300|328,200/);
 }finally{await server.close();}
});
test('account routes and legacy API rows are normalized safely',()=>{
 for(const tab of ['income-head','income-list','expense-head','expense-list','transaction'])assert.equal(accountTab('accounts-'+tab),tab);
 assert.equal(accountTab('accounts'),'transaction');
 const [row]=accountRows([{id:7,transactionType:'INCOME',category:'Tuition',amount:25,description:'Legacy',transactionDate:'2026-10-28'}]);
 assert.equal(row.name,'Legacy');assert.equal(row.head,'Tuition');assert.equal(row.rawAmount,25);assert.equal(row.invoice,'ACC-7');assert.equal(row.paymentType,'—');
 const form={name:' Salary ',head:'Payroll',amount:'200',date:'2026-10-28',paymentType:'UPI',description:'Monthly'};
 assert.deepEqual(accountPayload(form,'EXPENSE'),{transactionType:'EXPENSE',name:'Salary',category:'Payroll',amount:200,paymentType:'UPI',description:'Monthly',transactionDate:'2026-10-28'});
 assert.throws(()=>accountPayload({...form,amount:'-1'},'EXPENSE'));
 assert.throws(()=>accountPayload({...form,head:''},'EXPENSE'));
});
