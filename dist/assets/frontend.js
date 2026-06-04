(()=>{document.addEventListener("DOMContentLoaded",()=>{let I=document.querySelectorAll(".jankx-svg-data-map-runtime"),A=document.querySelectorAll(".jankx-svg-data-map-info-runtime"),w=new Map;A.forEach(s=>{let h=s.getAttribute("data-map-id")||"default-map",u=s.querySelector(".jankx-svg-map-info-content");u&&w.set(h,u)}),I.forEach(s=>{let h=s.getAttribute("data-config"),u=s.getAttribute("data-map-id")||"default-map";if(!h)return;let b;try{b=JSON.parse(h)}catch{return}let E=b.regions||[],f=s.querySelector(".jankx-svg-map-wrapper svg"),d=s.querySelector(".jankx-svg-map-info-panel")||w.get(u);if(!f||!d)return;let g=new Map;E.forEach(e=>g.set(e.id,e));let v=!1,x=null,D=()=>{d&&(d.innerHTML=`
                <div class="flex flex-col items-center justify-center h-full space-y-4 py-10">
                    <div class="w-10 h-10 border-4 border-white/30 border-t-[#1E4D65] rounded-full animate-spin"></div>
                    <p class="text-[#1E4D65] font-bold text-xs uppercase tracking-widest">\u0110ang t\xECm ki\u1EBFm...</p>
                </div>
            `)},j=()=>{d&&(d.innerHTML=`
                <div class="flex flex-col items-center justify-center h-full text-center text-[#1E4D65]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-10 h-10 mb-2 opacity-50"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <p class="font-bold text-sm">Kh\xF4ng th\u1EC3 t\u1EA3i th\xF4ng tin</p>
                </div>
            `)},S=async e=>{if(v||x===e)return;let t=g.get(e);if(!t)return;if(x){let a=g.get(x);a&&a.pathIds&&a.pathIds.forEach(c=>{let p=f.querySelector(`#${c}`);p&&p.classList.remove("jankx-map-active")});let o=s.querySelector(`.jankx-marker-btn[data-region-id="${x}"]`);o&&o.classList.remove("jankx-map-active")}x=e,t.pathIds&&t.pathIds.forEach(a=>{let o=f.querySelector(`#${a}`);o&&o.classList.add("jankx-map-active")});let n=s.querySelector(`.jankx-marker-btn[data-region-id="${e}"]`);n&&n.classList.add("jankx-map-active");let r=s.querySelector(".jankx-map-active-title")||(d.parentElement?d.parentElement.querySelector(".jankx-map-active-title"):null);r&&(r.textContent=t.name||t.label||"Khu v\u1EF1c");let i="";t.items&&t.items.length>0&&t.items.forEach(a=>{i+=`
                        <div class="bg-indigo-50/50 p-5 rounded-xl shadow-sm border border-indigo-100/50 hover:shadow transition mb-4 animate-in">
                            <div class="flex items-center gap-2 mb-1.5">
                                <span class="p-0.5 px-1.5 rounded bg-indigo-600 text-white text-[9px] font-bold uppercase tracking-wider">Ghim</span>
                                <h3 class="font-bold text-slate-900 text-base m-0 tracking-tight">${a.title||"Th\xF4ng tin"}</h3>
                            </div>
                            <p class="text-slate-600 text-xs leading-relaxed whitespace-pre-wrap break-words line-clamp-3">${a.description||""}</p>
                            ${a.linkUrl?`
                                <a href="${a.linkUrl}" target="_blank" class="inline-flex items-center gap-1 mt-3 font-sans font-bold text-xs text-indigo-800 hover:text-indigo-900 transition-colors">
                                    <span>${a.linkLabel||"Xem chi ti\u1EBFt"}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                </a>
                            `:""}
                        </div>
                    `});let l=(a="")=>{d.innerHTML=`
                    <div class="flex flex-col h-full justify-between animate-fade-in">
                        <div>
                            <h2 class="text-3xl font-sans font-bold text-slate-800 tracking-tight mb-1 flex items-center gap-2 m-0 p-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-indigo-800 shrink-0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                ${t.name||"H\u1EA1ng m\u1EE5c"}
                            </h2>
                            <p class="text-slate-600/90 text-xs leading-relaxed mb-5 mt-1">
                                ${t.description||"Th\xF4ng tin chi ti\u1EBFt v\u1EC1 khu v\u1EF1c di s\u1EA3n n\xE0y."}
                            </p>
                        </div>

                        <div class="flex-1 overflow-y-auto space-y-4 max-h-[460px] pr-2 custom-scrollbar">
                            ${i}
                            ${a}
                        </div>

                        <div class="pt-4 mt-4 border-t border-sky-200/80 flex items-center justify-between text-[11px] text-sky-800 font-medium">
                            <span>T\u1ECDa \u0111\u1ED9 D\u1EEF li\u1EC7u SVG</span>
                            <span class="bg-sky-200/60 px-2 py-0.5 rounded uppercase tracking-tighter">B\u1EA3n \u0111\u1ED3 \u0111\u1ED9ng</span>
                        </div>
                    </div>
                `};if(!t.termId){console.log("SVG Map: No termId, showing manual data only"),l();return}D(),v=!0;try{let a=window.jankxViewsData?.ajaxUrl||"/wp-admin/admin-ajax.php",o=new FormData;o.append("action","svg_data_map_fetch_posts"),o.append("term_id",t.termId),o.append("taxonomy",t.taxonomy||"category"),o.append("post_type",t.postType||"post");let p=await(await fetch(a,{method:"POST",body:o})).json();p.success?l(p.data.html):j()}catch(a){console.error("SVG Map: AJAX error:",a),j()}finally{v=!1}},y=(e,t)=>{let n=g.get(e);if(!n)return;n.pathIds&&n.pathIds.forEach(i=>{let l=f.querySelector(`#${i}`);l&&(t?l.classList.add("jankx-map-hover"):l.classList.remove("jankx-map-hover"))});let r=s.querySelector(`.jankx-marker-btn[data-region-id="${e}"]`);r&&(t?r.classList.add("jankx-map-marker-hover"):r.classList.remove("jankx-map-marker-hover"))};E.forEach(e=>{e.pathIds&&e.pathIds.forEach(t=>{let n=f.querySelector(`#${t}`);n&&(n.classList.add("jankx-map-region-clickable"),n.addEventListener("click",r=>{r.preventDefault(),S(e.id)}),n.addEventListener("mouseenter",()=>y(e.id,!0)),n.addEventListener("mouseleave",()=>y(e.id,!1)))})});let m=1,L=Array.from(s.querySelectorAll(".jankx-marker-btn")),G=()=>{L.forEach(e=>{e.style.transform=`translate(-50%, -50%) scale(${m})`,e.style.transformOrigin="center bottom"})};L.forEach(e=>{let t=e.getAttribute("data-region-id"),n=e.getAttribute("data-path-id"),r=(i=5)=>{if(n){let l=f,a=l.querySelector(`#${n}`),o=s.querySelector(".jankx-markers-layer");if(a&&o&&typeof a.getBBox=="function")try{let c=a.getBBox(),p=c.x+c.width/2,V=c.y+c.height/2,M=l.getScreenCTM();if(M){let k=l.createSVGPoint();k.x=p,k.y=V;let $=k.matrixTransform(M),q=o.getBoundingClientRect(),H=($.x-q.left)/m,C=($.y-q.top)/m,T=g.get(t),O=T?.marker?.markerOffsetX??0,P=T?.marker?.markerOffsetY??0;e.style.left=`${H+O}px`,e.style.top=`${C+P}px`,e.style.transform=`translate(-50%, -50%) scale(${m})`,e.style.transformOrigin="center bottom",e.style.display="flex",e.style.position="absolute"}else i>0&&setTimeout(()=>r(i-1),100)}catch(c){console.error("SVG Map: Failed to calculate bbox for",n,c)}else i>0&&setTimeout(()=>r(i-1),100)}};r(),window.addEventListener("resize",()=>{r()}),e.addEventListener("click",i=>{i.preventDefault(),i.stopPropagation(),t&&S(t)}),e.addEventListener("mouseenter",()=>{t&&y(t,!0)}),e.addEventListener("mouseleave",()=>{t&&y(t,!1)})}),(s.querySelector("#map-container-root")||s).addEventListener("wheel",e=>{e.preventDefault();let t=e.deltaY<0?.05:-.05;m=Math.max(.5,Math.min(5,m+t)),G()},{passive:!1})})});})();
