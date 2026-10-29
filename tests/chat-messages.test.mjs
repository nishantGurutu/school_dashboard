import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mergeChatMessages} from '../src/services/chatMessages.js';
test('optimistic bubble is replaced by socket event and REST response without duplicates',()=>{
 const local={id:'local-1',clientId:'retry-id',senderId:'1',text:'Hi',localState:'sending'};
 const confirmed={id:41,clientId:'retry-id',senderId:1,text:'Hi'};
 const messages=mergeChatMessages(mergeChatMessages([local],[confirmed]),[confirmed]);
 assert.deepEqual(messages,[confirmed]);
});
test('missed history is placed before a later live message',()=>{
 const messages=mergeChatMessages([{id:1},{id:3}],[{id:2},{id:3}]);
 assert.deepEqual(messages.map(m=>m.id),[1,2,3]);
});
test('different senders cannot replace each others client identifiers',()=>{
 assert.equal(mergeChatMessages([{id:1,clientId:'same',senderId:1}],[{id:2,clientId:'same',senderId:2}]).length,2);
});
