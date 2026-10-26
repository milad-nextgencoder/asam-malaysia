import test from 'node:test';
import assert from 'node:assert/strict';
import { certificateDownloadResponse } from '../lib/member/certificate-download.ts';
import { createRenderCapacity } from '../lib/member/render-capacity.ts';
test('invalid IDs and denied downloads never reach the PDF renderer',async()=>{
 let calls=0;const render=async()=>{calls++;return new TextEncoder().encode('%PDF-test');};
 assert.equal((await certificateDownloadResponse('../bad',{authorize:async()=>null,render})).status,404);
 for(const [code,status] of [['PT401',401],['PT403',403],['PT429',429],['unexpected',503]]){
  const response=await certificateDownloadResponse('ASAM-2026-000001',{authorize:async()=>({code}),render});
  assert.equal(response.status,status);assert.equal(response.headers.get('cache-control'),'private, no-store');
  if(status===429)assert.equal(response.headers.get('retry-after'),'60');
 }
 assert.equal(calls,0);
});
test('authorized responses contain actual PDF bytes and safe download headers',async()=>{
 const response=await certificateDownloadResponse('ASAM-2026-000001',{authorize:async()=>null,render:async()=>new TextEncoder().encode('%PDF-document')});
 assert.equal(response.status,200);assert.equal(response.headers.get('content-type'),'application/pdf');
 assert.equal(await response.text(),'%PDF-document');
 const invalid=await certificateDownloadResponse('ASAM-2026-000001',{authorize:async()=>null,render:async()=>new TextEncoder().encode('{}')});
 assert.equal(invalid.status,503);
});
test('renderer capacity bounds concurrent browser processes and recovers after release',()=>{
 const capacity=createRenderCapacity(2);assert.equal(capacity.acquire(),true);assert.equal(capacity.acquire(),true);
 assert.equal(capacity.acquire(),false);capacity.release();assert.equal(capacity.acquire(),true);
});
