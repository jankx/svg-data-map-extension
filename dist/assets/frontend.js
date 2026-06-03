(()=>{document.addEventListener("DOMContentLoaded",()=>{let y=document.querySelectorAll(".jankx-svg-data-map-runtime"),w=document.querySelectorAll(".jankx-svg-data-map-info-runtime"),g=new Map;w.forEach(s=>{let o=s.getAttribute("data-map-id")||"default-map",l=s.querySelector(".jankx-svg-map-info-content");l&&g.set(o,l)}),y.forEach(s=>{let o=s.getAttribute("data-config"),l=s.getAttribute("data-map-id")||"default-map";if(!o)return;let u;try{u=JSON.parse(o)}catch{return}let x=u.regions||[],c=s.querySelector(".jankx-svg-map-wrapper svg"),r=s.querySelector(".jankx-svg-map-info-panel")||g.get(l);if(!c||!r)return;let p=new Map;x.forEach(e=>p.set(e.id,e));let f=!1,d=null,k=()=>{r&&(r.innerHTML=`
                <div class="flex flex-col items-center justify-center h-full space-y-4 py-10">
                    <div class="w-10 h-10 border-4 border-white/30 border-t-[#1E4D65] rounded-full animate-spin"></div>
                    <p class="text-[#1E4D65] font-bold text-xs uppercase tracking-widest">\u0110ang t\xECm ki\u1EBFm...</p>
                </div>
            `)},h=()=>{r&&(r.innerHTML=`
                <div class="flex flex-col items-center justify-center h-full text-center text-[#1E4D65]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-10 h-10 mb-2 opacity-50"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <p class="font-bold text-sm">Kh\xF4ng th\u1EC3 t\u1EA3i th\xF4ng tin</p>
                </div>
            `)},v=async e=>{if(f||d===e)return;let t=p.get(e);if(!t||!t.termId)return;if(d){let n=p.get(d);n&&n.pathIds&&n.pathIds.forEach(a=>{let m=c.querySelector(`#${a}`);m&&m.classList.remove("jankx-map-active")})}d=e,t.pathIds&&t.pathIds.forEach(n=>{let a=c.querySelector(`#${n}`);a&&a.classList.add("jankx-map-active")});let i=s.querySelector(".jankx-map-active-title")||(r.parentElement?r.parentElement.querySelector(".jankx-map-active-title"):null);i&&(i.textContent=t.name||t.label||"Khu v\u1EF1c"),k(),f=!0;try{let n=window.jankxViewsData?.ajaxUrl||"/wp-admin/admin-ajax.php",a=new FormData;a.append("action","svg_data_map_fetch_posts"),a.append("term_id",t.termId),a.append("taxonomy",t.taxonomy||"category"),a.append("post_type",t.postType||"post"),(await(await fetch(n,{method:"POST",body:a})).json()).success?r.innerHTML=`
                        <div class="flex flex-col h-full justify-between animate-fade-in">
                            <div>
                                <h2 class="text-3xl font-sans font-bold text-slate-800 tracking-tight mb-1 flex items-center gap-2 m-0 p-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-indigo-800 shrink-0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                    \${region.name || 'H\u1EA1ng m\u1EE5c'}
                                </h2>
                                <p class="text-slate-600/90 text-xs leading-relaxed mb-5 mt-1">
                                    \${region.description || 'Th\xF4ng tin chi ti\u1EBFt v\u1EC1 khu v\u1EF1c di s\u1EA3n n\xE0y.'}
                                </p>
                            </div>

                            <div class="flex-1 overflow-y-auto space-y-4 max-h-[460px] pr-2 custom-scrollbar">
                                \${data.data.html}
                            </div>

                            <div class="pt-4 mt-4 border-t border-sky-200/80 flex items-center justify-between text-[11px] text-sky-800 font-medium">
                                <span>T\u1ECDa \u0111\u1ED9 D\u1EEF li\u1EC7u SVG</span>
                                <span class="bg-sky-200/60 px-2 py-0.5 rounded uppercase tracking-tighter">B\u1EA3n \u0111\u1ED3 \u0111\u1ED9ng</span>
                            </div>
                        </div>
                    `:h()}catch{h()}finally{f=!1}};x.forEach(e=>{e.pathIds&&e.pathIds.forEach(t=>{let i=c.querySelector("#${pid}");i&&(i.classList.add("jankx-map-region-clickable"),i.addEventListener("click",n=>{n.preventDefault(),v(e.id)}))})}),s.querySelectorAll(".jankx-marker-btn").forEach(e=>{e.addEventListener("click",t=>{t.preventDefault();let i=e.getAttribute("data-region-id");i&&v(i)})})})});})();
