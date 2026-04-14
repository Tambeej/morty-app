import{r as m,a as O,u as D,j as l,N as F,P as y}from"./index-67281c82.js";import{u as T}from"./Button-6e92b702.js";let R={data:""},q=e=>{if(typeof window=="object"){let t=(e?e.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return t.nonce=window.__nonce__,t.parentNode||(e||document.head).appendChild(t),t.firstChild}return e||R},K=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,H=/\/\*[^]*?\*\/|  +/g,C=/\n+/g,x=(e,t)=>{let a="",s="",i="";for(let o in e){let r=e[o];o[0]=="@"?o[1]=="i"?a=o+" "+r+";":s+=o[1]=="f"?x(r,o):o+"{"+x(r,o[1]=="k"?"":t)+"}":typeof r=="object"?s+=x(r,t?t.replace(/([^,])+/g,n=>o.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,d=>/&/.test(d)?d.replace(/&/g,n):n?n+" "+d:d)):o):r!=null&&(o=/^--/.test(o)?o:o.replace(/[A-Z]/g,"-$&").toLowerCase(),i+=x.p?x.p(o,r):o+":"+r+";")}return a+(t&&i?t+"{"+i+"}":i)+s},f={},z=e=>{if(typeof e=="object"){let t="";for(let a in e)t+=a+z(e[a]);return t}return e},Z=(e,t,a,s,i)=>{let o=z(e),r=f[o]||(f[o]=(d=>{let c=0,p=11;for(;c<d.length;)p=101*p+d.charCodeAt(c++)>>>0;return"go"+p})(o));if(!f[r]){let d=o!==e?e:(c=>{let p,g,v=[{}];for(;p=K.exec(c.replace(H,""));)p[4]?v.shift():p[3]?(g=p[3].replace(C," ").trim(),v.unshift(v[0][g]=v[0][g]||{})):v[0][p[1]]=p[2].replace(C," ").trim();return v[0]})(e);f[r]=x(i?{["@keyframes "+r]:d}:d,a?"":"."+r)}let n=a&&f.g?f.g:null;return a&&(f.g=f[r]),((d,c,p,g)=>{g?c.data=c.data.replace(g,d):c.data.indexOf(d)===-1&&(c.data=p?d+c.data:c.data+d)})(f[r],t,s,n),r},B=(e,t,a)=>e.reduce((s,i,o)=>{let r=t[o];if(r&&r.call){let n=r(a),d=n&&n.props&&n.props.className||/^go/.test(n)&&n;r=d?"."+d:n&&typeof n=="object"?n.props?"":x(n,""):n===!1?"":n}return s+i+(r??"")},"");function N(e){let t=this||{},a=e.call?e(t.p):e;return Z(a.unshift?a.raw?B(a,[].slice.call(arguments,1),t.p):a.reduce((s,i)=>Object.assign(s,i&&i.call?i(t.p):i),{}):a,q(t.target),t.g,t.o,t.k)}let A,k,$;N.bind({g:1});let b=N.bind({k:1});function Q(e,t,a,s){x.p=t,A=e,k=a,$=s}function h(e,t){let a=this||{};return function(){let s=arguments;function i(o,r){let n=Object.assign({},o),d=n.className||i.className;a.p=Object.assign({theme:k&&k()},n),a.o=/ *go\d+/.test(d),n.className=N.apply(a,s)+(d?" "+d:""),t&&(n.ref=r);let c=e;return e[0]&&(c=n.as||e,delete n.as),$&&c[0]&&$(n),A(c,n)}return t?t(i):i}}var V=e=>typeof e=="function",E=(e,t)=>V(e)?e(t):e,W=(()=>{let e=0;return()=>(++e).toString()})(),Y=(()=>{let e;return()=>{if(e===void 0&&typeof window<"u"){let t=matchMedia("(prefers-reduced-motion: reduce)");e=!t||t.matches}return e}})(),G=20,S="default",I=(e,t)=>{let{toastLimit:a}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,a)};case 1:return{...e,toasts:e.toasts.map(r=>r.id===t.toast.id?{...r,...t.toast}:r)};case 2:let{toast:s}=t;return I(e,{type:e.toasts.find(r=>r.id===s.id)?1:0,toast:s});case 3:let{toastId:i}=t;return{...e,toasts:e.toasts.map(r=>r.id===i||i===void 0?{...r,dismissed:!0,visible:!1}:r)};case 4:return t.toastId===void 0?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(r=>r.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let o=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(r=>({...r,pauseDuration:r.pauseDuration+o}))}}},J=[],X={toasts:[],pausedAt:void 0,settings:{toastLimit:G}},j={},_=(e,t=S)=>{j[t]=I(j[t]||X,e),J.forEach(([a,s])=>{a===t&&s(j[t])})},M=e=>Object.keys(j).forEach(t=>_(e,t)),ee=e=>Object.keys(j).find(t=>j[t].toasts.some(a=>a.id===e)),L=(e=S)=>t=>{_(t,e)},te=(e,t="blank",a)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...a,id:(a==null?void 0:a.id)||W()}),w=e=>(t,a)=>{let s=te(t,e,a);return L(s.toasterId||ee(s.id))({type:2,toast:s}),s.id},u=(e,t)=>w("blank")(e,t);u.error=w("error");u.success=w("success");u.loading=w("loading");u.custom=w("custom");u.dismiss=(e,t)=>{let a={type:3,toastId:e};t?L(t)(a):M(a)};u.dismissAll=e=>u.dismiss(void 0,e);u.remove=(e,t)=>{let a={type:4,toastId:e};t?L(t)(a):M(a)};u.removeAll=e=>u.remove(void 0,e);u.promise=(e,t,a)=>{let s=u.loading(t.loading,{...a,...a==null?void 0:a.loading});return typeof e=="function"&&(e=e()),e.then(i=>{let o=t.success?E(t.success,i):void 0;return o?u.success(o,{id:s,...a,...a==null?void 0:a.success}):u.dismiss(s),i}).catch(i=>{let o=t.error?E(t.error,i):void 0;o?u.error(o,{id:s,...a,...a==null?void 0:a.error}):u.dismiss(s)}),e};var ae=b`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,re=b`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,se=b`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,oe=h("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${ae} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${re} 0.15s ease-out forwards;
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
    animation: ${se} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,ie=b`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,ne=h("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${ie} 1s linear infinite;
`,le=b`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,de=b`
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
}`,ce=h("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${le} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${de} 0.2s ease-out forwards;
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
`,pe=h("div")`
  position: absolute;
`,ue=h("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,me=b`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,fe=h("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${me} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,be=({toast:e})=>{let{icon:t,type:a,iconTheme:s}=e;return t!==void 0?typeof t=="string"?m.createElement(fe,null,t):t:a==="blank"?null:m.createElement(ue,null,m.createElement(ne,{...s}),a!=="loading"&&m.createElement(pe,null,a==="error"?m.createElement(oe,{...s}):m.createElement(ce,{...s})))},ge=e=>`
0% {transform: translate3d(0,${e*-200}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,xe=e=>`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${e*-150}%,-1px) scale(.6); opacity:0;}
`,he="0%{opacity:0;} 100%{opacity:1;}",ye="0%{opacity:1;} 100%{opacity:0;}",ve=h("div")`
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
`,je=h("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,we=(e,t)=>{let a=e.includes("top")?1:-1,[s,i]=Y()?[he,ye]:[ge(a),xe(a)];return{animation:t?`${b(s)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${b(i)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}};m.memo(({toast:e,position:t,style:a,children:s})=>{let i=e.height?we(e.position||t||"top-center",e.visible):{opacity:0},o=m.createElement(be,{toast:e}),r=m.createElement(je,{...e.ariaProps},E(e.message,e));return m.createElement(ve,{className:e.className,style:{...i,...a,...e.style}},typeof s=="function"?s({icon:o,message:r}):m.createElement(m.Fragment,null,o,r))});Q(m.createElement);N`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`;var Ne=u;const ke=[{to:"/dashboard",icon:"🏠",labelKey:"sidebar.home"},{to:"/profile",icon:"📊",labelKey:"sidebar.financialData"},{to:"/upload",icon:"📄",labelKey:"sidebar.offers"},{to:"/analysis",icon:"🔍",labelKey:"sidebar.analyze"}];function P({collapsed:e=!1}){const{t}=T(),{user:a,logout:s}=O(),i=D(),[o,r]=m.useState(!1);async function n(){r(!0);try{await s(),i("/login")}catch{Ne.error(t("sidebar.logoutError"))}finally{r(!1)}}return l.jsxs("aside",{className:["sidebar flex flex-col bg-navy-surface border-r border-border h-screen sticky top-0 transition-all duration-300",e?"w-[60px]":"w-[240px]"].join(" "),"aria-label":"Main navigation",children:[l.jsxs("div",{className:"flex items-center gap-3 px-4 py-5 border-b border-border",children:[l.jsx("span",{className:"text-2xl","aria-hidden":"true",children:"🏡"}),!e&&l.jsx("span",{className:"text-xl font-bold text-gold",children:"Morty"})]}),l.jsx("nav",{className:"flex-1 py-4 overflow-y-auto",children:ke.map(({to:d,icon:c,labelKey:p})=>l.jsxs(F,{to:d,className:({isActive:g})=>["flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors duration-150",g?"text-gold bg-navy-elevated border-l-2 border-gold":"text-[#94a3b8] hover:text-[#f8fafc] hover:bg-navy-elevated"].join(" "),"aria-label":t(p),children:[l.jsx("span",{className:"text-lg","aria-hidden":"true",children:c}),!e&&l.jsx("span",{children:t(p)})]},d))}),l.jsxs("div",{className:"border-t border-border p-4",children:[!e&&a&&l.jsx("p",{className:"text-xs text-[#64748b] mb-2 truncate",children:a.email}),l.jsxs("button",{onClick:n,disabled:o,className:"flex items-center gap-2 text-sm text-[#94a3b8] hover:text-red-400 transition-colors w-full","aria-label":t("sidebar.logOut"),children:[l.jsx("span",{"aria-hidden":"true",children:"🚪"}),!e&&l.jsx("span",{children:t(o?"sidebar.loggingOut":"sidebar.logOut")})]})]})]})}P.propTypes={collapsed:y.bool};function U({onMenuToggle:e}){const{user:t}=O(),{t:a,i18n:s}=T(),i=s.language;function o(){const c=i==="en"?"he":"en";s.changeLanguage(c)}function r(){if(!t)return"U";const c=t.name||t.displayName;return c&&c.trim()?c.trim().split(/\s+/).map(p=>p[0]).join("").toUpperCase().slice(0,2):t.email?t.email.split("@")[0].slice(0,2).toUpperCase():"U"}function n(){return t?a("nav.userLabel",{label:t.name||t.displayName||t.email||"Unknown"}):a("nav.userLabel",{label:"Unknown"})}const d=r();return l.jsxs("header",{className:"flex items-center justify-between px-6 py-3 bg-navy-surface border-b border-border sticky top-0 z-10",children:[l.jsx("button",{onClick:e,className:"md:hidden text-[#94a3b8] hover:text-[#f8fafc] p-1","aria-label":a("nav.toggleMenu"),children:"☰"}),l.jsx("div",{className:"hidden md:flex flex-1 max-w-sm",children:l.jsx("input",{type:"search",placeholder:a("nav.search.placeholder"),className:"w-full h-9 rounded-input bg-navy-elevated border border-border px-4 text-sm text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus:border-gold","aria-label":a("nav.search.placeholder")})}),l.jsxs("div",{className:"flex items-center gap-4 ml-auto",children:[l.jsx("button",{onClick:o,className:"text-xs font-medium text-[#94a3b8] hover:text-gold transition-colors","aria-label":a("nav.toggleLanguage"),children:a(i==="en"?"nav.language.he":"nav.language.en")}),l.jsx("button",{className:"relative text-[#94a3b8] hover:text-[#f8fafc] transition-colors","aria-label":a("nav.notifications"),children:"🔔"}),l.jsx("div",{className:"w-8 h-8 rounded-full bg-gold flex items-center justify-center text-navy text-xs font-bold cursor-pointer","aria-label":n(),title:n(),children:d})]})]})}U.propTypes={onMenuToggle:y.func};function $e({children:e}){const[t,a]=m.useState(!1);return l.jsxs("div",{className:"flex min-h-screen bg-navy",children:[l.jsx("div",{className:"hidden md:block",children:l.jsx(P,{collapsed:t})}),l.jsxs("div",{className:"flex flex-col flex-1 min-w-0",children:[l.jsx(U,{onMenuToggle:()=>a(s=>!s)}),l.jsx("main",{className:"flex-1 p-6 md:p-8 page-enter",children:e})]})]})}$e.propTypes={children:y.node.isRequired};function Ee({children:e,className:t="",interactive:a=!1,goldTop:s=!1}){return l.jsx("div",{className:["bg-navy-surface border border-border rounded-card p-6 shadow-card",a&&"transition-all duration-200 hover:-translate-y-0.5 hover:border-gold cursor-pointer",s&&"border-t-[3px] border-t-gold",t].filter(Boolean).join(" "),children:e})}Ee.propTypes={children:y.node.isRequired,className:y.string,interactive:y.bool,goldTop:y.bool};export{Ee as C,$e as P,Ne as z};
