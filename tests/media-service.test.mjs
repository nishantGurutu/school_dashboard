import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const moduleUrl = source => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const stub = moduleUrl(`export default {baseUrl:'https://backend.example/api', async upload(path,form,options){return globalThis.uploadMedia(path,form,options);}};`);
const source = (await readFile(new URL('../src/services/mediaService.js',import.meta.url),'utf8')).replace("'./networkService'",JSON.stringify(stub));
const { saveImage, mediaUrl, MAX_MEDIA_BYTES } = await import(moduleUrl(source));

test('optional upload does not make any API request',async()=>{
  globalThis.uploadMedia=()=>{throw new Error('Unexpected request');};
  assert.equal(await saveImage(null),null);
});
test('resolves DB media paths on backend instead of Vercel and rejects unsafe URLs',()=>{
  assert.equal(mediaUrl('/api/files/media/123'),'https://backend.example/api/files/media/123');
  assert.equal(mediaUrl('javascript:alert(1)'),'');
  assert.equal(mediaUrl('https://backend.example/api/files/media/123'),'https://backend.example/api/files/media/123');
});
test('PDF upload is multipart, preserves content and reuses completed uploads on retry',async()=>{
  const file=new File(['%PDF-1.4\nproof'],'proof.pdf',{type:'application/pdf'});let calls=0;
  globalThis.uploadMedia=async(path,form,options)=>{
    calls++;assert.equal(path,'/files/media');assert.equal(options.params.kind,'document');
    assert.equal(await form.get('file').text(),await file.text());
    return {fileUrl:'/api/files/media/pdf-id',contentType:'application/pdf'};
  };
  const result=await saveImage(file,{kind:'document'});await saveImage(file,{kind:'document'});
  assert.equal(result.fileUrl,'https://backend.example/api/files/media/pdf-id');assert.equal(calls,1);
});
test('rejects oversized, empty, active-content and document-as-photo inputs before upload',async()=>{
  globalThis.uploadMedia=()=>{throw new Error('Unexpected upload');};
  for(const file of [new File([],'empty.png',{type:'image/png'}),new File([new Uint8Array(MAX_MEDIA_BYTES+1)],'big.png',{type:'image/png'}),new File(['<svg/>'],'active.svg',{type:'image/svg+xml'}),new File(['%PDF-1.4'],'proof.pdf',{type:'application/pdf'})]) {
    await assert.rejects(saveImage(file));
  }
});
test('failed requests can retry; missing server confirmation is never treated as saved',async()=>{
  const file=new File(['%PDF-1.4'],'retry.pdf',{type:'application/pdf'});let calls=0;
  globalThis.uploadMedia=async()=>{if(++calls===1)throw new Error('offline');return {fileUrl:'/api/files/media/retry',contentType:'application/pdf'};};
  await assert.rejects(saveImage(file,{kind:'document'}),/offline/);
  assert.equal((await saveImage(file,{kind:'document'})).fileUrl,'https://backend.example/api/files/media/retry');
  globalThis.uploadMedia=async()=>({});
  await assert.rejects(saveImage(new File(['%PDF-1.4'],'missing.pdf',{type:'application/pdf'}),{kind:'document'}),/did not confirm/);
});
