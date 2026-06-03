(()=>{document.addEventListener("DOMContentLoaded",()=>{let E=document.querySelectorAll(".jankx-svg-data-map-runtime"),S=document.querySelectorAll(".jankx-svg-data-map-info-runtime"),k=new Map;S.forEach(i=>{let g=i.getAttribute("data-map-id")||"default-map",x=i.querySelector(".jankx-svg-map-info-content");x&&k.set(g,x)}),E.forEach(i=>{let g=i.getAttribute("data-config"),x=i.getAttribute("data-map-id")||"default-map";if(!g)return;let y;try{y=JSON.parse(g)}catch{return}let w=y.regions||[],d=i.querySelector(".jankx-svg-map-wrapper svg"),c=i.querySelector(".jankx-svg-map-info-panel")||k.get(x);if(!d||!c)return;let h=new Map;w.forEach(n=>h.set(n.id,n));let v=!1,m=null,L=()=>{c&&(c.innerHTML=`
                <div class="flex flex-col items-center justify-center h-full space-y-4 py-10">
                    <div class="w-10 h-10 border-4 border-white/30 border-t-[#1E4D65] rounded-full animate-spin"></div>
                    <p class="text-[#1E4D65] font-bold text-xs uppercase tracking-widest">\u0110ang t\xECm ki\u1EBFm...</p>
                </div>
            `)},b=()=>{c&&(c.innerHTML=`
                <div class="flex flex-col items-center justify-center h-full text-center text-[#1E4D65]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-10 h-10 mb-2 opacity-50"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <p class="font-bold text-sm">Kh\xF4ng th\u1EC3 t\u1EA3i th\xF4ng tin</p>
                </div>
            `)},j=async n=>{if(v||m===n)return;let e=h.get(n);if(!e)return;if(m){let a=h.get(m);a&&a.pathIds&&a.pathIds.forEach(f=>{let p=d.querySelector(`#${f}`);p&&p.classList.remove("jankx-map-active")});let r=i.querySelector(`.jankx-marker-btn[data-region-id="${m}"]`);r&&r.classList.remove("jankx-map-active")}m=n,e.pathIds&&e.pathIds.forEach(a=>{let r=d.querySelector(`#${a}`);r&&r.classList.add("jankx-map-active")});let t=i.querySelector(`.jankx-marker-btn[data-region-id="${n}"]`);t&&t.classList.add("jankx-map-active");let o=i.querySelector(".jankx-map-active-title")||(c.parentElement?c.parentElement.querySelector(".jankx-map-active-title"):null);o&&(o.textContent=e.name||e.label||"Khu v\u1EF1c");let l="";e.items&&e.items.length>0&&e.items.forEach(a=>{l+=`
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
                    `});let s=(a="")=>{c.innerHTML=`
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
                            ${l}
                            ${a}
                        </div>

                        <div class="pt-4 mt-4 border-t border-sky-200/80 flex items-center justify-between text-[11px] text-sky-800 font-medium">
                            <span>T\u1ECDa \u0111\u1ED9 D\u1EEF li\u1EC7u SVG</span>
                            <span class="bg-sky-200/60 px-2 py-0.5 rounded uppercase tracking-tighter">B\u1EA3n \u0111\u1ED3 \u0111\u1ED9ng</span>
                        </div>
                    </div>
                `};if(!e.termId){console.log("SVG Map: No termId, showing manual data only"),s();return}L(),v=!0;try{let a=window.jankxViewsData?.ajaxUrl||"/wp-admin/admin-ajax.php",r=new FormData;r.append("action","svg_data_map_fetch_posts"),r.append("term_id",e.termId),r.append("taxonomy",e.taxonomy||"category"),r.append("post_type",e.postType||"post");let p=await(await fetch(a,{method:"POST",body:r})).json();p.success?s(p.data.html):b()}catch(a){console.error("SVG Map: AJAX error:",a),b()}finally{v=!1}},u=(n,e)=>{let t=h.get(n);if(!t)return;t.pathIds&&t.pathIds.forEach(l=>{let s=d.querySelector(`#${l}`);s&&(e?s.classList.add("jankx-map-hover"):s.classList.remove("jankx-map-hover"))});let o=i.querySelector(`.jankx-marker-btn[data-region-id="${n}"]`);o&&(e?o.classList.add("jankx-map-marker-hover"):o.classList.remove("jankx-map-marker-hover"))};w.forEach(n=>{n.pathIds&&n.pathIds.forEach(e=>{let t=d.querySelector(`#${e}`);t&&(t.classList.add("jankx-map-region-clickable"),t.addEventListener("click",o=>{o.preventDefault(),j(n.id)}),t.addEventListener("mouseenter",()=>u(n.id,!0)),t.addEventListener("mouseleave",()=>u(n.id,!1)))})}),i.querySelectorAll(".jankx-marker-btn").forEach(n=>{let e=n,t=e.getAttribute("data-region-id"),o=e.getAttribute("data-path-id");if(o){let l=d.querySelector(`#${o}`);if(l&&typeof l.getBBox=="function")try{let s=l.getBBox(),a=s.x+s.width/2,r=s.y+s.height/2,f=d.getAttribute("viewBox")?.split(" ").map(Number)||[0,0,1e3,1e3],p=f[2],$=f[3],M=a/p*100,q=r/$*100;e.style.left=`${M}%`,e.style.top=`${q}%`,e.style.display="flex",e.style.position="absolute"}catch(s){console.error("SVG Map: Failed to calculate bbox for",o,s)}}e.addEventListener("click",l=>{l.preventDefault(),l.stopPropagation(),console.log("SVG Map: Marker clicked for region:",t),t&&j(t)}),e.addEventListener("mouseenter",()=>{t&&u(t,!0)}),e.addEventListener("mouseleave",()=>{t&&u(t,!1)})})})});})();
