import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { activeOptions, classOptions, applicableDiscounts, collectionPayload, discountPayload, discountValueLabel } from './feeCollectionForm.js';

test('API options exclude inactive records, deduplicate classes and scope discounts', () => {
  assert.deepEqual(classOptions([{name:'Class 7',section:'A',status:'Active'},{name:'Class 7',section:'B',status:'Active'},{name:'Class 8',status:'Inactive'}]),['Class 7']);
  assert.equal(activeOptions([{id:1,status:'Active'},{id:2,status:'Inactive'}]).length,1);
  assert.deepEqual(applicableDiscounts([{id:1,feesType:'Tuition, Exam',status:'Active'},{id:2,feesType:'Transport',status:'Active'},
    {id:3,feesType:'Tuition',status:'Inactive'},{id:4,feesType:'All',status:'Active'}],'tuition').map(d=>d.id),[1,4]);
});
test('collection payload includes selected IDs and never invents a student', () => {
  const form={className:'Class 7',section:'A',rollNo:' 12 ',date:'2026-10-28',amount:'1500',feeTypeId:'42',discountId:'13',paymentType:'UPI',note:'Term fees'};
  const payload=collectionPayload(form);
  assert.equal(payload.feeTypeId,42); assert.equal(payload.discountId,13); assert.equal(payload.rollNo,'12');
  assert.equal(payload.section,'A'); assert.equal(payload.paymentType,'UPI');
  assert.equal(payload.name,undefined); assert.equal(payload.admissionNo,undefined);
  assert.equal(collectionPayload({...form,discountId:''}).discountId,null);
  for(const key of ['className','section','feeTypeId','paymentType','rollNo','date']) assert.throws(()=>collectionPayload({...form,[key]:''}));
  for(const amount of ['0','-10','bad']) assert.throws(()=>collectionPayload({...form,amount}));
});
test('holiday create controls render for admin roles only', async () => {
  const server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom'});
  let role='ADMIN';
  globalThis.localStorage={getItem:()=>JSON.stringify({role})};
  try {
    const { HolidaysModule }=await server.ssrLoadModule('/src/components/modules/HolidaysModule.jsx');
    for(role of ['ADMIN','SUPER_ADMIN','MASTER_ADMIN']) assert.match(renderToString(React.createElement(HolidaysModule)),/Add New Holiday/);
    for(role of ['ACCOUNTANT','TEACHER','PRINCIPAL','LIBRARIAN','STAFF']) assert.doesNotMatch(renderToString(React.createElement(HolidaysModule)),/Add New Holiday/);
  } finally {delete globalThis.localStorage;await server.close();}
});
test('fee dropdown services call payment API and send class filter to sections API', async () => {
  const server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom'});
  try {
    const {default:network}=await server.ssrLoadModule('/src/services/networkService.js');
    const {feeService}=await server.ssrLoadModule('/src/services/feeService.js');
    const {classService}=await server.ssrLoadModule('/src/services/classService.js');
    const calls=[]; network.get=async (...args)=>{calls.push(args);return [];};
    await feeService.paymentTypes(); await classService.classes.list(); await classService.sections.list({className:'Class 7'});
    assert.equal(calls[0][0],'/fees/payment-types');
    assert.equal(calls[1][0],'/classes/classes');
    assert.deepEqual(calls[2],['/classes/sections',{className:'Class 7'}]);
  }finally{await server.close();}
});

test('discount create and edit preserve explicit fee scope and all display fields', () => {
  const form={name:' Sibling Discount ',discountType:'Percentage',discountValue:'10%',status:'Active'};
  const payload=discountPayload(form);
  assert.deepEqual(payload,{name:'Sibling Discount',feesType:'All',discountType:'Percentage',discountValue:'10',status:'Active'});
  assert.equal(applicableDiscounts([payload],'Semester Fee').length,1);
  assert.equal(discountValueLabel(payload),'10%');
  const scoped=discountPayload({...form,feesType:'Semester Fee',discountType:'Fixed Amount',discountValue:'200'});
  assert.equal(discountValueLabel(scoped),'200');
  assert.equal(applicableDiscounts([scoped],'Semester Fee').length,1);
  assert.equal(applicableDiscounts([scoped],'Exam Fee').length,0);
  for(const discountValue of ['', '-1','abc','101']) assert.throws(()=>discountPayload({...form,discountValue}));
});

test('payment type picker uses API methods and exposes adding only to finance managers', async () => {
  const server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom'});
  let role='ACCOUNTANT'; globalThis.localStorage={getItem:()=>JSON.stringify({role})};
  try {
    const {PaymentTypePicker}=await server.ssrLoadModule('/src/components/modules/PaymentTypePicker.jsx');
    const props={value:'Demand Draft',methods:[{id:77,name:'Demand Draft',active:true}],onChange:()=>{},onCreated:()=>{},inputStyle:{}};
    for(role of ['ACCOUNTANT','ADMIN','PRINCIPAL']) {
      const html=renderToString(React.createElement(PaymentTypePicker,props));
      assert.match(html,/Add Payment Type/); assert.match(html,/Demand Draft/);
    }
    role='TEACHER'; assert.doesNotMatch(renderToString(React.createElement(PaymentTypePicker,props)),/Add Payment Type/);
    const {default:network}=await server.ssrLoadModule('/src/services/networkService.js');
    const {feeService}=await server.ssrLoadModule('/src/services/feeService.js');
    network.post=async (url,data)=>{assert.equal(url,'/fees/payment-types');assert.deepEqual(data,{name:'Demand Draft'});return {id:77,...data,active:true};};
    assert.equal((await feeService.createPaymentType({name:'Demand Draft'})).id,77);
  }finally{delete globalThis.localStorage;await server.close();}
});
