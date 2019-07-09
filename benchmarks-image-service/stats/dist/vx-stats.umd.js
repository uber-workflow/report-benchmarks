!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports,require("@vx/group"),require("react"),require("classnames"),require("prop-types"),require("@vx/scale"),require("d3-shape")):"function"==typeof define&&define.amd?define(["exports","@vx/group","react","classnames","prop-types","@vx/scale","d3-shape"],t):t(e.vx=e.vx||{},e.vx,e.React,e.classNames,e.PropTypes,e.vx,e.d3)}(this,function(e,B,D,G,t,N,E){"use strict";function V(){return(V=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var r=arguments[t];for(var n in r)Object.prototype.hasOwnProperty.call(r,n)&&(e[n]=r[n])}return e}).apply(this,arguments)}function W(e,t){if(null==e)return{};var r,n,o=function(e,t){if(null==e)return{};var r,n,o={},i=Object.keys(e);for(n=0;n<i.length;n++)r=i[n],0<=t.indexOf(r)||(o[r]=e[r]);return o}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)r=i[n],0<=t.indexOf(r)||Object.prototype.propertyIsEnumerable.call(e,r)&&(o[r]=e[r])}return o}function H(e){return function(e){if(Array.isArray(e)){for(var t=0,r=new Array(e.length);t<e.length;t++)r[t]=e[t];return r}}(e)||function(e){if(Symbol.iterator in Object(e)||"[object Arguments]"===Object.prototype.toString.call(e))return Array.from(e)}(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance")}()}function J(e){var t=e.x1,r=e.x2;return{x1:e.y1,x2:e.y2,y1:t,y2:r}}function r(e){var t=e.left,r=void 0===t?0:t,n=e.top,o=void 0===n?0:n,i=e.className,a=e.max,l=e.min,c=e.firstQuartile,u=e.thirdQuartile,s=e.median,x=e.boxWidth,m=e.fill,d=e.fillOpacity,y=e.stroke,f=e.strokeWidth,p=e.rx,h=void 0===p?2:p,v=e.ry,b=void 0===v?2:v,T=e.valueScale,g=e.outliers,O=void 0===g?[]:g,P=e.horizontal,k=e.medianProps,j=void 0===k?{}:k,M=e.maxProps,w=void 0===M?{}:M,N=e.minProps,E=void 0===N?{}:N,W=e.boxProps,S=void 0===W?{}:W,q=e.outlierProps,A=void 0===q?{}:q,F=e.container,Q=void 0!==F&&F,z=e.containerProps,C=void 0===z?{}:z,R=e.children,L=P?o:r,I=L+x/2,Z=T.range(),_={valueRange:Z,center:I,offset:L,boxWidth:x,max:{x1:I-x/4,x2:I+x/4,y1:T(a),y2:T(a)},maxToThird:{x1:I,x2:I,y1:T(a),y2:T(u)},median:{x1:L,x2:L+x,y1:T(s),y2:T(s)},minToFirst:{x1:I,x2:I,y1:T(c),y2:T(l)},min:{x1:I-x/4,x2:I+x/4,y1:T(l),y2:T(l)},box:{x1:L,x2:x,y1:T(u),y2:Math.abs(T(u)-T(c))},container:{x1:L,x2:x,y1:Math.min.apply(Math,H(Z)),y2:Math.abs(Z[0]-Z[1])}};return P&&(_.max=J(_.max),_.maxToThird=J(_.maxToThird),_.box=J(_.box),_.box.y1=T(c),_.median=J(_.median),_.minToFirst=J(_.minToFirst),_.min=J(_.min),_.container=J(_.container),_.container.y1=Math.min.apply(Math,H(Z))),R?R(_):D.createElement(B.Group,{className:G("vx-boxplot",i)},O.map(function(e,t){var r=P?T(e):I,n=P?I:T(e);return D.createElement("circle",V({key:"vx-boxplot-outlier-".concat(t),className:"vx-boxplot-outlier",cx:r,cy:n,r:4,stroke:y,strokeWidth:f,fill:m,fillOpacity:d},A))}),D.createElement("line",V({className:"vx-boxplot-max",x1:_.max.x1,y1:_.max.y1,x2:_.max.x2,y2:_.max.y2,stroke:y,strokeWidth:f},w)),D.createElement("line",{className:"vx-boxplot-max-to-third",x1:_.maxToThird.x1,y1:_.maxToThird.y1,x2:_.maxToThird.x2,y2:_.maxToThird.y2,stroke:y,strokeWidth:f}),D.createElement("rect",V({className:"vx-boxplot-box",x:_.box.x1,y:_.box.y1,width:_.box.x2,height:_.box.y2,stroke:y,strokeWidth:f,fill:m,fillOpacity:d,rx:h,ry:b},S)),D.createElement("line",V({className:"vx-boxplot-median",x1:_.median.x1,y1:_.median.y1,x2:_.median.x2,y2:_.median.y2,stroke:y,strokeWidth:f},j)),D.createElement("line",{className:"vx-boxplot-min-to-first",x1:_.minToFirst.x1,y1:_.minToFirst.y1,x2:_.minToFirst.x2,y2:_.minToFirst.y2,stroke:y,strokeWidth:f}),D.createElement("line",V({className:"vx-boxplot-min",x1:_.min.x1,y1:_.min.y1,x2:_.min.x2,y2:_.min.y2,stroke:y,strokeWidth:f},E)),Q&&D.createElement("rect",V({x:_.container.x1,y:_.container.y1,width:_.container.x2,height:_.container.y2,fillOpacity:"0"},C)))}function n(e){var t=e.left,r=void 0===t?0:t,n=e.top,o=void 0===n?0:n,i=e.className,a=e.data,l=e.width,c=e.count,u=void 0===c?function(e){return e.count}:c,s=e.value,x=void 0===s?function(e){return e.value}:s,m=e.valueScale,d=e.horizontal,y=e.children,f=W(e,["left","top","className","data","width","count","value","valueScale","horizontal","children"]),p=(d?o:r)+l/2,h=a.map(function(e){return e.count}),v=N.scaleLinear({rangeRound:[0,l/2],domain:[0,Math.max.apply(Math,H(h))]}),b="";if(d){var T=E.line().x(function(e){return m(x(e))}).y(function(e){return p-v(u(e))}).curve(E.curveCardinal),g=E.line().x(function(e){return m(x(e))}).y(function(e){return p+v(u(e))}).curve(E.curveCardinal),O=T(a),P=g(H(a).reverse());b="".concat(O," ").concat(P.replace("M","L")," Z")}else{var k=E.line().x(function(e){return p+v(u(e))}).y(function(e){return m(x(e))}).curve(E.curveCardinal),j=E.line().x(function(e){return p-v(u(e))}).y(function(e){return m(x(e))}).curve(E.curveCardinal),M=k(a),w=j(H(a).reverse());b="".concat(M," ").concat(w.replace("M","L")," Z")}return y?y({path:b}):D.createElement("path",V({className:G("vx-violin",i),d:b},f))}D=D&&D.hasOwnProperty("default")?D.default:D,G=G&&G.hasOwnProperty("default")?G.default:G,t=t&&t.hasOwnProperty("default")?t.default:t,r.propTypes={left:t.number,top:t.number,className:t.string,max:t.number,min:t.number,firstQuartile:t.number,thirdQuartile:t.number,median:t.number,boxWidth:t.number,fill:t.string,fillOpacity:t.oneOfType([t.number,t.string]),stroke:t.string,strokeWidth:t.oneOfType([t.number,t.string]),rx:t.number,ry:t.number,valueScale:t.func,outliers:t.array,horizontal:t.bool,medianProps:t.object,maxProps:t.object,minProps:t.object,boxProps:t.object,outlierProps:t.object,container:t.bool,containerProps:t.object,children:t.func},n.propTypes={left:t.number,top:t.number,className:t.string,data:t.array.isRequired,width:t.number,count:t.func,value:t.func,valueScale:t.func,horizontal:t.bool,children:t.func},e.BoxPlot=r,e.ViolinPlot=n,e.computeStats=function(e){for(var t=H(e).sort(function(e,t){return e-t}),r=t.length,n=t[Math.round(r/4)],o=t[Math.round(3*r/4)],i=o-n,a=n-1.5*i,l=o+1.5*i,c=t.filter(function(e){return e<a||l<e}),u=2*i*Math.pow(r-c.length,-1/3),s=Math.round((l-a)/u),x=(l-a)/s,m=Array(s+2).fill(0),d=Array(s+2).fill(a),y=1;y<=s;y+=1)d[y]+=x*(y-.5);d[d.length-1]=l,t.filter(function(e){return a<=e&&e<=l}).forEach(function(e){m[Math.floor((e-a)/x)+1]+=1});var f=d.map(function(e,t){return{value:e,count:m[t]}});return{boxPlot:{min:a,firstQuartile:n,median:t[Math.round(r/2)],thirdQuartile:o,max:l,outliers:c},binData:f}},Object.defineProperty(e,"__esModule",{value:!0})});
