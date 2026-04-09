import{r as u,a as T,u as F,j as d,N as M,P as h}from"./index-BWqNv65d.js";let D={data:""},H=e=>{if(typeof window=="object"){let t=(e?e.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return t.nonce=window.__nonce__,t.parentNode||(e||document.head).appendChild(t),t.firstChild}return e||D},R=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,q=/\/\*[^]*?\*\/|  +/g,C=/\n+/g,b=(e,t)=>{let a="",o="",i="";for(let s in e){let r=e[s];s[0]=="@"?s[1]=="i"?a=s+" "+r+";":o+=s[1]=="f"?b(r,s):s+"{"+b(r,s[1]=="k"?"":t)+"}":typeof r=="object"?o+=b(r,t?t.replace(/([^,])+/g,l=>s.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,n=>/&/.test(n)?n.replace(/&/g,l):l?l+" "+n:n)):s):r!=null&&(s=/^--/.test(s)?s:s.replace(/[A-Z]/g,"-$&").toLowerCase(),i+=b.p?b.p(s,r):s+":"+r+";")}return a+(t&&i?t+"{"+i+"}":i)+o},f={},A=e=>{if(typeof e=="object"){let t="";for(let a in e)t+=a+A(e[a]);return t}return e},Z=(e,t,a,o,i)=>{let s=A(e),r=f[s]||(f[s]=(n=>{let c=0,m=11;for(;c<n.length;)m=101*m+n.charCodeAt(c++)>>>0;return"go"+m})(s));if(!f[r]){let n=s!==e?e:(c=>{let m,y,v=[{}];for(;m=R.exec(c.replace(q,""));)m[4]?v.shift():m[3]?(y=m[3].replace(C," ").trim(),v.unshift(v[0][y]=v[0][y]||{})):v[0][m[1]]=m[2].replace(C," ").trim();return v[0]})(e);f[r]=b(i?{["@keyframes "+r]:n}:n,a?"":"."+r)}let l=a&&f.g?f.g:null;return a&&(f.g=f[r]),((n,c,m,y)=>{y?c.data=c.data.replace(y,n):c.data.indexOf(n)===-1&&(c.data=m?n+c.data:c.data+n)})(f[r],t,o,l),r},B=(e,t,a)=>e.reduce((o,i,s)=>{let r=t[s];if(r&&r.call){let l=r(a),n=l&&l.props&&l.props.className||/^go/.test(l)&&l;r=n?"."+n:l&&typeof l=="object"?l.props?"":b(l,""):l===!1?"":l}return o+i+(r??"")},"");function N(e){let t=this||{},a=e.call?e(t.p):e;return Z(a.unshift?a.raw?B(a,[].slice.call(arguments,1),t.p):a.reduce((o,i)=>Object.assign(o,i&&i.call?i(t.p):i),{}):a,H(t.target),t.g,t.o,t.k)}let S,E,k;N.bind({g:1});let g=N.bind({k:1});function Q(e,t,a,o){b.p=t,S=e,E=a,k=o}function x(e,t){let a=this||{};return function(){let o=arguments;function i(s,r){let l=Object.assign({},s),n=l.className||i.className;a.p=Object.assign({theme:E&&E()},l),a.o=/ *go\d+/.test(n),l.className=N.apply(a,o)+(n?" "+n:"");let c=e;return e[0]&&(c=l.as||e,delete l.as),k&&c[0]&&k(l),S(c,l)}return i}}var V=e=>typeof e=="function",$=(e,t)=>V(e)?e(t):e,W=(()=>{let e=0;return()=>(++e).toString()})(),Y=(()=>{let e;return()=>{if(e===void 0&&typeof window<"u"){let t=matchMedia("(prefers-reduced-motion: reduce)");e=!t||t.matches}return e}})(),G=20,z="default",O=(e,t)=>{let{toastLimit:a}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,a)};case 1:return{...e,toasts:e.toasts.map(r=>r.id===t.toast.id?{...r,...t.toast}:r)};case 2:let{toast:o}=t;return O(e,{type:e.toasts.find(r=>r.id===o.id)?1:0,toast:o});case 3:let{toastId:i}=t;return{...e,toasts:e.toasts.map(r=>r.id===i||i===void 0?{...r,dismissed:!0,visible:!1}:r)};case 4:return t.toastId===void 0?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(r=>r.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let s=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(r=>({...r,pauseDuration:r.pauseDuration+s}))}}},J=[],K={toasts:[],pausedAt:void 0,settings:{toastLimit:G}},j={},I=(e,t=z)=>{j[t]=O(j[t]||K,e),J.forEach(([a,o])=>{a===t&&o(j[t])})},P=e=>Object.keys(j).forEach(t=>I(e,t)),X=e=>Object.keys(j).find(t=>j[t].toasts.some(a=>a.id===e)),L=(e=z)=>t=>{I(t,e)},ee=(e,t="blank",a)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...a,id:(a==null?void 0:a.id)||W()}),w=e=>(t,a)=>{let o=ee(t,e,a);return L(o.toasterId||X(o.id))({type:2,toast:o}),o.id},p=(e,t)=>w("blank")(e,t);p.error=w("error");p.success=w("success");p.loading=w("loading");p.custom=w("custom");p.dismiss=(e,t)=>{let a={type:3,toastId:e};t?L(t)(a):P(a)};p.dismissAll=e=>p.dismiss(void 0,e);p.remove=(e,t)=>{let a={type:4,toastId:e};t?L(t)(a):P(a)};p.removeAll=e=>p.remove(void 0,e);p.promise=(e,t,a)=>{let o=p.loading(t.loading,{...a,...a==null?void 0:a.loading});return typeof e=="function"&&(e=e()),e.then(i=>{let s=t.success?$(t.success,i):void 0;return s?p.success(s,{id:o,...a,...a==null?void 0:a.success}):p.dismiss(o),i}).catch(i=>{let s=t.error?$(t.error,i):void 0;s?p.error(s,{id:o,...a,...a==null?void 0:a.error}):p.dismiss(o)}),e};var te=g`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,ae=g`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,re=g`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,oe=x("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${te} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${ae} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${re} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,se=g`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,ie=x("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${se} 1s linear infinite;
`,ne=g`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,le=g`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,de=x("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${ne} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${le} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,ce=x("div")`
  position: absolute;
`,pe=x("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,ue=g`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,me=x("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${ue} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,fe=({toast:e})=>{let{icon:t,type:a,iconTheme:o}=e;return t!==void 0?typeof t=="string"?u.createElement(me,null,t):t:a==="blank"?null:u.createElement(pe,null,u.createElement(ie,{...o}),a!=="loading"&&u.createElement(ce,null,a==="error"?u.createElement(oe,{...o}):u.createElement(de,{...o})))},ge=e=>`
0% {transform: translate3d(0,${e*-200}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,be=e=>`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${e*-150}%,-1px) scale(.6); opacity:0;}
`,xe="0%{opacity:0;} 100%{opacity:1;}",he="0%{opacity:1;} 100%{opacity:0;}",ye=x("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,ve=x("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,je=(e,t)=>{let a=e.includes("top")?1:-1,[o,i]=Y()?[xe,he]:[ge(a),be(a)];return{animation:t?`${g(o)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${g(i)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}};u.memo(({toast:e,position:t,style:a,children:o})=>{let i=e.height?je(e.position||t||"top-center",e.visible):{opacity:0},s=u.createElement(fe,{toast:e}),r=u.createElement(ve,{...e.ariaProps},$(e.message,e));return u.createElement(ye,{className:e.className,style:{...i,...a,...e.style}},typeof o=="function"?o({icon:s,message:r}):u.createElement(u.Fragment,null,s,r))});Q(u.createElement);N`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`;var we=p;const Ne=[{to:"/dashboard",icon:"🏠",label:"Home"},{to:"/profile",icon:"📊",label:"Financial Data"},{to:"/upload",icon:"📄",label:"Offers"},{to:"/analysis",icon:"🔍",label:"Analyze"}];function _({collapsed:e=!1}){const{user:t,logout:a}=T(),o=F(),[i,s]=u.useState(!1);async function r(){s(!0);try{await a(),o("/login")}catch{we.error("Logout failed. Please try again.")}finally{s(!1)}}return d.jsxs("aside",{className:["sidebar flex flex-col bg-navy-surface border-r border-border h-screen sticky top-0 transition-all duration-300",e?"w-[60px]":"w-[240px]"].join(" "),"aria-label":"Main navigation",children:[d.jsxs("div",{className:"flex items-center gap-3 px-4 py-5 border-b border-border",children:[d.jsx("span",{className:"text-2xl","aria-hidden":"true",children:"🏡"}),!e&&d.jsx("span",{className:"text-xl font-bold text-gold",children:"Morty"})]}),d.jsx("nav",{className:"flex-1 py-4 overflow-y-auto",children:Ne.map(({to:l,icon:n,label:c})=>d.jsxs(M,{to:l,className:({isActive:m})=>["flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors duration-150",m?"text-gold bg-navy-elevated border-l-2 border-gold":"text-[#94a3b8] hover:text-[#f8fafc] hover:bg-navy-elevated"].join(" "),"aria-label":c,children:[d.jsx("span",{className:"text-lg","aria-hidden":"true",children:n}),!e&&d.jsx("span",{children:c})]},l))}),d.jsxs("div",{className:"border-t border-border p-4",children:[!e&&t&&d.jsx("p",{className:"text-xs text-[#64748b] mb-2 truncate",children:t.email}),d.jsxs("button",{onClick:r,disabled:i,className:"flex items-center gap-2 text-sm text-[#94a3b8] hover:text-red-400 transition-colors w-full","aria-label":"Log out",children:[d.jsx("span",{"aria-hidden":"true",children:"🚪"}),!e&&d.jsx("span",{children:i?"Logging out...":"Log out"})]})]})]})}_.propTypes={collapsed:h.bool};function U({onMenuToggle:e}){const{user:t}=T(),[a,o]=u.useState("EN");function i(){const n=a==="EN"?"HE":"EN";o(n),document.documentElement.dir=n==="HE"?"rtl":"ltr",document.documentElement.lang=n==="HE"?"he":"en"}function s(){if(!t)return"U";const n=t.name||t.displayName;return n&&n.trim()?n.trim().split(/\s+/).map(c=>c[0]).join("").toUpperCase().slice(0,2):t.email?t.email.split("@")[0].slice(0,2).toUpperCase():"U"}function r(){return t&&(t.name||t.displayName||t.email)||"Unknown"}const l=s();return d.jsxs("header",{className:"flex items-center justify-between px-6 py-3 bg-navy-surface border-b border-border sticky top-0 z-10",children:[d.jsx("button",{onClick:e,className:"md:hidden text-[#94a3b8] hover:text-[#f8fafc] p-1","aria-label":"Toggle menu",children:"☰"}),d.jsx("div",{className:"hidden md:flex flex-1 max-w-sm",children:d.jsx("input",{type:"search",placeholder:"Search...",className:"w-full h-9 rounded-input bg-navy-elevated border border-border px-4 text-sm text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus:border-gold","aria-label":"Search"})}),d.jsxs("div",{className:"flex items-center gap-4 ml-auto",children:[d.jsx("button",{onClick:i,className:"text-xs font-medium text-[#94a3b8] hover:text-gold transition-colors","aria-label":"Toggle language",children:a==="EN"?"עברית":"EN"}),d.jsx("button",{className:"relative text-[#94a3b8] hover:text-[#f8fafc] transition-colors","aria-label":"Notifications",children:"🔔"}),d.jsx("div",{className:"w-8 h-8 rounded-full bg-gold flex items-center justify-center text-navy text-xs font-bold cursor-pointer","aria-label":`User: ${r()}`,title:r(),children:l})]})]})}U.propTypes={onMenuToggle:h.func};function Ee({children:e}){const[t,a]=u.useState(!1);return d.jsxs("div",{className:"flex min-h-screen bg-navy",children:[d.jsx("div",{className:"hidden md:block",children:d.jsx(_,{collapsed:t})}),d.jsxs("div",{className:"flex flex-col flex-1 min-w-0",children:[d.jsx(U,{onMenuToggle:()=>a(o=>!o)}),d.jsx("main",{className:"flex-1 p-6 md:p-8 page-enter",children:e})]})]})}Ee.propTypes={children:h.node.isRequired};function ke({children:e,className:t="",interactive:a=!1,goldTop:o=!1}){return d.jsx("div",{className:["bg-navy-surface border border-border rounded-card p-6 shadow-card",a&&"transition-all duration-200 hover:-translate-y-0.5 hover:border-gold cursor-pointer",o&&"border-t-[3px] border-t-gold",t].filter(Boolean).join(" "),children:e})}ke.propTypes={children:h.node.isRequired,className:h.string,interactive:h.bool,goldTop:h.bool};export{ke as C,Ee as P,we as z};
