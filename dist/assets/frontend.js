(()=>{document.addEventListener("DOMContentLoaded",()=>{let w=document.querySelectorAll(".jankx-svg-data-map-runtime"),k=document.querySelectorAll(".jankx-svg-data-map-info-runtime"),u=new Map;k.forEach(s=>{let o=s.getAttribute("data-map-id")||"default-map",l=s.querySelector(".jankx-svg-map-info-content");l&&u.set(o,l)}),w.forEach(s=>{let o=s.getAttribute("data-config"),l=s.getAttribute("data-map-id")||"default-map";if(!o)return;let g;try{g=JSON.parse(o)}catch{return}let x=g.regions||[],c=s.querySelector(".jankx-svg-map-wrapper svg"),r=s.querySelector(".jankx-svg-map-info-panel")||u.get(l);if(!c||!r)return;let p=new Map;x.forEach(t=>p.set(t.id,t));let f=!1,d=null,b=()=>{r&&(r.innerHTML=`
                <div class="flex flex-col items-center justify-center h-full space-y-4 py-10">
                    <div class="w-10 h-10 border-4 border-white/30 border-t-[#1E4D65] rounded-full animate-spin"></div>
                    <p class="text-[#1E4D65] font-bold text-xs uppercase tracking-widest">\u0110ang t\xECm ki\u1EBFm...</p>
                </div>
            `)},h=()=>{r&&(r.innerHTML=`
                <div class="flex flex-col items-center justify-center h-full text-center text-[#1E4D65]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-10 h-10 mb-2 opacity-50"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <p class="font-bold text-sm">Kh\xF4ng th\u1EC3 t\u1EA3i th\xF4ng tin</p>
                </div>
            `)},v=async t=>{if(f||d===t)return;let e=p.get(t);if(!e||!e.termId)return;if(d){let n=p.get(d);n&&n.pathIds&&n.pathIds.forEach(a=>{let m=c.querySelector(`#${a}`);m&&m.classList.remove("jankx-map-active")})}d=t,e.pathIds&&e.pathIds.forEach(n=>{let a=c.querySelector(`#${n}`);a&&a.classList.add("jankx-map-active")});let i=s.querySelector(".jankx-map-active-title")||(r.parentElement?r.parentElement.querySelector(".jankx-map-active-title"):null);i&&(i.textContent=e.name||e.label||"Khu v\u1EF1c"),b(),f=!0;try{let n=window.jankxViewsData?.ajaxUrl||"/wp-admin/admin-ajax.php",a=new FormData;a.append("action","svg_data_map_fetch_posts"),a.append("term_id",e.termId),a.append("taxonomy",e.taxonomy||"category"),a.append("post_type",e.postType||"post");let y=await(await fetch(n,{method:"POST",body:a})).json();y.success?r.innerHTML=`
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
                                ${y.data.html}
                            </div>

                            <div class="pt-4 mt-4 border-t border-sky-200/80 flex items-center justify-between text-[11px] text-sky-800 font-medium">
                                <span>T\u1ECDa \u0111\u1ED9 D\u1EEF li\u1EC7u SVG</span>
                                <span class="bg-sky-200/60 px-2 py-0.5 rounded uppercase tracking-tighter">B\u1EA3n \u0111\u1ED3 \u0111\u1ED9ng</span>
                            </div>
                        </div>
                    `:h()}catch{h()}finally{f=!1}};x.forEach(t=>{t.pathIds&&t.pathIds.forEach(e=>{let i=c.querySelector(`#${e}`);i&&(i.classList.add("jankx-map-region-clickable"),i.addEventListener("click",n=>{n.preventDefault(),v(t.id)}))})}),s.querySelectorAll(".jankx-marker-btn").forEach(t=>{t.addEventListener("click",e=>{e.preventDefault();let i=t.getAttribute("data-region-id");i&&v(i)})})})});})();
