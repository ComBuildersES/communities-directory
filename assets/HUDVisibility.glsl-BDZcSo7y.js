import{n as N}from"./glsl-BH37Aalp.js";import{A as C,gH as Fe,d3 as ie,cs as j,as as z,aC as ee,d1 as F,ct as D,aq as B,cu as Ue,Y as Ae,X as Ge,ao as Ie,oI as Ee,W as je,bt as He,am as Le,oJ as _e,oK as Be,oL as ke,nu as qe,c4 as Xe,oM as Ye,oN as Ze,oO as Qe,oP as Je,oQ as Ke,oR as We,oS as et,oT as tt}from"./index-JJrH86ui.js";import{t as nt}from"./doublePrecisionUtils-B0owpBza.js";import{r as R,t as Pe,n as U}from"./vec3f32-nZdmKIgz.js";import{n as G,f as E,e as Re,a as Me,s as ot,c as st,g as rt,o as $e,h as at,i as Oe,j as lt,p as it,w as ct,k as ut,l as ft,m as ht}from"./VerticalOffset.glsl-DTwUKON1.js";import{o as pt,w as Ce}from"./Indices-D5LNy_bc.js";import{M as dt,l as mt,x as wt}from"./plane-qFZsdvrT.js";import{k as gt}from"./sphere-B56RiMyg.js";import{t as T}from"./orientedBoundingBox-d0wfkBQg.js";import{s as te}from"./InterleavedLayout-DRelrrPh.js";import{e as x}from"./VertexAttribute-Cq4MnHjR.js";import{e as Ot}from"./mat4f64-Dk4dwAN8.js";import{u as vt}from"./meshVertexSpaceUtils-CZvug_5I.js";import{e as xe}from"./projectVectorToVector-fBgNlHmO.js";import{o as xt,x as yt}from"./hydratedFeatures-C0q1rj_u.js";function tn(e){e.code.add(N`const float MAX_RGBA_FLOAT =
255.0 / 256.0 +
255.0 / 256.0 / 256.0 +
255.0 / 256.0 / 256.0 / 256.0 +
255.0 / 256.0 / 256.0 / 256.0 / 256.0;
const vec4 FIXED_POINT_FACTORS = vec4(1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0);
vec4 float2rgba(const float value) {
float valueInValidDomain = clamp(value, 0.0, MAX_RGBA_FLOAT);
vec4 fixedPointU8 = floor(fract(valueInValidDomain * FIXED_POINT_FACTORS) * 256.0);
const float toU8AsFloat = 1.0 / 255.0;
return fixedPointU8 * toU8AsFloat;
}`),e.code.add(N`const vec4 RGBA_TO_FLOAT_FACTORS = vec4(
255.0 / (256.0),
255.0 / (256.0 * 256.0),
255.0 / (256.0 * 256.0 * 256.0),
255.0 / (256.0 * 256.0 * 256.0 * 256.0)
);
float rgbaTofloat(vec4 rgba) {
return dot(rgba, RGBA_TO_FLOAT_FACTORS);
}`),e.code.add(N`const vec4 uninterpolatedRGBAToFloatFactors = vec4(
1.0 / 256.0,
1.0 / 256.0 / 256.0,
1.0 / 256.0 / 256.0 / 256.0,
1.0 / 256.0 / 256.0 / 256.0 / 256.0
);
float uninterpolatedRGBAToFloat(vec4 rgba) {
return (dot(round(rgba * 255.0), uninterpolatedRGBAToFloatFactors) - 0.5) * 2.0;
}`)}function nn(e){return e.type==="point"}function on(e,n){return e==null&&(e=[]),e.push(n),e}function sn(e,n){if(e==null)return null;const o=e.filter(t=>t!==n);return o.length===0?null:o}function rn(e,n,o,t,s){oe[0]=e.get(n,0),oe[1]=e.get(n,1),oe[2]=e.get(n,2),nt(oe,k,3),o.set(s,0,k[0]),t.set(s,0,k[1]),o.set(s,1,k[2]),t.set(s,1,k[3]),o.set(s,2,k[4]),t.set(s,2,k[5])}const oe=C(),k=new Float32Array(6);var ve;(function(e){function n(r,l){const c=r[l],a=r[l+1],i=r[l+2];return Math.sqrt(c*c+a*a+i*i)}function o(r,l){const c=r[l],a=r[l+1],i=r[l+2],p=1/Math.sqrt(c*c+a*a+i*i);r[l]*=p,r[l+1]*=p,r[l+2]*=p}function t(r,l,c){r[l]*=c,r[l+1]*=c,r[l+2]*=c}function s(r,l,c,a,i,p=l){(i=i||r)[p]=r[l]+c[a],i[p+1]=r[l+1]+c[a+1],i[p+2]=r[l+2]+c[a+2]}function f(r,l,c,a,i,p=l){(i=i||r)[p]=r[l]-c[a],i[p+1]=r[l+1]-c[a+1],i[p+2]=r[l+2]-c[a+2]}e.length=n,e.normalize=o,e.scale=t,e.add=s,e.subtract=f})(ve||(ve={}));const X=ve,de=[[-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5],[-.5,-.5,-.5],[.5,-.5,-.5],[.5,.5,-.5],[-.5,.5,-.5]],At=[0,0,1,-1,0,0,1,0,0,0,-1,0,0,1,0,0,0,-1],Pt=[0,0,1,0,1,1,0,1],Mt=[0,1,2,2,3,0,4,0,3,3,7,4,1,5,6,6,2,1,1,0,4,4,5,1,3,2,6,6,7,3,5,4,7,7,6,5],Ne=new Array(36);for(let e=0;e<6;e++)for(let n=0;n<6;n++)Ne[6*e+n]=e;const q=new Array(36);for(let e=0;e<6;e++)q[6*e]=0,q[6*e+1]=1,q[6*e+2]=2,q[6*e+3]=2,q[6*e+4]=3,q[6*e+5]=0;function an(e,n){Array.isArray(n)||(n=[n,n,n]);const o=new Array(24);for(let t=0;t<8;t++)o[3*t]=de[t][0]*n[0],o[3*t+1]=de[t][1]*n[1],o[3*t+2]=de[t][2]*n[2];return new E(e,[[x.POSITION,new T(o,Mt,3,!0)],[x.NORMAL,new T(At,Ne,3)],[x.UV0,new T(Pt,q,2)]])}const me=[[-.5,0,-.5],[.5,0,-.5],[.5,0,.5],[-.5,0,.5],[0,-.5,0],[0,.5,0]],St=[0,1,-1,1,1,0,0,1,1,-1,1,0,0,-1,-1,1,-1,0,0,-1,1,-1,-1,0],Tt=[5,1,0,5,2,1,5,3,2,5,0,3,4,0,1,4,1,2,4,2,3,4,3,0],bt=[0,0,0,1,1,1,2,2,2,3,3,3,4,4,4,5,5,5,6,6,6,7,7,7];function ln(e,n){Array.isArray(n)||(n=[n,n,n]);const o=new Array(18);for(let t=0;t<6;t++)o[3*t]=me[t][0]*n[0],o[3*t+1]=me[t][1]*n[1],o[3*t+2]=me[t][2]*n[2];return new E(e,[[x.POSITION,new T(o,Tt,3,!0)],[x.NORMAL,new T(St,bt,3)]])}const se=R(-.5,0,-.5),re=R(.5,0,-.5),ae=R(0,0,.5),le=R(0,.5,0),Y=U(),Z=U(),J=U(),K=U(),W=U();j(Y,se,le),j(Z,se,re),B(J,Y,Z),z(J,J),j(Y,re,le),j(Z,re,ae),B(K,Y,Z),z(K,K),j(Y,ae,le),j(Z,ae,se),B(W,Y,Z),z(W,W);const we=[se,re,ae,le],It=[0,-1,0,J[0],J[1],J[2],K[0],K[1],K[2],W[0],W[1],W[2]],Rt=[0,1,2,3,1,0,3,2,1,3,0,2],$t=[0,0,0,1,1,1,2,2,2,3,3,3];function cn(e,n){Array.isArray(n)||(n=[n,n,n]);const o=new Array(12);for(let t=0;t<4;t++)o[3*t]=we[t][0]*n[0],o[3*t+1]=we[t][1]*n[1],o[3*t+2]=we[t][2]*n[2];return new E(e,[[x.POSITION,new T(o,Rt,3,!0)],[x.NORMAL,new T(It,$t,3)]])}function un(e,n,o,t,s={uv:!0}){const f=-Math.PI,r=2*Math.PI,l=-Math.PI/2,c=Math.PI,a=Math.max(3,Math.floor(o)),i=Math.max(2,Math.floor(t)),p=(a+1)*(i+1),y=G(3*p),P=G(3*p),A=G(2*p),g=[];let h=0;for(let w=0;w<=i;w++){const I=[],u=w/i,M=l+u*c,S=Math.cos(M);for(let $=0;$<=a;$++){const H=$/a,O=f+H*r,V=Math.cos(O)*S,b=Math.sin(M),ne=-Math.sin(O)*S;y[3*h]=V*n,y[3*h+1]=b*n,y[3*h+2]=ne*n,P[3*h]=V,P[3*h+1]=b,P[3*h+2]=ne,A[2*h]=H,A[2*h+1]=u,I.push(h),++h}g.push(I)}const m=new Array;for(let w=0;w<i;w++)for(let I=0;I<a;I++){const u=g[w][I],M=g[w][I+1],S=g[w+1][I+1],$=g[w+1][I];w===0?(m.push(u),m.push(S),m.push($)):w===i-1?(m.push(u),m.push(M),m.push(S)):(m.push(u),m.push(M),m.push(S),m.push(S),m.push($),m.push(u))}const d=[[x.POSITION,new T(y,m,3,!0)],[x.NORMAL,new T(P,m,3,!0)]];return s.uv&&d.push([x.UV0,new T(A,m,2,!0)]),s.offset&&(d[0][0]=x.OFFSET,d.push([x.POSITION,new T(Float64Array.from(s.offset),Ce(m.length),3,!0)])),new E(e,d)}function fn(e,n,o,t){const s=Ct(n,o);return new E(e,s)}function Ct(e,n,o){let t,s;t=[0,-1,0,1,0,0,0,0,1,-1,0,0,0,0,-1,0,1,0],s=[0,1,2,0,2,3,0,3,4,0,4,1,1,5,2,2,5,3,3,5,4,4,5,1];for(let c=0;c<t.length;c+=3)X.scale(t,c,e/X.length(t,c));let f={};function r(c,a){c>a&&([c,a]=[a,c]);const i=c.toString()+"."+a.toString();if(f[i])return f[i];let p=t.length;return t.length+=3,X.add(t,3*c,t,3*a,t,p),X.scale(t,p,e/X.length(t,p)),p/=3,f[i]=p,p}for(let c=0;c<n;c++){const a=s.length,i=new Array(4*a);for(let p=0;p<a;p+=3){const y=s[p],P=s[p+1],A=s[p+2],g=r(y,P),h=r(P,A),m=r(A,y),d=4*p;i[d]=y,i[d+1]=g,i[d+2]=m,i[d+3]=P,i[d+4]=h,i[d+5]=g,i[d+6]=A,i[d+7]=m,i[d+8]=h,i[d+9]=g,i[d+10]=h,i[d+11]=m}s=i,f={}}const l=Me(t);for(let c=0;c<l.length;c+=3)X.normalize(l,c);return[[x.POSITION,new T(Me(t),s,3,!0)],[x.NORMAL,new T(l,s,3,!0)]]}function hn(e,n={}){const{normal:o,position:t,color:s,rotation:f,size:r,centerOffsetAndDistance:l,uvs:c,featureAttribute:a,objectAndLayerIdColor:i=null}=n,p=t?Ae(t):C(),y=o?Ae(o):Ge(0,0,1),P=s?[255*s[0],255*s[1],255*s[2],s.length>3?255*s[3]:255]:[255,255,255,255],A=r!=null&&r.length===2?r:[1,1],g=f!=null?[f]:[0],h=Ce(1),m=[[x.POSITION,new T(p,h,3,!0)],[x.NORMAL,new T(y,h,3,!0)],[x.COLOR,new T(P,h,4,!0)],[x.SIZE,new T(A,h,2)],[x.ROTATION,new T(g,h,1,!0)]];if(c&&m.push([x.UV0,new T(c,h,c.length)]),l!=null){const d=[l[0],l[1],l[2],l[3]];m.push([x.CENTEROFFSETANDDISTANCE,new T(d,h,4)])}if(a){const d=[a[0],a[1],a[2],a[3]];m.push([x.FEATUREATTRIBUTE,new T(d,h,4)])}return new E(e,m,null,Re.Point,i)}function Nt(e,n,o,t,s=!0,f=!0){let r=0;const l=n,c=e;let a=R(0,r,0),i=R(0,r+c,0),p=R(0,-1,0),y=R(0,1,0);t&&(r=c,i=R(0,0,0),a=R(0,r,0),p=R(0,1,0),y=R(0,-1,0));const P=[i,a],A=[p,y],g=o+2,h=Math.sqrt(c*c+l*l);if(t)for(let u=o-1;u>=0;u--){const M=u*(2*Math.PI/o),S=R(Math.cos(M)*l,r,Math.sin(M)*l);P.push(S);const $=R(c*Math.cos(M)/h,-l/h,c*Math.sin(M)/h);A.push($)}else for(let u=0;u<o;u++){const M=u*(2*Math.PI/o),S=R(Math.cos(M)*l,r,Math.sin(M)*l);P.push(S);const $=R(c*Math.cos(M)/h,l/h,c*Math.sin(M)/h);A.push($)}const m=new Array,d=new Array;if(s){for(let u=3;u<P.length;u++)m.push(1),m.push(u-1),m.push(u),d.push(0),d.push(0),d.push(0);m.push(P.length-1),m.push(2),m.push(1),d.push(0),d.push(0),d.push(0)}if(f){for(let u=3;u<P.length;u++)m.push(u),m.push(u-1),m.push(0),d.push(u),d.push(u-1),d.push(1);m.push(0),m.push(2),m.push(P.length-1),d.push(1),d.push(2),d.push(A.length-1)}const w=G(3*g);for(let u=0;u<g;u++)w[3*u]=P[u][0],w[3*u+1]=P[u][1],w[3*u+2]=P[u][2];const I=G(3*g);for(let u=0;u<g;u++)I[3*u]=A[u][0],I[3*u+1]=A[u][1],I[3*u+2]=A[u][2];return[[x.POSITION,new T(w,m,3,!0)],[x.NORMAL,new T(I,d,3,!0)]]}function pn(e,n,o,t,s,f=!0,r=!0){return new E(e,Nt(n,o,t,s,f,r))}function dn(e,n,o,t,s,f,r){const l=s?Pe(s):R(1,0,0),c=f?Pe(f):R(0,0,0);r??(r=!0);const a=U();z(a,l);const i=U();F(i,a,Math.abs(n));const p=U();F(p,i,-.5),D(p,p,c);const y=R(0,1,0);Math.abs(1-Ie(a,y))<.2&&ie(y,0,0,1);const P=U();B(P,a,y),z(P,P),B(y,P,a);const A=2*t+(r?2:0),g=t+(r?2:0),h=G(3*A),m=G(3*g),d=G(2*A),w=new Array(3*t*(r?4:2)),I=new Array(3*t*(r?4:2));r&&(h[3*(A-2)]=p[0],h[3*(A-2)+1]=p[1],h[3*(A-2)+2]=p[2],d[2*(A-2)]=0,d[2*(A-2)+1]=0,h[3*(A-1)]=h[3*(A-2)]+i[0],h[3*(A-1)+1]=h[3*(A-2)+1]+i[1],h[3*(A-1)+2]=h[3*(A-2)+2]+i[2],d[2*(A-1)]=1,d[2*(A-1)+1]=1,m[3*(g-2)]=-a[0],m[3*(g-2)+1]=-a[1],m[3*(g-2)+2]=-a[2],m[3*(g-1)]=a[0],m[3*(g-1)+1]=a[1],m[3*(g-1)+2]=a[2]);const u=(O,V,b)=>{w[O]=V,I[O]=b};let M=0;const S=U(),$=U();for(let O=0;O<t;O++){const V=O*(2*Math.PI/t);F(S,y,Math.sin(V)),F($,P,Math.cos(V)),D(S,S,$),m[3*O]=S[0],m[3*O+1]=S[1],m[3*O+2]=S[2],F(S,S,o),D(S,S,p),h[3*O]=S[0],h[3*O+1]=S[1],h[3*O+2]=S[2],d[2*O]=O/t,d[2*O+1]=0,h[3*(O+t)]=h[3*O]+i[0],h[3*(O+t)+1]=h[3*O+1]+i[1],h[3*(O+t)+2]=h[3*O+2]+i[2],d[2*(O+t)]=O/t,d[2*O+1]=1;const b=(O+1)%t;u(M++,O,O),u(M++,O+t,O),u(M++,b,b),u(M++,b,b),u(M++,O+t,O),u(M++,b+t,b)}if(r){for(let O=0;O<t;O++){const V=(O+1)%t;u(M++,A-2,g-2),u(M++,O,g-2),u(M++,V,g-2)}for(let O=0;O<t;O++){const V=(O+1)%t;u(M++,O+t,g-1),u(M++,A-1,g-1),u(M++,V+t,g-1)}}const H=[[x.POSITION,new T(h,w,3,!0)],[x.NORMAL,new T(m,I,3,!0)],[x.UV0,new T(d,w,2,!0)]];return new E(e,H)}function mn(e,n,o,t,s,f){t=t||10,s=s==null||s,te(n.length>1);const r=[[0,0,0]],l=[],c=[];for(let a=0;a<t;a++){l.push([0,-a-1,-(a+1)%t-1]);const i=a/t*2*Math.PI;c.push([Math.cos(i)*o,Math.sin(i)*o])}return zt(e,c,n,r,l,s,f)}function zt(e,n,o,t,s,f,r=R(0,0,0)){const l=n.length,c=G(o.length*l*3+(6*t.length||0)),a=G(o.length*l*3+(t?6:0)),i=new Array,p=new Array;let y=0,P=0;const A=C(),g=C(),h=C(),m=C(),d=C(),w=C(),I=C(),u=C(),M=C(),S=C(),$=C(),H=C(),O=C(),V=dt();ie(M,0,1,0),j(g,o[1],o[0]),z(g,g),f?(D(u,o[0],r),z(h,u)):ie(h,0,0,1),Se(g,h,M,M,d,h,Te),ee(m,h),ee(H,d);for(let v=0;v<t.length;v++)F(w,d,t[v][0]),F(u,h,t[v][2]),D(w,w,u),D(w,w,o[0]),c[y++]=w[0],c[y++]=w[1],c[y++]=w[2];a[P++]=-g[0],a[P++]=-g[1],a[P++]=-g[2];for(let v=0;v<s.length;v++)i.push(s[v][0]>0?s[v][0]:-s[v][0]-1+t.length),i.push(s[v][1]>0?s[v][1]:-s[v][1]-1+t.length),i.push(s[v][2]>0?s[v][2]:-s[v][2]-1+t.length),p.push(0),p.push(0),p.push(0);let b=t.length;const ne=t.length-1;for(let v=0;v<o.length;v++){let ye=!1;v>0&&(ee(A,g),v<o.length-1?(j(g,o[v+1],o[v]),z(g,g)):ye=!0,D(S,A,g),z(S,S),D($,o[v-1],m),mt(o[v],S,V),wt(V,gt($,A),u)?(j(u,u,o[v]),z(h,u),B(d,S,h),z(d,d)):Se(S,m,H,M,d,h,Te),ee(m,h),ee(H,d)),f&&(D(u,o[v],r),z(O,u));for(let L=0;L<l;L++)if(F(w,d,n[L][0]),F(u,h,n[L][1]),D(w,w,u),z(I,w),a[P++]=I[0],a[P++]=I[1],a[P++]=I[2],D(w,w,o[v]),c[y++]=w[0],c[y++]=w[1],c[y++]=w[2],!ye){const he=(L+1)%l;i.push(b+L),i.push(b+l+L),i.push(b+he),i.push(b+he),i.push(b+l+L),i.push(b+l+he);for(let pe=0;pe<6;pe++){const De=i.length-6;p.push(i[De+pe]-ne)}}b+=l}const ze=o[o.length-1];for(let v=0;v<t.length;v++)F(w,d,t[v][0]),F(u,h,t[v][1]),D(w,w,u),D(w,w,ze),c[y++]=w[0],c[y++]=w[1],c[y++]=w[2];const ue=P/3;a[P++]=g[0],a[P++]=g[1],a[P++]=g[2];const fe=b-l;for(let v=0;v<s.length;v++)i.push(s[v][0]>=0?b+s[v][0]:-s[v][0]-1+fe),i.push(s[v][2]>=0?b+s[v][2]:-s[v][2]-1+fe),i.push(s[v][1]>=0?b+s[v][1]:-s[v][1]-1+fe),p.push(ue),p.push(ue),p.push(ue);const Ve=[[x.POSITION,new T(c,i,3,!0)],[x.NORMAL,new T(a,p,3,!0)]];return new E(e,Ve)}function wn(e,n,o,t){te(n.length>1,"createPolylineGeometry(): polyline needs at least 2 points"),te(n[0].length===3,"createPolylineGeometry(): malformed vertex"),te(o==null||o.length===n.length,"createPolylineGeometry: need same number of points and normals"),te(o==null||o[0].length===3,"createPolylineGeometry(): malformed normal");const s=Fe(3*n.length),f=new Array(2*(n.length-1));let r=0,l=0;for(let a=0;a<n.length;a++){for(let i=0;i<3;i++)s[r++]=n[a][i];a>0&&(f[l++]=a-1,f[l++]=a)}const c=[[x.POSITION,new T(s,f,3,!0)]];if(o){const a=G(3*o.length);let i=0;for(let p=0;p<n.length;p++)for(let y=0;y<3;y++)a[i++]=o[p][y];c.push([x.NORMAL,new T(a,f,3,!0)])}return t&&c.push([x.COLOR,new T(t,pt(t.length/4),4)]),new E(e,c,null,Re.Line)}function gn(e,n,o,t,s,f=0){const r=new Array(18),l=[[-o,f,s/2],[t,f,s/2],[0,n+f,s/2],[-o,f,-s/2],[t,f,-s/2],[0,n+f,-s/2]],c=[0,1,2,3,0,2,2,5,3,1,4,5,5,2,1,1,0,3,3,4,1,4,3,5];for(let a=0;a<6;a++)r[3*a]=l[a][0],r[3*a+1]=l[a][1],r[3*a+2]=l[a][2];return new E(e,[[x.POSITION,new T(r,c,3,!0)]])}function On(e,n){const o=e.getMutableAttribute(x.POSITION).data;for(let t=0;t<o.length;t+=3){const s=o[t],f=o[t+1],r=o[t+2];ie(Q,s,f,r),Ue(Q,Q,n),o[t]=Q[0],o[t+1]=Q[1],o[t+2]=Q[2]}}function vn(e,n=e){const o=e.attributes,t=o.get(x.POSITION).data,s=o.get(x.NORMAL).data;if(s){const f=n.getMutableAttribute(x.NORMAL).data;for(let r=0;r<s.length;r+=3){const l=s[r+1];f[r+1]=-s[r+2],f[r+2]=l}}if(t){const f=n.getMutableAttribute(x.POSITION).data;for(let r=0;r<t.length;r+=3){const l=t[r+1];f[r+1]=-t[r+2],f[r+2]=l}}}function ge(e,n,o,t,s){return!(Math.abs(Ie(n,e))>s)&&(B(o,e,n),z(o,o),B(t,o,e),z(t,t),!0)}function Se(e,n,o,t,s,f,r){return ge(e,n,s,f,r)||ge(e,o,s,f,r)||ge(e,t,s,f,r)}const Te=.99619469809,Q=C();var ce;(function(e){e[e.Occluded=0]="Occluded",e[e.NotOccluded=1]="NotOccluded",e[e.Both=2]="Both",e[e.COUNT=3]="COUNT"})(ce||(ce={}));function xn(e,n){if(e.type==="point")return _(e,n,!1);if(xt(e))switch(e.type){case"extent":return _(e.center,n,!1);case"polygon":return _(e.centroid,n,!1);case"polyline":return _(be(e),n,!0);case"mesh":return _(vt(e.vertexSpace,e.spatialReference)??e.extent.center,n,!1);case"multipoint":return}else switch(e.type){case"extent":return _(Vt(e),n,!0);case"polygon":return _(Dt(e),n,!0);case"polyline":return _(be(e),n,!0);case"multipoint":return}}function be(e){const n=e.paths[0];if(!n||n.length===0)return null;const o=Be(n,ke(n)/2);return xe(o[0],o[1],o[2],e.spatialReference)}function Vt(e){return xe(.5*(e.xmax+e.xmin),.5*(e.ymax+e.ymin),e.zmin!=null&&e.zmax!=null&&isFinite(e.zmin)&&isFinite(e.zmax)?.5*(e.zmax+e.zmin):void 0,e.spatialReference)}function Dt(e){const n=e.rings[0];if(!n||n.length===0)return null;const o=qe(e.rings,!!e.hasZ);return xe(o[0],o[1],o[2],e.spatialReference)}function _(e,n,o){const t=o?e:yt(e);return n&&e?_e(e,t,n)?t:null:t}function yn(e,n,o,t=0){if(e){n||(n=He());const s=e;let f=.5*s.width*(o-1),r=.5*s.height*(o-1);return s.width<1e-7*s.height?f+=r/20:s.height<1e-7*s.width&&(r+=f/20),Le(n,s.xmin-f-t,s.ymin-r-t,s.xmax+f+t,s.ymax+r+t),n}return null}function An(e,n,o=null){const t=Je(Ke);return e!=null&&(t[0]=e[0],t[1]=e[1],t[2]=e[2]),n!=null?t[3]=n:e!=null&&e.length>3&&(t[3]=e[3]),o&&(t[0]*=o,t[1]*=o,t[2]*=o,t[3]*=o),t}function Pn(e=Ee,n,o,t=1){const s=new Array(3);if(n==null||o==null)s[0]=1,s[1]=1,s[2]=1;else{let f,r=0;for(let l=2;l>=0;l--){const c=e[l],a=c!=null,i=l===0&&!f&&!a,p=o[l];let y;c==="symbol-value"||i?y=p!==0?n[l]/p:1:a&&c!=="proportional"&&isFinite(c)&&(y=p!==0?c/p:1),y!=null&&(s[l]=y,f=y,r=Math.max(r,Math.abs(y)))}for(let l=2;l>=0;l--)s[l]==null?s[l]=f:s[l]===0&&(s[l]=.001*r)}for(let f=2;f>=0;f--)s[f]/=t;return je(s)}function Ft(e){return e.isPrimitive!=null}function Mn(e){return Ut(Ft(e)?[e.width,e.depth,e.height]:e)?null:"Symbol sizes may not be negative values"}function Ut(e){const n=o=>o==null||o>=0;return Array.isArray(e)?e.every(n):n(e)}function Sn(e,n,o,t=Ot()){return e&&We(t,t,-e/180*Math.PI),n&&et(t,t,n/180*Math.PI),o&&tt(t,t,o/180*Math.PI),t}function Tn(e,n,o){if(o.minDemResolution!=null)return o.minDemResolution;const t=Xe(n),s=Ye(e)*t,f=Ze(e)*t,r=Qe(e)*(n.isGeographic?1:t);return s===0&&f===0&&r===0?o.minDemResolutionForPoints:.01*Math.max(s,f,r)}const Gt=.5;function bn(e,n){e.include(ot),e.attributes.add(x.POSITION,"vec3"),e.attributes.add(x.NORMAL,"vec3"),e.attributes.add(x.CENTEROFFSETANDDISTANCE,"vec4");const o=e.vertex;st(o,n),rt(o,n),o.uniforms.add(new $e("viewport",t=>t.camera.fullViewport),new at("polygonOffset",t=>t.shaderPolygonOffset),new Oe("cameraGroundRelative",t=>t.camera.aboveGround?1:-1)),n.hasVerticalOffset&&lt(o),o.constants.add("smallOffsetAngle","float",.984807753012208),o.code.add(N`struct ProjectHUDAux {
vec3 posModel;
vec3 posView;
vec3 vnormal;
float distanceToCamera;
float absCosAngle;
};`),o.code.add(N`
    float applyHUDViewDependentPolygonOffset(float pointGroundDistance, float absCosAngle, inout vec3 posView) {
      float pointGroundSign = ${n.terrainDepthTest?N.float(0):N`sign(pointGroundDistance)`};
      if (pointGroundSign == 0.0) {
        pointGroundSign = cameraGroundRelative;
      }

      // cameraGroundRelative is -1 if camera is below ground, 1 if above ground
      // groundRelative is 1 if both camera and symbol are on the same side of the ground, -1 otherwise
      float groundRelative = cameraGroundRelative * pointGroundSign;

      // view angle dependent part of polygon offset emulation: we take the absolute value because the sign that is
      // dropped is instead introduced using the ground-relative position of the symbol and the camera
      if (polygonOffset > .0) {
        float cosAlpha = clamp(absCosAngle, 0.01, 1.0);
        float tanAlpha = sqrt(1.0 - cosAlpha * cosAlpha) / cosAlpha;
        float factor = (1.0 - tanAlpha / viewport[2]);

        // same side of the terrain
        if (groundRelative > 0.0) {
          posView *= factor;
        }
        // opposite sides of the terrain
        else {
          posView /= factor;
        }
      }

      return groundRelative;
    }
  `),n.draped&&!n.hasVerticalOffset||it(o),n.draped||(o.uniforms.add(new Oe("perDistancePixelRatio",t=>Math.tan(t.camera.fovY/2)/(t.camera.fullViewport[2]/2))),o.code.add(N`
    void applyHUDVerticalGroundOffset(vec3 normalModel, inout vec3 posModel, inout vec3 posView) {
      float distanceToCamera = length(posView);

      // Compute offset in world units for a half pixel shift
      float pixelOffset = distanceToCamera * perDistancePixelRatio * ${N.float(Gt)};

      // Apply offset along normal in the direction away from the ground surface
      vec3 modelOffset = normalModel * cameraGroundRelative * pixelOffset;

      // Apply the same offset also on the view space position
      vec3 viewOffset = (viewNormal * vec4(modelOffset, 1.0)).xyz;

      posModel += modelOffset;
      posView += viewOffset;
    }
  `)),n.screenCenterOffsetUnitsEnabled&&ct(o),n.hasScreenSizePerspective&&ut(o),o.code.add(N`
    vec4 projectPositionHUD(out ProjectHUDAux aux) {
      vec3 centerOffset = centerOffsetAndDistance.xyz;
      float pointGroundDistance = centerOffsetAndDistance.w;

      aux.posModel = position;
      aux.posView = (view * vec4(aux.posModel, 1.0)).xyz;
      aux.vnormal = normal;
      ${n.draped?"":"applyHUDVerticalGroundOffset(aux.vnormal, aux.posModel, aux.posView);"}

      // Screen sized offset in world space, used for example for line callouts
      // Note: keep this implementation in sync with the CPU implementation, see
      //   - MaterialUtil.verticalOffsetAtDistance
      //   - HUDMaterial.applyVerticalOffsetTransformation

      aux.distanceToCamera = length(aux.posView);

      vec3 viewDirObjSpace = normalize(cameraPosition - aux.posModel);
      float cosAngle = dot(aux.vnormal, viewDirObjSpace);

      aux.absCosAngle = abs(cosAngle);

      ${n.hasScreenSizePerspective&&(n.hasVerticalOffset||n.screenCenterOffsetUnitsEnabled)?"vec3 perspectiveFactor = screenSizePerspectiveScaleFactor(aux.absCosAngle, aux.distanceToCamera, screenSizePerspectiveAlignment);":""}

      ${n.hasVerticalOffset?n.hasScreenSizePerspective?"float verticalOffsetScreenHeight = applyScreenSizePerspectiveScaleFactorFloat(verticalOffset.x, perspectiveFactor);":"float verticalOffsetScreenHeight = verticalOffset.x;":""}

      ${n.hasVerticalOffset?N`
            float worldOffset = clamp(verticalOffsetScreenHeight * verticalOffset.y * aux.distanceToCamera, verticalOffset.z, verticalOffset.w);
            vec3 modelOffset = aux.vnormal * worldOffset;
            aux.posModel += modelOffset;
            vec3 viewOffset = (viewNormal * vec4(modelOffset, 1.0)).xyz;
            aux.posView += viewOffset;
            // Since we elevate the object, we need to take that into account
            // in the distance to ground
            pointGroundDistance += worldOffset;`:""}

      float groundRelative = applyHUDViewDependentPolygonOffset(pointGroundDistance, aux.absCosAngle, aux.posView);

      ${n.screenCenterOffsetUnitsEnabled?"":N`
            // Apply x/y in view space, but z in screen space (i.e. along posView direction)
            aux.posView += vec3(centerOffset.x, centerOffset.y, 0.0);

            // Same material all have same z != 0.0 condition so should not lead to
            // branch fragmentation and will save a normalization if it's not needed
            if (centerOffset.z != 0.0) {
              aux.posView -= normalize(aux.posView) * centerOffset.z;
            }
          `}

      vec4 posProj = proj * vec4(aux.posView, 1.0);

      ${n.screenCenterOffsetUnitsEnabled?n.hasScreenSizePerspective?"float centerOffsetY = applyScreenSizePerspectiveScaleFactorFloat(centerOffset.y, perspectiveFactor);":"float centerOffsetY = centerOffset.y;":""}

      ${n.screenCenterOffsetUnitsEnabled?"posProj.xy += vec2(centerOffset.x, centerOffsetY) * pixelRatio * 2.0 / viewport.zw * posProj.w;":""}

      // constant part of polygon offset emulation
      posProj.z -= groundRelative * polygonOffset * posProj.w;
      return posProj;
    }
  `)}function Et(e){e.uniforms.add(new ft("alignPixelEnabled",n=>n.alignPixelEnabled)),e.code.add(N`vec4 alignToPixelCenter(vec4 clipCoord, vec2 widthHeight) {
if (!alignPixelEnabled)
return clipCoord;
vec2 xy = vec2(0.500123) + 0.5 * clipCoord.xy / clipCoord.w;
vec2 pixelSz = vec2(1.0) / widthHeight;
vec2 ij = (floor(xy * widthHeight) + vec2(0.5)) * pixelSz;
vec2 result = (ij * 2.0 - vec2(1.0)) * clipCoord.w;
return vec4(result, clipCoord.zw);
}`),e.code.add(N`vec4 alignToPixelOrigin(vec4 clipCoord, vec2 widthHeight) {
if (!alignPixelEnabled)
return clipCoord;
vec2 xy = vec2(0.5) + 0.5 * clipCoord.xy / clipCoord.w;
vec2 pixelSz = vec2(1.0) / widthHeight;
vec2 ij = floor((xy + 0.5 * pixelSz) * widthHeight) * pixelSz;
vec2 result = (ij * 2.0 - vec2(1.0)) * clipCoord.w;
return vec4(result, clipCoord.zw);
}`)}function In(e){e.vertex.uniforms.add(new Oe("renderTransparentlyOccludedHUD",n=>n.hudRenderStyle===ce.Occluded?1:n.hudRenderStyle===ce.NotOccluded?0:.75),new $e("viewport",n=>n.camera.fullViewport),new ht("hudVisibilityTexture",n=>{var o;return(o=n.hudVisibility)==null?void 0:o.getTexture()})),e.vertex.include(Et),e.vertex.code.add(N`bool testHUDVisibility(vec4 posProj) {
vec4 posProjCenter = alignToPixelCenter(posProj, viewport.zw);
vec4 occlusionPixel = texture(hudVisibilityTexture, .5 + .5 * posProjCenter.xy / posProjCenter.w);
if (renderTransparentlyOccludedHUD > 0.5) {
return occlusionPixel.r * occlusionPixel.g > 0.0 && occlusionPixel.g * renderTransparentlyOccludedHUD < 1.0;
}
return occlusionPixel.r * occlusionPixel.g > 0.0 && occlusionPixel.g == 1.0;
}`)}export{An as A,ln as B,Pn as D,Tn as E,an as F,Se as M,On as O,yn as S,Mn as U,Ut as Z,ce as a,Et as b,Nt as c,tn as d,Gt as e,on as f,cn as g,dn as h,pn as i,xn as j,hn as k,rn as l,vn as m,In as n,Sn as o,zt as p,gn as q,sn as r,fn as s,nn as t,bn as u,mn as v,wn as w,un as x};
