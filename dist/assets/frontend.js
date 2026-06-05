(()=>{document.addEventListener("DOMContentLoaded",()=>{let q=document.querySelectorAll(".jankx-svg-data-map-runtime"),I=document.querySelectorAll(".jankx-svg-data-map-info-runtime"),w=new Map;I.forEach(r=>{let x=r.getAttribute("data-map-id")||"default-map",h=r.querySelector(".jankx-svg-map-info-content");h&&w.set(x,h)}),q.forEach(r=>{let x=r.getAttribute("data-config"),h=r.getAttribute("data-map-id")||"default-map";if(!x)return;let b;try{b=JSON.parse(x)}catch{return}let j=b.regions||[],d=r.querySelector(".jankx-svg-map-wrapper svg"),c=r.querySelector(".jankx-svg-map-info-panel")||w.get(h);if(!d||!c)return;let f=new Map;j.forEach(e=>f.set(e.id,e));let y=!1,m=null,A=()=>{c&&(c.innerHTML=`
                <div class="flex flex-col items-center justify-center h-full space-y-4 py-10">
                    <div class="w-10 h-10 border-4 border-white/30 border-t-[#1E4D65] rounded-full animate-spin"></div>
                    <p class="text-[#1E4D65] font-bold text-xs uppercase tracking-widest">\u0110ang t\xECm ki\u1EBFm...</p>
                </div>
            `)},E=()=>{c&&(c.innerHTML=`
                <div class="flex flex-col items-center justify-center h-full text-center text-[#1E4D65]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-10 h-10 mb-2 opacity-50"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <p class="font-bold text-sm">Kh\xF4ng th\u1EC3 t\u1EA3i th\xF4ng tin</p>
                </div>
            `)},S=async e=>{if(y||m===e)return;let t=f.get(e);if(!t)return;if(m){let n=f.get(m);n&&n.pathIds&&n.pathIds.forEach(l=>{let p=d.querySelector(`#${l}`);p&&p.classList.remove("jankx-map-active")});let a=r.querySelector(`.jankx-marker-btn[data-region-id="${m}"]`);a&&a.classList.remove("jankx-map-active")}m=e,t.pathIds&&t.pathIds.forEach(n=>{let a=d.querySelector(`#${n}`);a&&a.classList.add("jankx-map-active")});let s=r.querySelector(`.jankx-marker-btn[data-region-id="${e}"]`);s&&s.classList.add("jankx-map-active");let i=r.querySelector(".jankx-map-active-title")||(c.parentElement?c.parentElement.querySelector(".jankx-map-active-title"):null);i&&(i.textContent=t.name||t.label||"Khu v\u1EF1c");let g="";t.items&&t.items.length>0&&t.items.forEach(n=>{g+=`
                        <div class="bg-indigo-50/50 p-5 rounded-xl shadow-sm border border-indigo-100/50 hover:shadow transition mb-4 animate-in">
                            <div class="flex items-center gap-2 mb-1.5">
                                <span class="p-0.5 px-1.5 rounded bg-indigo-600 text-white text-[9px] font-bold uppercase tracking-wider">Ghim</span>
                                <h3 class="font-bold text-slate-900 text-base m-0 tracking-tight">${n.title||"Th\xF4ng tin"}</h3>
                            </div>
                            <p class="text-slate-600 text-xs leading-relaxed whitespace-pre-wrap break-words line-clamp-3">${n.description||""}</p>
                            ${n.linkUrl?`
                                <a href="${n.linkUrl}" target="_blank" class="inline-flex items-center gap-1 mt-3 font-sans font-bold text-xs text-indigo-800 hover:text-indigo-900 transition-colors">
                                    <span>${n.linkLabel||"Xem chi ti\u1EBFt"}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                </a>
                            `:""}
                        </div>
                    `});let o=(n="")=>{c.innerHTML=`
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
                            ${g}
                            ${n}
                        </div>

                        <div class="pt-4 mt-4 border-t border-sky-200/80 flex items-center justify-between text-[11px] text-sky-800 font-medium">
                            <span>T\u1ECDa \u0111\u1ED9 D\u1EEF li\u1EC7u SVG</span>
                            <span class="bg-sky-200/60 px-2 py-0.5 rounded uppercase tracking-tighter">B\u1EA3n \u0111\u1ED3 \u0111\u1ED9ng</span>
                        </div>
                    </div>
                `};if(!t.termId){console.log("SVG Map: No termId, showing manual data only"),o();return}A(),y=!0;try{let n=window.jankxViewsData?.ajaxUrl||"/wp-admin/admin-ajax.php",a=new FormData;a.append("action","svg_data_map_fetch_posts"),a.append("term_id",t.termId),a.append("taxonomy",t.taxonomy||"category"),a.append("post_type",t.postType||"post");let p=await(await fetch(n,{method:"POST",body:a})).json();p.success?o(p.data.html):E()}catch(n){console.error("SVG Map: AJAX error:",n),E()}finally{y=!1}},u=(e,t)=>{let s=f.get(e);if(!s)return;s.pathIds&&s.pathIds.forEach(g=>{let o=d.querySelector(`#${g}`);o&&(t?o.classList.add("jankx-map-hover"):o.classList.remove("jankx-map-hover"))});let i=r.querySelector(`.jankx-marker-btn[data-region-id="${e}"]`);i&&(t?i.classList.add("jankx-map-marker-hover"):i.classList.remove("jankx-map-marker-hover"))};j.forEach(e=>{e.pathIds&&e.pathIds.forEach(t=>{let s=d.querySelector(`#${t}`);s&&(s.classList.add("jankx-map-region-clickable"),s.addEventListener("click",i=>{i.preventDefault(),S(e.id)}),s.addEventListener("mouseenter",()=>u(e.id,!0)),s.addEventListener("mouseleave",()=>u(e.id,!1)))})}),Array.from(r.querySelectorAll(".jankx-marker-btn")).forEach(e=>{let t=e.getAttribute("data-region-id"),s=e.getAttribute("data-path-id"),i=()=>{if(s){let o=d,n=o.querySelector(`#${s}`),a=r.querySelector(".jankx-markers-layer");if(n&&a&&typeof n.getBBox=="function")try{let l=n.getBBox(),p=l.x+l.width/2,T=l.y+l.height/2,v=o.getScreenCTM();if(v&&v.a!==0&&v.d!==0){let k=o.createSVGPoint();k.x=p,k.y=T;let L=k.matrixTransform(v),M=a.getBoundingClientRect(),D=L.x-M.left,G=L.y-M.top,$=f.get(t),H=$?.marker?.markerOffsetX??0,C=$?.marker?.markerOffsetY??0;e.style.left=`${D+H}px`,e.style.top=`${G+C}px`,e.style.transform="translate(-50%, -50%)",e.style.transformOrigin="center bottom",e.style.display="flex",e.style.position="absolute"}}catch(l){console.error("SVG Map: Failed to calculate bbox for",s,l)}}};i(),new ResizeObserver(()=>{i()}).observe(d),e.addEventListener("click",o=>{o.preventDefault(),o.stopPropagation(),t&&S(t)}),e.addEventListener("mouseenter",()=>{t&&u(t,!0)}),e.addEventListener("mouseleave",()=>{t&&u(t,!1)})})})});})();
