import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const dataUrl = value => `data:text/javascript;base64,${Buffer.from(value).toString('base64')}`;
const runtime = dataUrl("export async function refreshRuntimeConfig() {}");
const config = dataUrl("export const API_BASE_URL='https://api.example/api'; export const API_ENDPOINTS={AUTH:{REFRESH:'/auth/refresh'}};");
const source = (await readFile(new URL('../src/services/networkService.js', import.meta.url), 'utf8'))
  .replace("'./apiConfig'", JSON.stringify(config)).replace("'./runtimeConfig'", JSON.stringify(runtime));
const { NetworkService: api, authStorage: auth } = await import(dataUrl(source));
let stored;
const reset = () => {
  stored = new Map();
  globalThis.localStorage = {getItem:k=>stored.get(k) ?? null, setItem:(k,v)=>stored.set(k,v),removeItem:k=>stored.delete(k)};
  globalThis.window = {dispatchEvent:()=>{}};
  globalThis.CustomEvent = class {constructor(type){this.type=type;}};
  auth.setSession({accessToken:'old',refreshToken:'refresh',user:{name:'User'}});
};
const response = (status,data) => new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json'}});

test('concurrent 401s share refresh, persist rotated tokens and replay each request',async()=>{
  reset(); let refreshes=0, requests=0;
  globalThis.fetch=async(url,options)=>{
    if(url.endsWith('/auth/refresh')) {refreshes++; await new Promise(r=>setTimeout(r,10)); return response(200,{accessToken:'new',refreshToken:'rotated'});}
    requests++; return options.headers.Authorization==='Bearer new'?response(200,{ok:true}):response(401,{});
  };
  assert.deepEqual(await Promise.all([api.get('/one'),api.get('/two')]),[{ok:true},{ok:true}]);
  assert.equal(refreshes,1); assert.equal(requests,4); assert.equal(auth.getRefreshToken(),'rotated');
});
test('delayed old-token 401 reuses already refreshed token',async()=>{
  reset(); let refreshes=0,release;
  const late=new Promise(r=>release=r);
  globalThis.fetch=async(url,options)=>{
    if(url.endsWith('/auth/refresh')) {refreshes++;return response(200,{accessToken:'new'});}
    if(options.headers.Authorization==='Bearer new') return response(200,{ok:true});
    if(url.endsWith('/late')) await late;
    return response(401,{});
  };
  const pending=api.get('/late'); await api.get('/first'); release(); await pending;
  assert.equal(refreshes,1);
});
test('temporary refresh failure retains session',async()=>{
  reset();globalThis.fetch=async(url)=>{if(url.endsWith('/auth/refresh'))throw new Error('offline');return response(401,{});};
  await assert.rejects(api.get('/one')); assert.equal(auth.getRefreshToken(),'refresh');assert.equal(auth.getAccessToken(),'old');
});
test('invalid refresh ends session',async()=>{
  reset();globalThis.fetch=async()=>response(401,{});
  await assert.rejects(api.get('/one'),/Session expired/); assert.equal(auth.getAccessToken(),null);
});
test('retry stops after one refresh and configuration-server refresh stays on that server',async()=>{
  reset();let refreshes=0,calls=0;
  globalThis.fetch=async(url)=>{if(url.endsWith('/auth/refresh')) {assert.equal(url,'https://config.example/api/auth/refresh');refreshes++;return response(200,{accessToken:'new'});}calls++;return response(401,{});};
  await assert.rejects(api.request('/admin/runtime-config',{baseUrl:'https://config.example/api'}));
  assert.equal(refreshes,1);assert.equal(calls,2);
});

const jwt = exp => `header.${Buffer.from(JSON.stringify({exp})).toString('base64url')}.signature`;
test('socket reuses a valid JWT without fetching rooms or refreshing', async () => {
  reset(); const token = jwt(Math.floor(Date.now() / 1000) + 3600);
  auth.setSession({accessToken:token});
  globalThis.fetch = async () => { throw new Error('Unexpected HTTP request'); };
  assert.equal(await api.socketAccessToken(), token);
});
test('concurrent socket connects refresh an expired JWT once', async () => {
  reset(); auth.setSession({accessToken:jwt(1)}); let refreshes = 0;
  globalThis.fetch = async url => {
    assert.ok(url.endsWith('/auth/refresh')); refreshes++;
    await new Promise(resolve => setTimeout(resolve, 5));
    return response(200, {accessToken:'renewed'});
  };
  assert.deepEqual(await Promise.all([api.socketAccessToken(), api.socketAccessToken()]), ['renewed','renewed']);
  assert.equal(refreshes, 1);
});
