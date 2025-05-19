import{E as h,o as _}from"./VertexArrayObject-D1IEO_DV.js";import{x as y,s as j}from"./FramebufferObject-D7Barkrt.js";import{r as c}from"./ProgramTemplate-CBJnDEpo.js";import{e as v,a as O}from"./ProgramTemplate-CBJnDEpo.js";import{ff as w}from"./index-D77Qk2xM.js";import{t as p}from"./NestedMap-GuqgquCN.js";class ${constructor(e){this._rctx=e,this._store=new p}dispose(){this._store.forAll(e=>e.dispose()),this._store.clear()}acquire(e,t,o,n){const r=this._store.get(e,t);if(r!=null)return r.ref(),r;const s=new c(this._rctx,e,t,o,n);return s.ref(),this._store.set(e,t,s),s}get test(){}}function l(f){const{options:e,value:t}=f;return typeof e[t]=="number"}function d(f){let e="";for(const t in f){const o=f[t];if(typeof o=="boolean")o&&(e+=`#define ${t}
`);else if(typeof o=="number")e+=`#define ${t} ${o.toFixed()}
`;else if(typeof o=="object")if(l(o)){const{value:n,options:r,namespace:s}=o,i=s?`${s}_`:"";for(const a in r)e+=`#define ${i}${a} ${r[a].toFixed()}
`;e+=`#define ${t} ${i}${n}
`}else{const n=o.options;let r=0;for(const s in n)e+=`#define ${n[s]} ${(r++).toFixed()}
`;e+=`#define ${t} ${n[o.value]}
`}}return e}export{h as BufferObject,y as FramebufferObject,c as Program,$ as ProgramCache,j as Renderbuffer,v as ShaderCompiler,w as Texture,_ as VertexArrayObject,O as createProgram,d as glslifyDefineMap};
