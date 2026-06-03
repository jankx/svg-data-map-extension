(()=>{document.addEventListener("DOMContentLoaded",()=>{let S=document.querySelectorAll(".jankx-svg-data-map-runtime"),L=document.querySelectorAll(".jankx-svg-data-map-info-runtime"),y=new Map;L.forEach(o=>{let g=o.getAttribute("data-map-id")||"default-map",x=o.querySelector(".jankx-svg-map-info-content");x&&y.set(g,x)}),S.forEach(o=>{let g=o.getAttribute("data-config"),x=o.getAttribute("data-map-id")||"default-map";if(!g)return;let k;try{k=JSON.parse(g)}catch{return}let w=k.regions||[],d=o.querySelector(".jankx-svg-map-wrapper svg"),l=o.querySelector(".jankx-svg-map-info-panel")||y.get(x);if(!d||!l)return;let f=new Map;w.forEach(a=>f.set(a.id,a));let v=!1,m=null,$=()=>{l&&(l.innerHTML=`
                <div class="flex flex-col items-center justify-center h-full space-y-4 py-10">
                    <div class="w-10 h-10 border-4 border-white/30 border-t-[#1E4D65] rounded-full animate-spin"></div>
                    <p class="text-[#1E4D65] font-bold text-xs uppercase tracking-widest">\u0110ang t\xECm ki\u1EBFm...</p>
                </div>
            `)},b=()=>{l&&(l.innerHTML=`
                <div class="flex flex-col items-center justify-center h-full text-center text-[#1E4D65]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-10 h-10 mb-2 opacity-50"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <p class="font-bold text-sm">Kh\xF4ng th\u1EC3 t\u1EA3i th\xF4ng tin</p>
                </div>
            `)},j=async a=>{if(v||m===a)return;let e=f.get(a);if(!e)return;if(m){let n=f.get(m);n&&n.pathIds&&n.pathIds.forEach(u=>{let p=d.querySelector(`#${u}`);p&&p.classList.remove("jankx-map-active")});let s=o.querySelector(`.jankx-marker-btn[data-region-id="${m}"]`);s&&s.classList.remove("jankx-map-active")}m=a,e.pathIds&&e.pathIds.forEach(n=>{let s=d.querySelector(`#${n}`);s&&s.classList.add("jankx-map-active")});let t=o.querySelector(`.jankx-marker-btn[data-region-id="${a}"]`);t&&t.classList.add("jankx-map-active");let i=o.querySelector(".jankx-map-active-title")||(l.parentElement?l.parentElement.querySelector(".jankx-map-active-title"):null);i&&(i.textContent=e.name||e.label||"Khu v\u1EF1c");let c="";e.items&&e.items.length>0&&e.items.forEach(n=>{c+=`
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
                    `});let r=(n="")=>{l.innerHTML=`
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
                            ${c}
                            ${n}
                        </div>

                        <div class="pt-4 mt-4 border-t border-sky-200/80 flex items-center justify-between text-[11px] text-sky-800 font-medium">
                            <span>T\u1ECDa \u0111\u1ED9 D\u1EEF li\u1EC7u SVG</span>
                            <span class="bg-sky-200/60 px-2 py-0.5 rounded uppercase tracking-tighter">B\u1EA3n \u0111\u1ED3 \u0111\u1ED9ng</span>
                        </div>
                    </div>
                `};if(!e.termId){console.log("SVG Map: No termId, showing manual data only"),r();return}$(),v=!0;try{let n=window.jankxViewsData?.ajaxUrl||"/wp-admin/admin-ajax.php",s=new FormData;s.append("action","svg_data_map_fetch_posts"),s.append("term_id",e.termId),s.append("taxonomy",e.taxonomy||"category"),s.append("post_type",e.postType||"post");let p=await(await fetch(n,{method:"POST",body:s})).json();p.success?r(p.data.html):b()}catch(n){console.error("SVG Map: AJAX error:",n),b()}finally{v=!1}},h=(a,e)=>{let t=f.get(a);if(!t)return;t.pathIds&&t.pathIds.forEach(c=>{let r=d.querySelector(`#${c}`);r&&(e?r.classList.add("jankx-map-hover"):r.classList.remove("jankx-map-hover"))});let i=o.querySelector(`.jankx-marker-btn[data-region-id="${a}"]`);i&&(e?i.classList.add("jankx-map-marker-hover"):i.classList.remove("jankx-map-marker-hover"))};w.forEach(a=>{a.pathIds&&a.pathIds.forEach(e=>{let t=d.querySelector(`#${e}`);t&&(t.classList.add("jankx-map-region-clickable"),t.addEventListener("click",i=>{i.preventDefault(),j(a.id)}),t.addEventListener("mouseenter",()=>h(a.id,!0)),t.addEventListener("mouseleave",()=>h(a.id,!1)))})}),o.querySelectorAll(".jankx-marker-btn").forEach(a=>{let e=a,t=e.getAttribute("data-region-id"),i=e.getAttribute("data-path-id"),c=f.get(t);if(c&&c.marker){let r=c.marker;if(r.x!==void 0&&r.y!==void 0)e.style.left=`${r.x}%`,e.style.top=`${r.y}%`,e.style.display="flex",e.style.position="absolute",e.style.transform="translate(-50%, -50%)";else if(i){let n=d.querySelector(`#${i}`);if(n&&typeof n.getBBox=="function")try{let s=n.getBBox(),u=s.x+s.width/2,p=s.y+s.height/2,E=d.getAttribute("viewBox")?.split(" ").map(Number)||[0,0,1e3,1e3],M=E[2],q=E[3],B=u/M*100,I=p/q*100;e.style.left=`${B}%`,e.style.top=`${I}%`,e.style.display="flex",e.style.position="absolute",e.style.transform="translate(-50%, -50%)"}catch(s){console.error("SVG Map: Failed to calculate bbox for",i,s)}}}e.addEventListener("click",r=>{r.preventDefault(),r.stopPropagation(),console.log("SVG Map: Marker clicked for region:",t),t&&j(t)}),e.addEventListener("mouseenter",()=>{t&&h(t,!0)}),e.addEventListener("mouseleave",()=>{t&&h(t,!1)})})})});})();
