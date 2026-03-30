import{h7 as We,h9 as et,l7 as Bt,cY as k,dy as Ge,a0 as Me,u8 as kt,dx as H,cX as xe,Q as Ht,aD as q,n as x,df as Jt,dl as tt,iP as Gt,ft as Zt,J as S,tE as Yt,an as qt,jA as Xt,f2 as it,p8 as Te,c9 as Ie,ad as Et,pq as Qt,cW as ue,ap as rt,dv as Pe,dt as Kt,oP as ei,uh as se,iU as ti,bP as Ve,l6 as ii,bg as ri,T as ai,b$ as si,uj as ni}from"./Map-BQLhjbmA.js";import{t as oi}from"./orientedBoundingBox-DcTINEB_.js";import{aK as At,l as Ze,aL as li,aM as ci,aj as Rt,ak as xt,al as Ct,$ as T,e as Y,H as _e,aN as at,a4 as di,c as pi,g as Ye,w as qe,G as ui,a9 as Be,aO as hi,a5 as fi,a8 as mi,a as vi,E as gi,aP as Si,o as Ti,a6 as _i,a7 as bi,aa as yi,an as he,P as Oi,Q as Ei,V as st,aQ as Ai,ab as nt,ac as Ri,ad as ot,af as xi,ag as Ci,ah as Di,ai as Li,aR as Ii,aS as lt,aT as Pi,aU as $i,aV as wi,A as B,v as Ni,W as ae,y as ke,ap as Ui,aq as zi,f as Fi}from"./Geometry-DoKVT0Vd.js";import{o as ji,e as Re}from"./mat4f64-Dk4dwAN8.js";import{U as ct,E as Wi}from"./sphere-CiI9bFGK.js";import{m as Mi,p as be,V as M,O as dt,M as De}from"./plane-CjbRhljv.js";import{t as Vi}from"./basicInterfaces-CZwQPxTp.js";import{s as Bi,m as ki,H as Hi}from"./InterleavedLayout-DlhVkPiH.js";import{E as Ji,e as u}from"./VertexAttribute-Cq4MnHjR.js";import{t as Dt,f as Gi,r as Zi,d as Yi}from"./dehydratedFeatureUtils-DqcjlN_y.js";import{b as qi,j as ye}from"./Octree-B9yqB3a-.js";import{M as Xi,b as $e,B as Qi,v as Lt}from"./lineSegment-Bym8qxPj.js";import{n as ne,u as pe,i as Ki,S as er,C as pt,e as tr}from"./ShaderOutput-DnYY5J1_.js";import{_ as ir}from"./index-BNgLIX9i.js";import{B as Oe,g as we,c as ut}from"./renderState-AMdrXmCR.js";import{m as rr}from"./computeTranslationToOriginAndRotation-CTcGM2Bo.js";import{u as ar}from"./hydratedFeatures-CzDeTQes.js";import{n as p,t as sr}from"./glsl-BH37Aalp.js";import"./BindType-BBwFZqyN.js";import"./floatRGBA-DHj6LS2z.js";import{i as nr}from"./ShaderBuilder-2aadgXn4.js";class _a{constructor(e,i=null,r=0){this.array=e,this.spatialReference=i,this.offset=r}}function It(t){return"array"in t}function Ee(t,e,i="ground"){if(Dt(e))return t.getElevation(e.x,e.y,e.z||0,e.spatialReference,i);if(It(e)){let r=e.offset;return t.getElevation(e.array[r++],e.array[r++],e.array[r]||0,e.spatialReference??t.spatialReference,i)}return t.getElevation(e[0],e[1],e[2]||0,t.spatialReference,i)}let or=class extends At{get geometries(){return this._geometries}get transformation(){return this._transformation??ji}set transformation(e){this._transformation=We(this._transformation??Re(),e),this._invalidateBoundingVolume(),this._emit("transformationChanged",this)}get shaderTransformation(){return this._shaderTransformation}set shaderTransformation(e){this._shaderTransformation=e?We(this._shaderTransformation??Re(),e):null,this._invalidateBoundingVolume(),this._emit("shaderTransformationChanged",this)}get effectiveTransformation(){return this.shaderTransformation??this.transformation}constructor(e={}){super(),this.type=Ze.Object,this._shaderTransformation=null,this._parentLayer=null,this._visible=!0,this.castShadow=e.castShadow??!0,this.usesVerticalDistanceToGround=e.usesVerticalDistanceToGround??!1,this.graphicUid=e.graphicUid,this.layerUid=e.layerUid,e.isElevationSource&&(this.lastValidElevationBB=new Pt),this._geometries=e.geometries?Array.from(e.geometries):new Array}dispose(){this._geometries.length=0}get parentLayer(){return this._parentLayer}set parentLayer(e){Bi(this._parentLayer==null||e==null,"Object3D can only be added to a single Layer"),this._parentLayer=e}addGeometry(e){e.visible=this._visible,this._geometries.push(e),this._emit("geometryAdded",{object:this,geometry:e}),this._invalidateBoundingVolume()}removeGeometry(e){const i=this._geometries.splice(e,1)[0];i&&(this._emit("geometryRemoved",{object:this,geometry:i}),this._invalidateBoundingVolume())}removeAllGeometries(){for(;this._geometries.length>0;)this.removeGeometry(0)}geometryVertexAttributeUpdated(e,i,r=!1){this._emit("attributesChanged",{object:this,geometry:e,attribute:i,sync:r}),Ji(i)&&this._invalidateBoundingVolume()}get visible(){return this._visible}set visible(e){if(this._visible!==e){this._visible=e;for(const i of this._geometries)i.visible=this._visible;this._emit("visibilityChanged",this)}}maskOccludee(){const e=new li;for(const i of this._geometries)i.occludees=Gi(i.occludees,e);return this._emit("occlusionChanged",this),e}removeOcclude(e){for(const i of this._geometries)i.occludees=Zi(i.occludees,e);this._emit("occlusionChanged",this)}highlight(e){const i=new ci(e);for(const r of this._geometries)r.addHighlight(i);return this._emit("highlightChanged",this),i}removeHighlight(e){for(const i of this._geometries)i.removeHighlight(e);this._emit("highlightChanged",this)}removeStateID(e){e.channel===Vi.Highlight?this.removeHighlight(e):this.removeOcclude(e)}getCombinedStaticTransformation(e,i){return et(i,this.transformation,e.transformation)}getCombinedShaderTransformation(e,i=Re()){return et(i,this.effectiveTransformation,e.transformation)}get boundingVolumeWorldSpace(){return this._bvWorldSpace||(this._bvWorldSpace=this._bvWorldSpace||new ht,this._validateBoundingVolume(this._bvWorldSpace,fe.WorldSpace)),this._bvWorldSpace}get boundingVolumeObjectSpace(){return this._bvObjectSpace||(this._bvObjectSpace=this._bvObjectSpace||new ht,this._validateBoundingVolume(this._bvObjectSpace,fe.ObjectSpace)),this._bvObjectSpace}_validateBoundingVolume(e,i){const r=i===fe.ObjectSpace;for(const a of this._geometries){const s=a.boundingInfo;s&&lr(s,e,r?a.transformation:this.getCombinedShaderTransformation(a))}Bt(ct(e.bounds),e.min,e.max,.5);for(const a of this._geometries){const s=a.boundingInfo;if(s==null)continue;const l=r?a.transformation:this.getCombinedShaderTransformation(a),o=Mi(l);k(ft,s.center,l);const n=Ge(ft,ct(e.bounds)),c=s.radius*o;e.bounds[3]=Math.max(e.bounds[3],n+c)}}_invalidateBoundingVolume(){var i;const e=(i=this._bvWorldSpace)==null?void 0:i.bounds;this._bvObjectSpace=this._bvWorldSpace=void 0,this._parentLayer&&e&&this._parentLayer.notifyObjectBBChanged(this,e)}_emit(e,i){this._parentLayer&&this._parentLayer.events.emit(e,i)}get test(){}};class Pt{constructor(){this.min=Me(Number.MAX_VALUE,Number.MAX_VALUE,Number.MAX_VALUE),this.max=Me(-Number.MAX_VALUE,-Number.MAX_VALUE,-Number.MAX_VALUE)}isEmpty(){return this.max[0]<this.min[0]&&this.max[1]<this.min[1]&&this.max[2]<this.min[2]}}class ht extends Pt{constructor(){super(...arguments),this.bounds=Wi()}}function lr(t,e,i){const r=t.bbMin,a=t.bbMax;if(kt(i)){const s=H(cr,i[12],i[13],i[14]);xe(z,r,s),xe(j,a,s);for(let l=0;l<3;++l)e.min[l]=Math.min(e.min[l],z[l]),e.max[l]=Math.max(e.max[l],j[l])}else if(k(z,r,i),Ht(r,a))for(let s=0;s<3;++s)e.min[s]=Math.min(e.min[s],z[s]),e.max[s]=Math.max(e.max[s],z[s]);else{k(j,a,i);for(let s=0;s<3;++s)e.min[s]=Math.min(e.min[s],z[s],j[s]),e.max[s]=Math.max(e.max[s],z[s],j[s]);for(let s=0;s<3;++s){q(z,r),q(j,a),z[s]=a[s],j[s]=r[s],k(z,z,i),k(j,j,i);for(let l=0;l<3;++l)e.min[l]=Math.min(e.min[l],z[l],j[l]),e.max[l]=Math.max(e.max[l],z[l],j[l])}}}const cr=x(),z=x(),j=x(),ft=x();var fe;(function(t){t[t.WorldSpace=0]="WorldSpace",t[t.ObjectSpace=1]="ObjectSpace"})(fe||(fe={}));var Ce;(function(t){t[t.ASYNC=0]="ASYNC",t[t.SYNC=1]="SYNC"})(Ce||(Ce={}));const dr=["layerObjectAdded","layerObjectRemoved","layerObjectsAdded","layerObjectsRemoved","transformationChanged","shaderTransformationChanged","visibilityChanged","occlusionChanged","highlightChanged","geometryAdded","geometryRemoved","attributesChanged"];let pr=class extends At{constructor(e,i,r=""){super(),this.stage=e,this.apiLayerUid=r,this.type=Ze.Layer,this.events=new Jt,this.visible=!0,this.sliceable=!1,this._objectsAdded=new tt,this._handles=new Gt,this._objects=new tt,this._pickable=!0,this.visible=(i==null?void 0:i.visible)??!0,this._pickable=(i==null?void 0:i.pickable)??!0,this.updatePolicy=(i==null?void 0:i.updatePolicy)??Ce.ASYNC,this._disableOctree=(i==null?void 0:i.disableOctree)??!1,e.add(this);for(const a of dr)this._handles.add(this.events.on(a,s=>e.handleEvent(a,s)))}destroy(){this._handles.size&&(this._handles.destroy(),this.stage.remove(this),this.invalidateSpatialQueryAccelerator())}get objects(){return this._objects}set pickable(e){this._pickable=e}get pickable(){return this._pickable&&this.visible}add(e){this._objects.push(e),e.parentLayer=this,this.events.emit("layerObjectAdded",{layer:this,object:e}),this._octree!=null&&this._objectsAdded.push(e)}remove(e){this._objects.removeUnordered(e)&&(e.parentLayer=null,this.events.emit("layerObjectRemoved",{layer:this,object:e}),this._octree!=null&&(this._objectsAdded.removeUnordered(e)||this._octree.remove([e])))}addMany(e){this._objects.pushArray(e);for(const i of e)i.parentLayer=this;this.events.emit("layerObjectsAdded",{layer:this,objects:e}),this._octree!=null&&this._objectsAdded.pushArray(e)}removeMany(e){const i=new Array;if(this._objects.removeUnorderedMany(e,e.length,i),i.length!==0){for(const r of i)r.parentLayer=null;if(this.events.emit("layerObjectsRemoved",{layer:this,objects:i}),this._octree!=null){for(let r=0;r<i.length;)this._objectsAdded.removeUnordered(i[r])?(i[r]=i[i.length-1],i.length-=1):++r;this._octree.remove(i)}}}sync(){this.updatePolicy!==Ce.SYNC&&this.stage.syncLayer(this.id)}notifyObjectBBChanged(e,i){this._octree==null||this._objectsAdded.includes(e)||this._octree.update(e,i)}getSpatialQueryAccelerator(){return this._octree==null&&this._objects.length>50&&!this._disableOctree?(this._octree=new qi(e=>e.boundingVolumeWorldSpace.bounds),this._octree.add(this._objects.data,this._objects.length)):this._octree!=null&&this._objectsAdded.length>0&&(this._octree.add(this._objectsAdded.data,this._objectsAdded.length),this._objectsAdded.clear()),this._octree}invalidateSpatialQueryAccelerator(){this._octree=Zt(this._octree),this._objectsAdded.clear()}};var te,me;(function(t){t[t.Draped=0]="Draped",t[t.Screen=1]="Screen",t[t.World=2]="World",t[t.COUNT=3]="COUNT"})(te||(te={})),function(t){t[t.Center=0]="Center",t[t.Tip=1]="Tip",t[t.COUNT=2]="COUNT"}(me||(me={}));let F=class extends Rt{constructor(){super(...arguments),this.space=te.Screen,this.anchor=me.Center,this.occluder=!1,this.writeDepth=!1,this.hideOnShortSegments=!1,this.hasCap=!1,this.hasTip=!1,this.vvSize=!1,this.vvColor=!1,this.vvOpacity=!1,this.hasOccludees=!1,this.terrainDepthTest=!1,this.cullAboveTerrain=!1,this.textureCoordinateType=xt.None,this.emissionSource=Ct.None,this.discardInvisibleFragments=!0,this.occlusionPass=!1,this.hasVvInstancing=!0,this.hasSliceTranslatedView=!0,this.objectAndLayerIdColorInstanced=!1}get draped(){return this.space===te.Draped}};S([T({count:te.COUNT})],F.prototype,"space",void 0),S([T({count:me.COUNT})],F.prototype,"anchor",void 0),S([T()],F.prototype,"occluder",void 0),S([T()],F.prototype,"writeDepth",void 0),S([T()],F.prototype,"hideOnShortSegments",void 0),S([T()],F.prototype,"hasCap",void 0),S([T()],F.prototype,"hasTip",void 0),S([T()],F.prototype,"vvSize",void 0),S([T()],F.prototype,"vvColor",void 0),S([T()],F.prototype,"vvOpacity",void 0),S([T()],F.prototype,"hasOccludees",void 0),S([T()],F.prototype,"terrainDepthTest",void 0),S([T()],F.prototype,"cullAboveTerrain",void 0);const mt=8;function ur(t,e){const i=t.vertex;i.uniforms.add(new Y("intrinsicWidth",r=>r.width)),e.vvSize?(t.attributes.add(u.SIZEFEATUREATTRIBUTE,"float"),i.uniforms.add(new _e("vvSizeMinSize",r=>r.vvSize.minSize),new _e("vvSizeMaxSize",r=>r.vvSize.maxSize),new _e("vvSizeOffset",r=>r.vvSize.offset),new _e("vvSizeFactor",r=>r.vvSize.factor)),i.code.add(p`float getSize() {
return intrinsicWidth * clamp(vvSizeOffset + sizeFeatureAttribute * vvSizeFactor, vvSizeMinSize, vvSizeMaxSize).x;
}`)):(t.attributes.add(u.SIZE,"float"),i.code.add(p`float getSize(){
return intrinsicWidth * size;
}`)),e.vvOpacity?(t.attributes.add(u.OPACITYFEATUREATTRIBUTE,"float"),i.constants.add("vvOpacityNumber","int",8),i.uniforms.add(new at("vvOpacityValues",r=>r.vvOpacity.values,mt),new at("vvOpacityOpacities",r=>r.vvOpacity.opacityValues,mt)),i.code.add(p`float interpolateOpacity( float value ){
if (value <= vvOpacityValues[0]) {
return vvOpacityOpacities[0];
}
for (int i = 1; i < vvOpacityNumber; ++i) {
if (vvOpacityValues[i] >= value) {
float f = (value - vvOpacityValues[i-1]) / (vvOpacityValues[i] - vvOpacityValues[i-1]);
return mix(vvOpacityOpacities[i-1], vvOpacityOpacities[i], f);
}
}
return vvOpacityOpacities[vvOpacityNumber - 1];
}
vec4 applyOpacity( vec4 color ){
return vec4(color.xyz, interpolateOpacity(opacityFeatureAttribute));
}`)):i.code.add(p`vec4 applyOpacity( vec4 color ){
return color;
}`),e.vvColor?(t.include(di,e),t.attributes.add(u.COLORFEATUREATTRIBUTE,"float"),i.code.add(p`vec4 getColor(){
return applyOpacity(interpolateVVColor(colorFeatureAttribute));
}`)):(t.attributes.add(u.COLOR,"vec4"),i.code.add(p`vec4 getColor(){
return applyOpacity(color);
}`))}function $t(t){return t.pattern.map(e=>Math.round(e*t.pixelRatio))}function hr(t){if(t==null)return 1;const e=$t(t);return Math.floor(e.reduce((i,r)=>i+r))}function fr(t){return $t(t).reduce((e,i)=>Math.max(e,i))}function mr(t){return t==null?Yt:t.length===4?t:qt(vr,t[0],t[1],t[2],1)}const vr=Xt();function gr(t,e){if(!e.stippleEnabled)return void t.fragment.code.add(p`float getStippleAlpha() { return 1.0; }
void discardByStippleAlpha(float stippleAlpha, float threshold) {}
vec4 blendStipple(vec4 color, float stippleAlpha) { return color; }`);const i=!(e.draped&&e.stipplePreferContinuous),{vertex:r,fragment:a}=t;a.include(Yi),e.draped||(pi(r,e),r.uniforms.add(new Ye("worldToScreenPerDistanceRatio",({camera:s})=>1/s.perScreenPixelRatio)).code.add(p`float computeWorldToScreenRatio(vec3 segmentCenter) {
float segmentDistanceToCamera = length(segmentCenter - cameraPosition);
return worldToScreenPerDistanceRatio / segmentDistanceToCamera;
}`)),t.varyings.add("vStippleDistance","float"),t.varyings.add("vStippleDistanceLimits","vec2"),t.varyings.add("vStipplePatternStretch","float"),r.code.add(p`
    float discretizeWorldToScreenRatio(float worldToScreenRatio) {
      float step = ${p.float(Tr)};

      float discreteWorldToScreenRatio = log(worldToScreenRatio);
      discreteWorldToScreenRatio = ceil(discreteWorldToScreenRatio / step) * step;
      discreteWorldToScreenRatio = exp(discreteWorldToScreenRatio);
      return discreteWorldToScreenRatio;
    }
  `),r.code.add(p`vec2 computeStippleDistanceLimits(float startPseudoScreen, float segmentLengthPseudoScreen, float segmentLengthScreen, float patternLength) {`),r.code.add(p`
    if (segmentLengthPseudoScreen >= ${i?"patternLength":"1e4"}) {
  `),qe(r),r.code.add(p`float repetitions = segmentLengthScreen / (patternLength * pixelRatio);
float flooredRepetitions = max(1.0, floor(repetitions + 0.5));
float segmentLengthScreenRounded = flooredRepetitions * patternLength;
float stretch = repetitions / flooredRepetitions;
vStipplePatternStretch = max(0.75, stretch);
return vec2(0.0, segmentLengthScreenRounded);
}
return vec2(startPseudoScreen, startPseudoScreen + segmentLengthPseudoScreen);
}`),a.uniforms.add(new ui("stipplePatternTexture",s=>s.stippleTexture),new Y("stipplePatternSDFNormalizer",s=>Sr(s.stipplePattern)),new Y("stipplePatternPixelSizeInv",s=>1/wt(s))),e.stippleOffColorEnabled&&a.uniforms.add(new Be("stippleOffColor",s=>mr(s.stippleOffColor))),a.code.add(p`float getStippleSDF(out bool isClamped) {
float stippleDistanceClamped = clamp(vStippleDistance, vStippleDistanceLimits.x, vStippleDistanceLimits.y);
vec2 aaCorrectedLimits = vStippleDistanceLimits + vec2(1.0, -1.0) / gl_FragCoord.w;
isClamped = vStippleDistance < aaCorrectedLimits.x || vStippleDistance > aaCorrectedLimits.y;
float u = stippleDistanceClamped * gl_FragCoord.w * stipplePatternPixelSizeInv * vLineSizeInv;
u = fract(u);
float encodedSDF = rgbaTofloat(texture(stipplePatternTexture, vec2(u, 0.5)));
float sdf = (encodedSDF * 2.0 - 1.0) * stipplePatternSDFNormalizer;
return (sdf - 0.5) * vStipplePatternStretch + 0.5;
}
float getStippleSDF() {
bool ignored;
return getStippleSDF(ignored);
}
float getStippleAlpha() {
bool isClamped;
float stippleSDF = getStippleSDF(isClamped);
float antiAliasedResult = clamp(stippleSDF * vLineWidth + 0.5, 0.0, 1.0);
return isClamped ? floor(antiAliasedResult + 0.5) : antiAliasedResult;
}`),a.code.add(p`
    void discardByStippleAlpha(float stippleAlpha, float threshold) {
     ${sr(!e.stippleOffColorEnabled,"if (stippleAlpha < threshold) { discard; }")}
    }

    vec4 blendStipple(vec4 color, float stippleAlpha) {
      return ${e.stippleOffColorEnabled?"mix(color, stippleOffColor, stippleAlpha)":"vec4(color.rgb, color.a * stippleAlpha)"};
    }
  `)}function Sr(t){return t?(Math.floor(.5*(fr(t)-1))+.5)/t.pixelRatio:1}function wt(t){const e=t.stipplePattern;return e?hr(t.stipplePattern)/e.pixelRatio:1}const Tr=.4,Nt=64,_r=Nt/2,br=_r/5,yr=Nt/br,Ea=.25;function Or(t,e){const i=t.vertex;qe(i),i.uniforms.get("markerScale")==null&&i.constants.add("markerScale","float",1),i.constants.add("markerSizePerLineWidth","float",yr).code.add(p`float getLineWidth() {
return max(getSize(), 1.0) * pixelRatio;
}
float getScreenMarkerSize() {
return markerSizePerLineWidth * markerScale * getLineWidth();
}`),e.space===te.World&&(i.constants.add("maxSegmentLengthFraction","float",.45),i.uniforms.add(new Ye("perRenderPixelRatio",r=>r.camera.perRenderPixelRatio)),i.code.add(p`bool areWorldMarkersHidden(vec4 pos, vec4 other) {
vec3 midPoint = mix(pos.xyz, other.xyz, 0.5);
float distanceToCamera = length(midPoint);
float screenToWorldRatio = perRenderPixelRatio * distanceToCamera * 0.5;
float worldMarkerSize = getScreenMarkerSize() * screenToWorldRatio;
float segmentLen = length(pos.xyz - other.xyz);
return worldMarkerSize > maxSegmentLengthFraction * segmentLen;
}
float getWorldMarkerSize(vec4 pos) {
float distanceToCamera = length(pos.xyz);
float screenToWorldRatio = perRenderPixelRatio * distanceToCamera * 0.5;
return getScreenMarkerSize() * screenToWorldRatio;
}`))}var ie;(function(t){t[t.BUTT=0]="BUTT",t[t.SQUARE=1]="SQUARE",t[t.ROUND=2]="ROUND",t[t.COUNT=3]="COUNT"})(ie||(ie={}));let E=class extends Rt{constructor(){super(...arguments),this.capType=ie.BUTT,this.hasPolygonOffset=!1,this.writeDepth=!1,this.draped=!1,this.stippleEnabled=!1,this.stippleOffColorEnabled=!1,this.stipplePreferContinuous=!0,this.roundJoins=!1,this.applyMarkerOffset=!1,this.vvSize=!1,this.vvColor=!1,this.vvOpacity=!1,this.falloffEnabled=!1,this.innerColorEnabled=!1,this.hasOccludees=!1,this.occluder=!1,this.terrainDepthTest=!1,this.cullAboveTerrain=!1,this.wireframe=!1,this.discardInvisibleFragments=!1,this.objectAndLayerIdColorInstanced=!1,this.textureCoordinateType=xt.None,this.emissionSource=Ct.None,this.occlusionPass=!1,this.hasVvInstancing=!0,this.hasSliceTranslatedView=!0}};S([T({count:ie.COUNT})],E.prototype,"capType",void 0),S([T()],E.prototype,"hasPolygonOffset",void 0),S([T()],E.prototype,"writeDepth",void 0),S([T()],E.prototype,"draped",void 0),S([T()],E.prototype,"stippleEnabled",void 0),S([T()],E.prototype,"stippleOffColorEnabled",void 0),S([T()],E.prototype,"stipplePreferContinuous",void 0),S([T()],E.prototype,"roundJoins",void 0),S([T()],E.prototype,"applyMarkerOffset",void 0),S([T()],E.prototype,"vvSize",void 0),S([T()],E.prototype,"vvColor",void 0),S([T()],E.prototype,"vvOpacity",void 0),S([T()],E.prototype,"falloffEnabled",void 0),S([T()],E.prototype,"innerColorEnabled",void 0),S([T()],E.prototype,"hasOccludees",void 0),S([T()],E.prototype,"occluder",void 0),S([T()],E.prototype,"terrainDepthTest",void 0),S([T()],E.prototype,"cullAboveTerrain",void 0),S([T()],E.prototype,"wireframe",void 0),S([T()],E.prototype,"discardInvisibleFragments",void 0),S([T()],E.prototype,"objectAndLayerIdColorInstanced",void 0);const ve=1;function Ut(t){const e=new nr,{attributes:i,varyings:r,vertex:a,fragment:s}=e,{applyMarkerOffset:l,draped:o,output:n,capType:c,stippleEnabled:d,falloffEnabled:f,roundJoins:m,wireframe:h,innerColorEnabled:O}=t;e.include(hi),e.include(ur,t),e.include(gr,t),e.include(fi,t),e.include(mi,t);const y=l&&!o;y&&(a.uniforms.add(new Y("markerScale",v=>v.markerScale)),e.include(Or,{space:te.World})),vi(a,t),a.uniforms.add(new gi("inverseProjectionMatrix",v=>v.camera.inverseProjectionMatrix),new Si("nearFar",v=>v.camera.nearFar),new Y("miterLimit",v=>v.join!=="miter"?0:v.miterLimit),new Ti("viewport",v=>v.camera.fullViewport)),a.constants.add("LARGE_HALF_FLOAT","float",65500),i.add(u.POSITION,"vec3"),i.add(u.PREVPOSITION,"vec3"),i.add(u.NEXTPOSITION,"vec3"),i.add(u.SUBDIVISIONFACTOR,"float"),i.add(u.UV0,"vec2"),r.add("vColor","vec4"),r.add("vpos","vec3"),r.add("vLineDistance","float"),r.add("vLineWidth","float");const C=d;C&&r.add("vLineSizeInv","float");const A=c===ie.ROUND,b=d&&A,N=f||b;N&&r.add("vLineDistanceNorm","float"),A&&(r.add("vSegmentSDF","float"),r.add("vReverseSegmentSDF","float")),a.code.add(p`vec2 perpendicular(vec2 v) {
return vec2(v.y, -v.x);
}
float interp(float ncp, vec4 a, vec4 b) {
return (-ncp - a.z) / (b.z - a.z);
}
vec2 rotate(vec2 v, float a) {
float s = sin(a);
float c = cos(a);
mat2 m = mat2(c, -s, s, c);
return m * v;
}`),a.code.add(p`vec4 projectAndScale(vec4 pos) {
vec4 posNdc = proj * pos;
posNdc.xy *= viewport.zw / posNdc.w;
return posNdc;
}`),a.code.add(p`void clipAndTransform(inout vec4 pos, inout vec4 prev, inout vec4 next, in bool isStartVertex) {
float vnp = nearFar[0] * 0.99;
if(pos.z > -nearFar[0]) {
if (!isStartVertex) {
if(prev.z < -nearFar[0]) {
pos = mix(prev, pos, interp(vnp, prev, pos));
next = pos;
} else {
pos = vec4(0.0, 0.0, 0.0, 1.0);
}
} else {
if(next.z < -nearFar[0]) {
pos = mix(pos, next, interp(vnp, pos, next));
prev = pos;
} else {
pos = vec4(0.0, 0.0, 0.0, 1.0);
}
}
} else {
if (prev.z > -nearFar[0]) {
prev = mix(pos, prev, interp(vnp, pos, prev));
}
if (next.z > -nearFar[0]) {
next = mix(next, pos, interp(vnp, next, pos));
}
}
forwardViewPosDepth(pos.xyz);
pos = projectAndScale(pos);
next = projectAndScale(next);
prev = projectAndScale(prev);
}`),qe(a),a.constants.add("aaWidth","float",d?0:1).main.add(p`
    // unpack values from uv0.y
    bool isStartVertex = abs(abs(uv0.y)-3.0) == 1.0;

    float coverage = 1.0;

    // Check for special value of uv0.y which is used by the Renderer when graphics
    // are removed before the VBO is recompacted. If this is the case, then we just
    // project outside of clip space.
    if (uv0.y == 0.0) {
      // Project out of clip space
      gl_Position = vec4(1e038, 1e038, 1e038, 1.0);
    }
    else {
      bool isJoin = abs(uv0.y) < 3.0;
      float lineSize = getSize();

      if (lineSize < 1.0) {
        coverage = lineSize; // convert sub-pixel coverage to alpha
        lineSize = 1.0;
      }
      lineSize += aaWidth;

      float lineWidth = lineSize * pixelRatio;
      vLineWidth = lineWidth;
      ${C?p`vLineSizeInv = 1.0 / lineSize;`:""}

      vec4 pos  = view * vec4(position, 1.0);
      vec4 prev = view * vec4(prevPosition, 1.0);
      vec4 next = view * vec4(nextPosition, 1.0);
  `),y&&a.main.add(p`vec4 other = isStartVertex ? next : prev;
bool markersHidden = areWorldMarkersHidden(pos, other);
if(!isJoin && !markersHidden) {
pos.xyz += normalize(other.xyz - pos.xyz) * getWorldMarkerSize(pos) * 0.5;
}`),a.main.add(p`clipAndTransform(pos, prev, next, isStartVertex);
vec2 left = (pos.xy - prev.xy);
vec2 right = (next.xy - pos.xy);
float leftLen = length(left);
float rightLen = length(right);`),(d||A)&&a.main.add(p`
      float isEndVertex = float(!isStartVertex);
      vec2 segmentOrigin = mix(pos.xy, prev.xy, isEndVertex);
      vec2 segment = mix(right, left, isEndVertex);
      ${A?p`vec2 segmentEnd = mix(next.xy, pos.xy, isEndVertex);`:""}
    `),a.main.add(p`left = (leftLen > 0.001) ? left/leftLen : vec2(0.0, 0.0);
right = (rightLen > 0.001) ? right/rightLen : vec2(0.0, 0.0);
vec2 capDisplacementDir = vec2(0, 0);
vec2 joinDisplacementDir = vec2(0, 0);
float displacementLen = lineWidth;
if (isJoin) {
bool isOutside = (left.x * right.y - left.y * right.x) * uv0.y > 0.0;
joinDisplacementDir = normalize(left + right);
joinDisplacementDir = perpendicular(joinDisplacementDir);
if (leftLen > 0.001 && rightLen > 0.001) {
float nDotSeg = dot(joinDisplacementDir, left);
displacementLen /= length(nDotSeg * left - joinDisplacementDir);
if (!isOutside) {
displacementLen = min(displacementLen, min(leftLen, rightLen)/abs(nDotSeg));
}
}
if (isOutside && (displacementLen > miterLimit * lineWidth)) {`),m?a.main.add(p`
        vec2 startDir = leftLen < 0.001 ? right : left;
        startDir = perpendicular(startDir);

        vec2 endDir = rightLen < 0.001 ? left : right;
        endDir = perpendicular(endDir);

        float factor = ${d?p`min(1.0, subdivisionFactor * ${p.float((ve+2)/(ve+1))})`:p`subdivisionFactor`};

        float rotationAngle = acos(clamp(dot(startDir, endDir), -1.0, 1.0));
        joinDisplacementDir = rotate(startDir, -sign(uv0.y) * factor * rotationAngle);
      `):a.main.add(p`if (leftLen < 0.001) {
joinDisplacementDir = right;
}
else if (rightLen < 0.001) {
joinDisplacementDir = left;
}
else {
joinDisplacementDir = (isStartVertex || subdivisionFactor > 0.0) ? right : left;
}
joinDisplacementDir = perpendicular(joinDisplacementDir);`);const _=c!==ie.BUTT;return a.main.add(p`
        displacementLen = lineWidth;
      }
    } else {
      // CAP handling ---------------------------------------------------
      joinDisplacementDir = isStartVertex ? right : left;
      joinDisplacementDir = perpendicular(joinDisplacementDir);

      ${_?p`capDisplacementDir = isStartVertex ? -right : left;`:""}
    }
  `),a.main.add(p`
    // Displacement (in pixels) caused by join/or cap
    vec2 dpos = joinDisplacementDir * sign(uv0.y) * displacementLen + capDisplacementDir * displacementLen;
    float lineDistNorm = sign(uv0.y) * pos.w;

    vLineDistance =  lineWidth * lineDistNorm;
    ${N?p`vLineDistanceNorm = lineDistNorm;`:""}

    pos.xy += dpos;
  `),A&&a.main.add(p`vec2 segmentDir = normalize(segment);
vSegmentSDF = (isJoin && isStartVertex) ? LARGE_HALF_FLOAT : (dot(pos.xy - segmentOrigin, segmentDir) * pos.w) ;
vReverseSegmentSDF = (isJoin && !isStartVertex) ? LARGE_HALF_FLOAT : (dot(pos.xy - segmentEnd, -segmentDir) * pos.w);`),d&&(o?a.uniforms.add(new Ye("worldToScreenRatio",v=>1/v.screenToPCSRatio)):a.main.add(p`vec3 segmentCenter = mix((nextPosition + position) * 0.5, (position + prevPosition) * 0.5, isEndVertex);
float worldToScreenRatio = computeWorldToScreenRatio(segmentCenter);`),a.main.add(p`float segmentLengthScreenDouble = length(segment);
float segmentLengthScreen = segmentLengthScreenDouble * 0.5;
float discreteWorldToScreenRatio = discretizeWorldToScreenRatio(worldToScreenRatio);
float segmentLengthRender = length(mix(nextPosition - position, position - prevPosition, isEndVertex));
vStipplePatternStretch = worldToScreenRatio / discreteWorldToScreenRatio;`),o?a.main.add(p`float segmentLengthPseudoScreen = segmentLengthScreen / pixelRatio * discreteWorldToScreenRatio / worldToScreenRatio;
float startPseudoScreen = uv0.x * discreteWorldToScreenRatio - mix(0.0, segmentLengthPseudoScreen, isEndVertex);`):a.main.add(p`float startPseudoScreen = mix(uv0.x, uv0.x - segmentLengthRender, isEndVertex) * discreteWorldToScreenRatio;
float segmentLengthPseudoScreen = segmentLengthRender * discreteWorldToScreenRatio;`),a.uniforms.add(new Y("stipplePatternPixelSize",v=>wt(v))),a.main.add(p`float patternLength = lineSize * stipplePatternPixelSize;
vStippleDistanceLimits = computeStippleDistanceLimits(startPseudoScreen, segmentLengthPseudoScreen, segmentLengthScreen, patternLength);
vStippleDistance = mix(vStippleDistanceLimits.x, vStippleDistanceLimits.y, isEndVertex);
if (segmentLengthScreenDouble >= 0.001) {
vec2 stippleDisplacement = pos.xy - segmentOrigin;
float stippleDisplacementFactor = dot(segment, stippleDisplacement) / (segmentLengthScreenDouble * segmentLengthScreenDouble);
vStippleDistance += (stippleDisplacementFactor - isEndVertex) * (vStippleDistanceLimits.y - vStippleDistanceLimits.x);
}
vStippleDistanceLimits *= pos.w;
vStippleDistance *= pos.w;
vStippleDistanceLimits = isJoin ?
vStippleDistanceLimits :
isStartVertex ?
vec2(-1e34, vStippleDistanceLimits.y) :
vec2(vStippleDistanceLimits.x, 1e34);`)),a.main.add(p`
      // Convert back into NDC
      pos.xy = (pos.xy / viewport.zw) * pos.w;

      vColor = getColor();
      vColor.a *= coverage;

      ${h&&!o?"pos.z -= 0.001 * pos.w;":""}

      // transform final position to camera space for slicing
      vpos = (inverseProjectionMatrix * pos).xyz;
      gl_Position = pos;
      forwardObjectAndLayerIdColor();
    }`),e.fragment.include(_i,t),e.include(bi,t),s.include(yi),s.main.add(p`discardBySlice(vpos);
discardByTerrainDepth();`),h?s.main.add(p`vec4 finalColor = vec4(1.0, 0.0, 1.0, 1.0);`):(A&&s.main.add(p`
        float sdf = min(vSegmentSDF, vReverseSegmentSDF);
        vec2 fragmentPosition = vec2(
          min(sdf, 0.0),
          vLineDistance
        ) * gl_FragCoord.w;

        float fragmentRadius = length(fragmentPosition);
        float fragmentCapSDF = (fragmentRadius - vLineWidth) * 0.5; // Divide by 2 to transform from double pixel scale
        float capCoverage = clamp(0.5 - fragmentCapSDF, 0.0, 1.0);

        if (capCoverage < ${p.float(he)}) {
          discard;
        }
      `),b?s.main.add(p`
      vec2 stipplePosition = vec2(
        min(getStippleSDF() * 2.0 - 1.0, 0.0),
        vLineDistanceNorm * gl_FragCoord.w
      );
      float stippleRadius = length(stipplePosition * vLineWidth);
      float stippleCapSDF = (stippleRadius - vLineWidth) * 0.5; // Divide by 2 to transform from double pixel scale
      float stippleCoverage = clamp(0.5 - stippleCapSDF, 0.0, 1.0);
      float stippleAlpha = step(${p.float(he)}, stippleCoverage);
      `):s.main.add(p`float stippleAlpha = getStippleAlpha();`),n!==ne.ObjectAndLayerIdColor&&s.main.add(p`discardByStippleAlpha(stippleAlpha, ${p.float(he)});`),s.uniforms.add(new Be("intrinsicColor",v=>v.color)),s.main.add(p`vec4 color = intrinsicColor * vColor;`),O&&(s.uniforms.add(new Be("innerColor",v=>v.innerColor??v.color),new Y("innerWidth",(v,I)=>v.innerWidth*I.camera.pixelRatio)),s.main.add(p`float distToInner = abs(vLineDistance * gl_FragCoord.w) - innerWidth;
float innerAA = clamp(0.5 - distToInner, 0.0, 1.0);
float innerAlpha = innerColor.a + color.a * (1.0 - innerColor.a);
color = mix(color, vec4(innerColor.rgb, innerAlpha), innerAA);`)),s.main.add(p`vec4 finalColor = blendStipple(color, stippleAlpha);`),f&&(s.uniforms.add(new Y("falloff",v=>v.falloff)),s.main.add(p`finalColor.a *= pow(max(0.0, 1.0 - abs(vLineDistanceNorm * gl_FragCoord.w)), falloff);`)),d||s.main.add(p`float featherStartDistance = max(vLineWidth - 2.0, 0.0);
float value = abs(vLineDistance) * gl_FragCoord.w;
float feather = (value - featherStartDistance) / (vLineWidth - featherStartDistance);
finalColor.a *= 1.0 - clamp(feather, 0.0, 1.0);`)),s.main.add(p`outputColorHighlightOID(finalColor, vpos);`),e}const Er=Object.freeze(Object.defineProperty({__proto__:null,build:Ut,ribbonlineNumRoundJoinSubdivisions:ve},Symbol.toStringTag,{value:"Module"}));let Ar=class extends Oi{constructor(e,i){super(e,i,new Ei(Er,()=>ir(()=>Promise.resolve().then(()=>Qr),void 0)),zt),this.primitiveType=i.wireframe?it.LINES:it.TRIANGLE_STRIP}_makePipelineState(e,i){const{oitPass:r,output:a,hasOccludees:s,hasPolygonOffset:l}=e,o=r===st.NONE,n=r===st.FrontFace;return Oe({blending:pe(a)?Li(r):null,depthTest:{func:Di(r)},depthWrite:Ci(e),drawBuffers:a===ne.Depth?{buffers:[Te.NONE]}:xi(r,a),colorWrite:we,stencilWrite:s?ot:null,stencilTest:s?i?nt:Ri:null,polygonOffset:o||n?l?vt:null:Ai})}initializePipeline(e){if(e.occluder){const i=e.hasPolygonOffset?vt:null;this._occluderPipelineTransparent=Oe({blending:ut,polygonOffset:i,depthTest:lt,depthWrite:null,colorWrite:we,stencilWrite:null,stencilTest:Ii,drawBuffers:e.output===ne.Depth?{buffers:[Te.NONE]}:null}),this._occluderPipelineOpaque=Oe({blending:ut,polygonOffset:i,depthTest:lt,depthWrite:null,colorWrite:we,stencilWrite:$i,stencilTest:Pi,drawBuffers:e.output===ne.Depth?{buffers:[Te.NONE]}:null}),this._occluderPipelineMaskWrite=Oe({blending:null,polygonOffset:i,depthTest:wi,depthWrite:null,colorWrite:null,stencilWrite:ot,stencilTest:nt,drawBuffers:e.output===ne.Depth?{buffers:[Te.NONE]}:null})}return this._occludeePipeline=this._makePipelineState(e,!0),this._makePipelineState(e,!1)}getPipeline(e,i){if(e)return this._occludeePipeline;switch(i){case B.TRANSPARENT_OCCLUDER_MATERIAL:return this._occluderPipelineTransparent??super.getPipeline();case B.OCCLUDER_MATERIAL:return this._occluderPipelineOpaque??super.getPipeline();default:return this._occluderPipelineMaskWrite??super.getPipeline()}}};const vt={factor:0,units:-4},zt=new Map([[u.POSITION,0],[u.PREVPOSITION,1],[u.NEXTPOSITION,2],[u.SUBDIVISIONFACTOR,3],[u.UV0,4],[u.COLOR,5],[u.COLORFEATUREATTRIBUTE,5],[u.SIZE,6],[u.SIZEFEATUREATTRIBUTE,6],[u.OPACITYFEATUREATTRIBUTE,7],[u.OBJECTANDLAYERIDCOLOR,8]]);var U;(function(t){t[t.LEFT_JOIN_START=-2]="LEFT_JOIN_START",t[t.LEFT_JOIN_END=-1]="LEFT_JOIN_END",t[t.LEFT_CAP_START=-4]="LEFT_CAP_START",t[t.LEFT_CAP_END=-5]="LEFT_CAP_END",t[t.RIGHT_JOIN_START=2]="RIGHT_JOIN_START",t[t.RIGHT_JOIN_END=1]="RIGHT_JOIN_END",t[t.RIGHT_CAP_START=4]="RIGHT_CAP_START",t[t.RIGHT_CAP_END=5]="RIGHT_CAP_END"})(U||(U={}));class Rr extends Ni{constructor(e){super(e,Cr),this._configuration=new E,this.vertexAttributeLocations=zt,this.produces=new Map([[B.OPAQUE_MATERIAL,i=>Ki(i)||pe(i)&&this.parameters.renderOccluded===ae.OccludeAndTransparentStencil],[B.OPAQUE_MATERIAL_WITHOUT_NORMALS,i=>er(i)],[B.OCCLUDER_MATERIAL,i=>pt(i)&&this.parameters.renderOccluded===ae.OccludeAndTransparentStencil],[B.TRANSPARENT_OCCLUDER_MATERIAL,i=>pt(i)&&this.parameters.renderOccluded===ae.OccludeAndTransparentStencil],[B.TRANSPARENT_MATERIAL,i=>pe(i)&&this.parameters.writeDepth&&this.parameters.renderOccluded!==ae.OccludeAndTransparentStencil],[B.TRANSPARENT_MATERIAL_WITHOUT_DEPTH,i=>pe(i)&&!this.parameters.writeDepth&&this.parameters.renderOccluded!==ae.OccludeAndTransparentStencil],[B.DRAPED_MATERIAL,i=>tr(i)]])}getConfiguration(e,i){this._configuration.output=e,this._configuration.oitPass=i.oitPass,this._configuration.draped=i.slot===B.DRAPED_MATERIAL;const r=this.parameters.stipplePattern!=null&&e!==ne.Highlight;return this._configuration.stippleEnabled=r,this._configuration.stippleOffColorEnabled=r&&this.parameters.stippleOffColor!=null,this._configuration.stipplePreferContinuous=r&&this.parameters.stipplePreferContinuous,this._configuration.hasSlicePlane=this.parameters.hasSlicePlane,this._configuration.roundJoins=this.parameters.join==="round",this._configuration.capType=this.parameters.cap,this._configuration.applyMarkerOffset=this.parameters.markerParameters!=null&&Lr(this.parameters.markerParameters),this._configuration.hasPolygonOffset=this.parameters.hasPolygonOffset,this._configuration.writeDepth=this.parameters.writeDepth,this._configuration.vvSize=!!this.parameters.vvSize,this._configuration.vvColor=!!this.parameters.vvColor,this._configuration.vvOpacity=!!this.parameters.vvOpacity,this._configuration.innerColorEnabled=this.parameters.innerWidth>0&&this.parameters.innerColor!=null,this._configuration.falloffEnabled=this.parameters.falloff>0,this._configuration.hasOccludees=i.hasOccludees,this._configuration.occluder=this.parameters.renderOccluded===ae.OccludeAndTransparentStencil,this._configuration.terrainDepthTest=i.terrainDepthTest&&pe(e),this._configuration.cullAboveTerrain=i.cullAboveTerrain,this._configuration.wireframe=this.parameters.wireframe,this._configuration}get visible(){var e;return this.parameters.color[3]>=he||this.parameters.stipplePattern!=null&&(((e=this.parameters.stippleOffColor)==null?void 0:e[3])??0)>he}intersectDraped({attributes:e,screenToWorldRatio:i},r,a,s,l,o){if(!a.options.selectionMode)return;const n=e.get(u.SIZE);let c=this.parameters.width;if(this.parameters.vvSize){const A=e.get(u.SIZEFEATUREATTRIBUTE).data[0];c*=Ie(this.parameters.vvSize.offset[0]+A*this.parameters.vvSize.factor[0],this.parameters.vvSize.minSize[0],this.parameters.vvSize.maxSize[0])}else n&&(c*=n.data[0]);const d=s[0],f=s[1],m=(c/2+4)*i;let h=Number.MAX_VALUE,O=0;const y=e.get(u.POSITION).data,C=He(this.parameters,e)?y.length-2:y.length-5;for(let A=0;A<C;A+=3){const b=y[A],N=y[A+1],_=(A+3)%y.length,v=d-b,I=f-N,g=y[_]-b,Z=y[_+1]-N,L=Ie((g*v+Z*I)/(g*g+Z*Z),0,1),re=g*L-v,P=Z*L-I,X=re*re+P*P;X<h&&(h=X,O=A/3)}h<m*m&&l(o.dist,o.normal,O,!1)}intersect(e,i,r,a,s,l){if(!r.options.selectionMode||!e.visible)return;if(!ki(i))return void Et.getLogger("esri.views.3d.webgl-engine.materials.RibbonLineMaterial").error("intersection assumes a translation-only matrix");const o=e.attributes,n=o.get(u.POSITION).data;let c=this.parameters.width;if(this.parameters.vvSize){const b=o.get(u.SIZEFEATUREATTRIBUTE).data[0];c*=Ie(this.parameters.vvSize.offset[0]+b*this.parameters.vvSize.factor[0],this.parameters.vvSize.minSize[0],this.parameters.vvSize.maxSize[0])}else o.has(u.SIZE)&&(c*=o.get(u.SIZE).data[0]);const d=r.camera,f=Ir;Qt(f,r.point);const m=c*d.pixelRatio/2+4*d.pixelRatio;H(de[0],f[0]-m,f[1]+m,0),H(de[1],f[0]+m,f[1]+m,0),H(de[2],f[0]+m,f[1]-m,0),H(de[3],f[0]-m,f[1]-m,0);for(let b=0;b<4;b++)if(!d.unprojectFromRenderScreen(de[b],G[b]))return;be(d.eye,G[0],G[1],Ue),be(d.eye,G[1],G[2],ze),be(d.eye,G[2],G[3],Fe),be(d.eye,G[3],G[0],je);let h=Number.MAX_VALUE,O=0;const y=He(this.parameters,o)?n.length-2:n.length-5;for(let b=0;b<y;b+=3){$[0]=n[b]+i[12],$[1]=n[b+1]+i[13],$[2]=n[b+2]+i[14];const N=(b+3)%n.length;if(w[0]=n[N]+i[12],w[1]=n[N+1]+i[13],w[2]=n[N+2]+i[14],M(Ue,$)<0&&M(Ue,w)<0||M(ze,$)<0&&M(ze,w)<0||M(Fe,$)<0&&M(Fe,w)<0||M(je,$)<0&&M(je,w)<0)continue;if(d.projectToRenderScreen($,K),d.projectToRenderScreen(w,ee),K[2]<0&&ee[2]>0){ue(V,$,w);const v=d.frustum,I=-M(v[ye.NEAR],$)/rt(V,dt(v[ye.NEAR]));Pe(V,V,I),xe($,$,V),d.projectToRenderScreen($,K)}else if(K[2]>0&&ee[2]<0){ue(V,w,$);const v=d.frustum,I=-M(v[ye.NEAR],w)/rt(V,dt(v[ye.NEAR]));Pe(V,V,I),xe(w,w,V),d.projectToRenderScreen(w,ee)}else if(K[2]<0&&ee[2]<0)continue;K[2]=0,ee[2]=0;const _=Xi($e(K,ee,Tt),f);_<h&&(h=_,q(gt,$),q(St,w),O=b/3)}const C=r.rayBegin,A=r.rayEnd;if(h<m*m){let b=Number.MAX_VALUE;if(Qi($e(gt,St,Tt),$e(C,A,Pr),Q)){ue(Q,Q,C);const N=Kt(Q);Pe(Q,Q,1/N),b=N/Ge(C,A)}l(b,Q,O,!1)}}get _layout(){const e=Hi().vec3f(u.POSITION).vec3f(u.PREVPOSITION).vec3f(u.NEXTPOSITION).f32(u.SUBDIVISIONFACTOR).vec2f(u.UV0);return this.parameters.vvSize?e.f32(u.SIZEFEATUREATTRIBUTE):e.f32(u.SIZE),this.parameters.vvColor?e.f32(u.COLORFEATUREATTRIBUTE):e.vec4f(u.COLOR),this.parameters.vvOpacity&&e.f32(u.OPACITYFEATUREATTRIBUTE),ke()&&e.vec4u8(u.OBJECTANDLAYERIDCOLOR),e}createBufferWriter(){return new Dr(this._layout,this.parameters)}createGLMaterial(e){return new xr(e)}validateParameters(e){e.join!=="miter"&&(e.miterLimit=0),e.markerParameters!=null&&(e.markerScale=e.markerParameters.width/e.width)}}class xr extends zi{constructor(){super(...arguments),this._stipplePattern=null}dispose(){super.dispose(),this._stippleTextures.release(this._stipplePattern),this._stipplePattern=null}beginSlot(e){const i=this._material.parameters.stipplePattern;return this._stipplePattern!==i&&(this._material.setParameters({stippleTexture:this._stippleTextures.swap(i,this._stipplePattern)}),this._stipplePattern=i),this.getTechnique(Ar,e)}}class Cr extends Ui{constructor(){super(...arguments),this.width=0,this.color=ei,this.join="miter",this.cap=ie.BUTT,this.miterLimit=5,this.writeDepth=!0,this.hasPolygonOffset=!1,this.stippleTexture=null,this.stipplePreferContinuous=!0,this.markerParameters=null,this.markerScale=1,this.hasSlicePlane=!1,this.vvFastUpdate=!1,this.isClosed=!1,this.falloff=0,this.innerWidth=0,this.wireframe=!1}get transparent(){var e;return this.color[3]<1||this.stipplePattern!=null&&(((e=this.stippleOffColor)==null?void 0:e[3])??0)<1}}class Dr{constructor(e,i){this.vertexBufferLayout=e,this._parameters=i,this.numJoinSubdivisions=0;const r=i.stipplePattern?1:0;switch(this._parameters.join){case"miter":case"bevel":this.numJoinSubdivisions=r;break;case"round":this.numJoinSubdivisions=ve+r}}_isClosed(e){return He(this._parameters,e)}allocate(e){return this.vertexBufferLayout.createBuffer(e)}elementCount(e){const r=e.get(u.POSITION).indices.length/2+1,a=this._isClosed(e);let s=a?2:2*2;return s+=((a?r:r-1)-(a?0:1))*(2*this.numJoinSubdivisions+4),s+=2,this._parameters.wireframe&&(s=2+4*(s-2)),s}write(e,i,r,a,s,l){var Xe,Qe,Ke;const o=$r,n=wr,c=Nr,d=r.get(u.POSITION),f=d.indices,m=d.data.length/3,h=(Xe=r.get(u.DISTANCETOSTART))==null?void 0:Xe.data;f&&f.length!==2*(m-1)&&console.warn("RibbonLineMaterial does not support indices");const O=((Qe=r.get(u.SIZEFEATUREATTRIBUTE))==null?void 0:Qe.data[0])??((Ke=r.get(u.SIZE))==null?void 0:Ke.data[0])??1;let y=[1,1,1,1],C=0;const A=this.vertexBufferLayout.fields.has(u.COLORFEATUREATTRIBUTE);A?C=r.get(u.COLORFEATUREATTRIBUTE).data[0]:r.has(u.COLOR)&&(y=r.get(u.COLOR).data);const b=this.vertexBufferLayout.fields.has(u.OPACITYFEATUREATTRIBUTE),N=b?r.get(u.OPACITYFEATUREATTRIBUTE).data[0]:0,_=new Float32Array(s.buffer),v=ke()?new Uint8Array(s.buffer):null,I=this.vertexBufferLayout.stride/4;let g=l*I;const Z=g;let L=0;const re=h?(R,W,J)=>L=h[J]:(R,W,J)=>L+=Ge(R,W),P=(R,W,J,ce,ge,Mt,Vt)=>{if(_[g++]=W[0],_[g++]=W[1],_[g++]=W[2],_[g++]=R[0],_[g++]=R[1],_[g++]=R[2],_[g++]=J[0],_[g++]=J[1],_[g++]=J[2],_[g++]=ce,_[g++]=Vt,_[g++]=ge,_[g++]=O,A)_[g++]=C;else{const Se=Math.min(4*Mt,y.length-4);_[g++]=y[Se],_[g++]=y[Se+1],_[g++]=y[Se+2],_[g++]=y[Se+3]}b&&(_[g++]=N),ke()&&(a&&(v[4*g]=a[0],v[4*g+1]=a[1],v[4*g+2]=a[2],v[4*g+3]=a[3]),g++)};g+=I,H(n,d.data[0],d.data[1],d.data[2]),e&&k(n,n,e);const X=this._isClosed(r);if(X){const R=d.data.length-3;H(o,d.data[R],d.data[R+1],d.data[R+2]),e&&k(o,o,e)}else H(c,d.data[3],d.data[4],d.data[5]),e&&k(c,c,e),P(n,n,c,1,U.LEFT_CAP_START,0,0),P(n,n,c,1,U.RIGHT_CAP_START,0,0),q(o,n),q(n,c);const Le=X?0:1,le=X?m:m-1;for(let R=Le;R<le;R++){const W=(R+1)%m*3;H(c,d.data[W],d.data[W+1],d.data[W+2]),e&&k(c,c,e),re(o,n,R),P(o,n,c,0,U.LEFT_JOIN_END,R,L),P(o,n,c,0,U.RIGHT_JOIN_END,R,L);const J=this.numJoinSubdivisions;for(let ce=0;ce<J;++ce){const ge=(ce+1)/(J+1);P(o,n,c,ge,U.LEFT_JOIN_END,R,L),P(o,n,c,ge,U.RIGHT_JOIN_END,R,L)}P(o,n,c,1,U.LEFT_JOIN_START,R,L),P(o,n,c,1,U.RIGHT_JOIN_START,R,L),q(o,n),q(n,c)}X?(H(c,d.data[3],d.data[4],d.data[5]),e&&k(c,c,e),L=re(o,n,le),P(o,n,c,0,U.LEFT_JOIN_END,Le,L),P(o,n,c,0,U.RIGHT_JOIN_END,Le,L)):(L=re(o,n,le),P(o,n,n,0,U.LEFT_CAP_END,le,L),P(o,n,n,0,U.RIGHT_CAP_END,le,L)),Ne(_,Z+I,_,Z,I),g=Ne(_,g-I,_,g,I),this._parameters.wireframe&&this._addWireframeVertices(s,Z,g,I)}_addWireframeVertices(e,i,r,a){const s=new Float32Array(e.buffer,r*Float32Array.BYTES_PER_ELEMENT),l=new Float32Array(e.buffer,i*Float32Array.BYTES_PER_ELEMENT,r-i);let o=0;const n=c=>o=Ne(l,c,s,o,a);for(let c=0;c<l.length-1;c+=2*a)n(c),n(c+2*a),n(c+1*a),n(c+2*a),n(c+1*a),n(c+3*a)}}function Ne(t,e,i,r,a){for(let s=0;s<a;s++)i[r++]=t[e++];return r}function He(t,e){return t.isClosed?e.get(u.POSITION).indices.length>2:!1}function Lr(t){return t.anchor===me.Tip&&t.hideOnShortSegments&&t.placement==="begin-end"&&t.worldSpace}const $=x(),w=x(),V=x(),Q=x(),Ir=x(),K=se(),ee=se(),gt=x(),St=x(),Tt=Lt(),Pr=Lt(),$r=x(),wr=x(),Nr=x(),de=[se(),se(),se(),se()],G=[x(),x(),x(),x()],Ue=De(),ze=De(),Fe=De(),je=De();var _t,bt,yt;(function(t){t[t.RasterImage=0]="RasterImage",t[t.Features=1]="Features"})(_t||(_t={})),function(t){t[t.MapLayer=0]="MapLayer",t[t.ViewLayer=1]="ViewLayer",t[t.Outline=2]="Outline",t[t.SnappingHint=3]="SnappingHint"}(bt||(bt={})),function(t){t[t.WithRasterImage=0]="WithRasterImage",t[t.WithoutRasterImage=1]="WithoutRasterImage"}(yt||(yt={}));let Ur=class{constructor(e,i){this.vec3=e,this.id=i}};function Ot(t,e,i,r){return new Ur(Me(t,e,i),r)}class Ca{constructor(e){this._originSR=e,this._rootOriginId="root/"+ti(),this._origins=new Map,this._objects=new Map,this._gridSize=5e5}getOrigin(e){const i=this._origins.get(this._rootOriginId);if(i==null){const d=Ot(e[0]+Math.random()-.5,e[1]+Math.random()-.5,e[2]+Math.random()-.5,this._rootOriginId);return this._origins.set(this._rootOriginId,d),d}const r=this._gridSize,a=Math.round(e[0]/r),s=Math.round(e[1]/r),l=Math.round(e[2]/r),o=`${a}/${s}/${l}`;let n=this._origins.get(o);const c=.5*r;if(ue(D,e,i.vec3),D[0]=Math.abs(D[0]),D[1]=Math.abs(D[1]),D[2]=Math.abs(D[2]),D[0]<c&&D[1]<c&&D[2]<c){if(n){const d=Math.max(...D);if(ue(D,e,n.vec3),D[0]=Math.abs(D[0]),D[1]=Math.abs(D[1]),D[2]=Math.abs(D[2]),Math.max(...D)<d)return n}return i}return n||(n=Ot(a*r,s*r,l*r,o),this._origins.set(o,n)),n}_drawOriginBox(e,i=ii(1,1,0,1)){const r=window.view,a=r._stage,s=i.toString();if(!this._objects.has(s)){this._material=new Rr({width:2,color:i}),a.add(this._material);const h=new pr(a,{pickable:!1}),O=new or({castShadow:!1});a.add(O),h.add(O),this._objects.set(s,O)}const l=this._objects.get(s),o=[0,1,5,4,0,2,1,7,6,2,0,1,3,7,5,4,6,2,0],n=o.length,c=new Array(3*n),d=new Array,f=.5*this._gridSize;for(let h=0;h<n;h++)c[3*h]=e[0]+(1&o[h]?f:-f),c[3*h+1]=e[1]+(2&o[h]?f:-f),c[3*h+2]=e[2]+(4&o[h]?f:-f),h>0&&d.push(h-1,h);Ve(c,this._originSR,0,c,r.renderSpatialReference,0,n);const m=new Fi(this._material,[[u.POSITION,new oi(c,d,3,!0)]],null,Ze.Line);a.add(m),l.addGeometry(m)}get test(){}}const D=x();function Da(t,e,i,r,a,s,l,o,n,c,d){const f=kr[d.mode];let m,h,O=0;if(Ve(t,e,i,r,n.spatialReference,a,o))return f!=null&&f.requiresAlignment(d)?(O=f.applyElevationAlignmentBuffer(r,a,s,l,o,n,c,d),m=s,h=l):(m=r,h=a),Ve(m,n.spatialReference,h,s,c.spatialReference,l,o)?O:void 0}function Ft(t,e,i,r,a){const s=(Dt(t)?t.z:It(t)?t.array[t.offset+2]:t[2])||0;switch(i.mode){case"on-the-ground":{const l=Ee(e,t,"ground")??0;return a.verticalDistanceToGround=0,a.sampledElevation=l,void(a.z=l)}case"relative-to-ground":{const l=Ee(e,t,"ground")??0,o=i.geometryZWithOffset(s,r);return a.verticalDistanceToGround=o,a.sampledElevation=l,void(a.z=o+l)}case"relative-to-scene":{const l=Ee(e,t,"scene")??0,o=i.geometryZWithOffset(s,r);return a.verticalDistanceToGround=o,a.sampledElevation=l,void(a.z=o+l)}case"absolute-height":{const l=i.geometryZWithOffset(s,r),o=Ee(e,t,"ground")??0;return a.verticalDistanceToGround=l-o,a.sampledElevation=o,void(a.z=l)}default:return void(a.z=0)}}function La(t,e,i,r){return Ft(t,e,i,r,oe),oe.z}function Ia(t,e,i){return e==="on-the-ground"&&i==="on-the-ground"?t.staysOnTheGround:e===i||e!=="on-the-ground"&&i!=="on-the-ground"?e==null||i==null?t.definedChanged:Je.UPDATE:t.onTheGroundChanged}function Pa(t){return t==="relative-to-ground"||t==="relative-to-scene"}function $a(t){return t!=="absolute-height"}function wa(t,e,i,r,a){Ft(e,i,a,r,oe),zr(t,oe.verticalDistanceToGround);const s=oe.sampledElevation,l=We(Hr,t.transformation);return Ae[0]=e.x,Ae[1]=e.y,Ae[2]=oe.z,rr(e.spatialReference,Ae,l,r.spatialReference)?t.transformation=l:console.warn("Could not locate symbol object properly, it might be misplaced"),s}function zr(t,e){for(let i=0;i<t.geometries.length;++i){const r=t.geometries[i].getMutableAttribute(u.CENTEROFFSETANDDISTANCE);r&&r.data[3]!==e&&(r.data[3]=e,t.geometryVertexAttributeUpdated(t.geometries[i],u.CENTEROFFSETANDDISTANCE))}}function Fr(t,e,i,r,a,s){let l=0;const o=s.spatialReference;e*=3,r*=3;for(let n=0;n<a;++n){const c=t[e],d=t[e+1],f=t[e+2],m=s.getElevation(c,d,f,o,"ground")??0;l+=m,i[r]=c,i[r+1]=d,i[r+2]=m,e+=3,r+=3}return l/a}function jr(t,e,i,r,a,s,l,o){let n=0;const c=o.calculateOffsetRenderUnits(l),d=o.featureExpressionInfoContext,f=s.spatialReference;e*=3,r*=3;for(let m=0;m<a;++m){const h=t[e],O=t[e+1],y=t[e+2],C=s.getElevation(h,O,y,f,"ground")??0;n+=C,i[r]=h,i[r+1]=O,i[r+2]=d==null?y+C+c:C+c,e+=3,r+=3}return n/a}function Wr(t,e,i,r,a,s,l,o){let n=0;const c=o.calculateOffsetRenderUnits(l),d=o.featureExpressionInfoContext,f=s.spatialReference;e*=3,r*=3;for(let m=0;m<a;++m){const h=t[e],O=t[e+1],y=t[e+2],C=s.getElevation(h,O,y,f,"scene")??0;n+=C,i[r]=h,i[r+1]=O,i[r+2]=d==null?y+C+c:C+c,e+=3,r+=3}return n/a}function Mr(t){const e=t.meterUnitOffset,i=t.featureExpressionInfoContext;return e!==0||i!=null}function Vr(t,e,i,r,a,s,l,o){const n=o.calculateOffsetRenderUnits(l),c=o.featureExpressionInfoContext;e*=3,r*=3;for(let d=0;d<a;++d){const f=t[e],m=t[e+1],h=t[e+2];i[r]=f,i[r+1]=m,i[r+2]=c==null?h+n:n,e+=3,r+=3}return 0}class Br{constructor(){this.verticalDistanceToGround=0,this.sampledElevation=0,this.z=0}}var Je;(function(t){t[t.NONE=0]="NONE",t[t.UPDATE=1]="UPDATE",t[t.RECREATE=2]="RECREATE"})(Je||(Je={}));const kr={"absolute-height":{applyElevationAlignmentBuffer:Vr,requiresAlignment:Mr},"on-the-ground":{applyElevationAlignmentBuffer:Fr,requiresAlignment:()=>!0},"relative-to-ground":{applyElevationAlignmentBuffer:jr,requiresAlignment:()=>!0},"relative-to-scene":{applyElevationAlignmentBuffer:Wr,requiresAlignment:()=>!0}},Hr=Re(),oe=new Br,Ae=x(),Jr=()=>Et.getLogger("esri.views.3d.layers.graphics.featureExpressionInfoUtils");function Gr(t){return{cachedResult:t.cachedResult,arcade:t.arcade?{func:t.arcade.func,context:t.arcade.modules.arcadeUtils.createExecContext(null,{sr:t.arcade.context.spatialReference}),modules:t.arcade.modules}:null}}async function Na(t,e,i,r){const a=t==null?void 0:t.expression;if(typeof a!="string")return null;const s=Xr(a);if(s!=null)return{cachedResult:s};const l=await ri();ai(i);const o=l.arcadeUtils,n=o.createSyntaxTree(a);return o.dependsOnView(n)?(r!=null&&r.error("Expressions containing '$view' are not supported on ElevationInfo"),{cachedResult:0}):{arcade:{func:o.createFunction(n),context:o.createExecContext(null,{sr:e}),modules:l}}}function Zr(t,e,i){return t.arcadeUtils.createFeature(e.attributes,e.geometry,i)}function Yr(t,e){if(t!=null&&!jt(t)){if(!e||!t.arcade)return void Jr().errorOncePerTick("Arcade support required but not provided");const i=e;i._geometry&&(i._geometry=ar(i._geometry)),t.arcade.modules.arcadeUtils.updateExecContext(t.arcade.context,e)}}function qr(t){if(t!=null){if(jt(t))return t.cachedResult;const e=t.arcade;let i=e==null?void 0:e.modules.arcadeUtils.executeFunction(e.func,e.context);return typeof i!="number"&&(t.cachedResult=0,i=0),i}return 0}function Ua(t,e=!1){let i=t==null?void 0:t.featureExpressionInfo;const r=i==null?void 0:i.expression;return e||r==="0"||(i=null),i??null}const za={cachedResult:0};function jt(t){return t.cachedResult!=null}function Xr(t){return t==="0"?0:null}class Wt{constructor(){this._meterUnitOffset=0,this._renderUnitOffset=0,this._unit="meters",this._metersPerElevationInfoUnit=1,this._featureExpressionInfoContext=null,this.centerPointInElevationSR=null,this.mode=null}get featureExpressionInfoContext(){return this._featureExpressionInfoContext}get meterUnitOffset(){return this._meterUnitOffset}get unit(){return this._unit}set unit(e){this._unit=e,this._metersPerElevationInfoUnit=si(e)}get requiresSampledElevationInfo(){return this.mode!=="absolute-height"}reset(){this.mode=null,this._meterUnitOffset=0,this._renderUnitOffset=0,this._featureExpressionInfoContext=null,this.unit="meters"}set offsetMeters(e){this._meterUnitOffset=e,this._renderUnitOffset=0}set offsetElevationInfoUnits(e){this._meterUnitOffset=e*this._metersPerElevationInfoUnit,this._renderUnitOffset=0}addOffsetRenderUnits(e){this._renderUnitOffset+=e}geometryZWithOffset(e,i){const r=this.calculateOffsetRenderUnits(i);return this.featureExpressionInfoContext!=null?r:e+r}calculateOffsetRenderUnits(e){let i=this._meterUnitOffset;const r=this.featureExpressionInfoContext;return r!=null&&(i+=qr(r)*this._metersPerElevationInfoUnit),i/e.unitInMeters+this._renderUnitOffset}setFromElevationInfo(e){this.mode=e.mode,this.unit=ni(e.unit)?e.unit:"meters",this.offsetElevationInfoUnits=e.offset??0}updateFeatureExpressionInfoContext(e,i,r){if(e==null)return void(this._featureExpressionInfoContext=null);const a=e==null?void 0:e.arcade;a&&i!=null&&r!=null?(this._featureExpressionInfoContext=Gr(e),Yr(this._featureExpressionInfoContext,Zr(a.modules,i,r))):this._featureExpressionInfoContext=e}static fromElevationInfo(e){const i=new Wt;return e!=null&&i.setFromElevationInfo(e),i}}const Qr=Object.freeze(Object.defineProperty({__proto__:null,build:Ut,ribbonlineNumRoundJoinSubdivisions:ve},Symbol.toStringTag,{value:"Module"}));export{or as A,F as B,Ce as C,ie as D,zr as E,La as F,Ee as G,Br as R,Rr as W,Ca as _,yt as a,bt as b,Ft as c,Je as d,_t as e,za as f,Pa as g,Ua as h,Na as i,pr as j,$a as k,Yr as l,Ia as m,te as n,Wt as o,wa as p,ur as q,_a as r,Zr as s,Ot as t,Da as u,Or as v,me as w,Nt as x,_r as y,Ea as z};
