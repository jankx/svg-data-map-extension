(()=>{document.addEventListener("DOMContentLoaded",()=>{let $=document.querySelectorAll(".jankx-svg-data-map-runtime"),q=document.querySelectorAll(".jankx-svg-data-map-info-runtime"),k=new Map;q.forEach(r=>{let g=r.getAttribute("data-map-id")||"default-map",x=r.querySelector(".jankx-svg-map-info-content");x&&k.set(g,x)}),$.forEach(r=>{let g=r.getAttribute("data-config"),x=r.getAttribute("data-map-id")||"default-map";if(!g)return;let w;try{w=JSON.parse(g)}catch{return}let b=w.regions||[],m=r.querySelector(".jankx-svg-map-wrapper svg"),c=r.querySelector(".jankx-svg-map-info-panel")||k.get(x);if(!m||!c)return;let h=new Map;b.forEach(a=>h.set(a.id,a));let v=!1,f=null,B=()=>{c&&(c.innerHTML=`
                <div class="flex flex-col items-center justify-center h-full space-y-4 py-10">
                    <div class="w-10 h-10 border-4 border-white/30 border-t-[#1E4D65] rounded-full animate-spin"></div>
                    <p class="text-[#1E4D65] font-bold text-xs uppercase tracking-widest">\u0110ang t\xECm ki\u1EBFm...</p>
                </div>
            `)},j=()=>{c&&(c.innerHTML=`
                <div class="flex flex-col items-center justify-center h-full text-center text-[#1E4D65]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-10 h-10 mb-2 opacity-50"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <p class="font-bold text-sm">Kh\xF4ng th\u1EC3 t\u1EA3i th\xF4ng tin</p>
                </div>
            `)},E=async a=>{if(v||f===a)return;let e=h.get(a);if(!e)return;if(f){let t=h.get(f);t&&t.pathIds&&t.pathIds.forEach(l=>{let p=m.querySelector(`#${l}`);p&&p.classList.remove("jankx-map-active")});let s=r.querySelector(`.jankx-marker-btn[data-region-id="${f}"]`);s&&s.classList.remove("jankx-map-active")}f=a,e.pathIds&&e.pathIds.forEach(t=>{let s=m.querySelector(`#${t}`);s&&s.classList.add("jankx-map-active")});let n=r.querySelector(`.jankx-marker-btn[data-region-id="${a}"]`);n&&n.classList.add("jankx-map-active");let i=r.querySelector(".jankx-map-active-title")||(c.parentElement?c.parentElement.querySelector(".jankx-map-active-title"):null);i&&(i.textContent=e.name||e.label||"Khu v\u1EF1c");let d="";e.items&&e.items.length>0&&e.items.forEach(t=>{d+=`
                        <div class="bg-indigo-50/50 p-5 rounded-xl shadow-sm border border-indigo-100/50 hover:shadow transition mb-4 animate-in">
                            <div class="flex items-center gap-2 mb-1.5">
                                <span class="p-0.5 px-1.5 rounded bg-indigo-600 text-white text-[9px] font-bold uppercase tracking-wider">Ghim</span>
                                <h3 class="font-bold text-slate-900 text-base m-0 tracking-tight">${t.title||"Th\xF4ng tin"}</h3>
                            </div>
                            <p class="text-slate-600 text-xs leading-relaxed whitespace-pre-wrap break-words line-clamp-3">${t.description||""}</p>
                            ${t.linkUrl?`
                                <a href="${t.linkUrl}" target="_blank" class="inline-flex items-center gap-1 mt-3 font-sans font-bold text-xs text-indigo-800 hover:text-indigo-900 transition-colors">
                                    <span>${t.linkLabel||"Xem chi ti\u1EBFt"}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                </a>
                            `:""}
                        </div>
                    `});let o=(t="")=>{c.innerHTML=`
                    <div class="flex flex-col h-full justify-between animate-fade-in">
                        <div>
                            <h2 class="text-3xl font-sans font-bold text-slate-800 tracking-tight mb-1 flex items-center gap-2 m-0 p-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-indigo-800 shrink-0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                ${e.name||"H\u1EA1ng m\u1EE5c"}
                            </h2>
                            <p class="text-slate-600/90 text-xs leading-relaxed mb-5 mt-1">
                                ${e.description||"Th\xF4ng tin chi ti\u1EBFt v\u1EC1 khu v\u1EF1c di s\u1EA3n n\xE0y."}
                            </p>
                        </div>

                        <div class="flex-1 overflow-y-auto space-y-4 max-h-[460px] pr-2 custom-scrollbar">
                            ${d}
                            ${t}
                        </div>

                        <div class="pt-4 mt-4 border-t border-sky-200/80 flex items-center justify-between text-[11px] text-sky-800 font-medium">
                            <span>T\u1ECDa \u0111\u1ED9 D\u1EEF li\u1EC7u SVG</span>
                            <span class="bg-sky-200/60 px-2 py-0.5 rounded uppercase tracking-tighter">B\u1EA3n \u0111\u1ED3 \u0111\u1ED9ng</span>
                        </div>
                    </div>
                `};if(!e.termId){console.log("SVG Map: No termId, showing manual data only"),o();return}B(),v=!0;try{let t=window.jankxViewsData?.ajaxUrl||"/wp-admin/admin-ajax.php",s=new FormData;s.append("action","svg_data_map_fetch_posts"),s.append("term_id",e.termId),s.append("taxonomy",e.taxonomy||"category"),s.append("post_type",e.postType||"post");let p=await(await fetch(t,{method:"POST",body:s})).json();p.success?o(p.data.html):j()}catch(t){console.error("SVG Map: AJAX error:",t),j()}finally{v=!1}},u=(a,e)=>{let n=h.get(a);if(!n)return;n.pathIds&&n.pathIds.forEach(d=>{let o=m.querySelector(`#${d}`);o&&(e?o.classList.add("jankx-map-hover"):o.classList.remove("jankx-map-hover"))});let i=r.querySelector(`.jankx-marker-btn[data-region-id="${a}"]`);i&&(e?i.classList.add("jankx-map-marker-hover"):i.classList.remove("jankx-map-marker-hover"))};b.forEach(a=>{a.pathIds&&a.pathIds.forEach(e=>{let n=m.querySelector(`#${e}`);n&&(n.classList.add("jankx-map-region-clickable"),n.addEventListener("click",i=>{i.preventDefault(),E(a.id)}),n.addEventListener("mouseenter",()=>u(a.id,!0)),n.addEventListener("mouseleave",()=>u(a.id,!1)))})}),r.querySelectorAll(".jankx-marker-btn").forEach(a=>{let e=a,n=e.getAttribute("data-region-id"),i=e.getAttribute("data-path-id"),d=()=>{if(i){let o=m,t=o.querySelector(`#${i}`),s=r.querySelector(".jankx-markers-layer");if(t&&s&&typeof t.getBBox=="function")try{let l=t.getBBox(),p=l.x+l.width/2,I=l.y+l.height/2,S=o.getScreenCTM();if(S){let y=o.createSVGPoint();y.x=p,y.y=I;let L=y.matrixTransform(S),M=s.getBoundingClientRect(),T=L.x-M.left,A=L.y-M.top;e.style.left=`${T}px`,e.style.top=`${A}px`,e.style.transform="translate(-50%, -50%)",e.style.display="flex",e.style.position="absolute"}}catch(l){console.error("SVG Map: Failed to calculate bbox for",i,l)}}};d(),window.addEventListener("resize",d),e.addEventListener("click",o=>{o.preventDefault(),o.stopPropagation(),console.log("SVG Map: Marker clicked for region:",n),n&&E(n)}),e.addEventListener("mouseenter",()=>{n&&u(n,!0)}),e.addEventListener("mouseleave",()=>{n&&u(n,!1)})})})});})();
