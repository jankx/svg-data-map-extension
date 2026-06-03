(()=>{document.addEventListener("DOMContentLoaded",()=>{let w=document.querySelectorAll(".jankx-svg-data-map-runtime"),j=document.querySelectorAll(".jankx-svg-data-map-info-runtime"),g=new Map;j.forEach(r=>{let c=r.getAttribute("data-map-id")||"default-map",d=r.querySelector(".jankx-svg-map-info-content");d&&g.set(c,d)}),w.forEach(r=>{let c=r.getAttribute("data-config"),d=r.getAttribute("data-map-id")||"default-map";if(!c)return;let h;try{h=JSON.parse(c)}catch{return}let x=h.regions||[],l=r.querySelector(".jankx-svg-map-wrapper svg"),i=r.querySelector(".jankx-svg-map-info-panel")||g.get(d);if(!l||!i)return;let p=new Map;x.forEach(t=>p.set(t.id,t));let u=!1,f=null,E=()=>{i&&(i.innerHTML=`
                <div class="flex flex-col items-center justify-center h-full space-y-4 py-10">
                    <div class="w-10 h-10 border-4 border-white/30 border-t-[#1E4D65] rounded-full animate-spin"></div>
                    <p class="text-[#1E4D65] font-bold text-xs uppercase tracking-widest">\u0110ang t\xECm ki\u1EBFm...</p>
                </div>
            `)},v=()=>{i&&(i.innerHTML=`
                <div class="flex flex-col items-center justify-center h-full text-center text-[#1E4D65]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-10 h-10 mb-2 opacity-50"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <p class="font-bold text-sm">Kh\xF4ng th\u1EC3 t\u1EA3i th\xF4ng tin</p>
                </div>
            `)},y=async t=>{if(u||f===t)return;let e=p.get(t);if(!e||!e.termId)return;if(f){let n=p.get(f);n&&n.pathIds&&n.pathIds.forEach(s=>{let o=l.querySelector(`#${s}`);o&&o.classList.remove("jankx-map-active")})}f=t,e.pathIds&&e.pathIds.forEach(n=>{let s=l.querySelector(`#${n}`);s&&s.classList.add("jankx-map-active")});let a=r.querySelector(".jankx-map-active-title")||(i.parentElement?i.parentElement.querySelector(".jankx-map-active-title"):null);a&&(a.textContent=e.name||e.label||"Khu v\u1EF1c"),E(),u=!0;try{let n=window.jankxViewsData?.ajaxUrl||"/wp-admin/admin-ajax.php",s=new FormData;s.append("action","svg_data_map_fetch_posts"),s.append("term_id",e.termId),s.append("taxonomy",e.taxonomy||"category"),s.append("post_type",e.postType||"post");let k=await(await fetch(n,{method:"POST",body:s})).json();k.success?i.innerHTML=`
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
                                ${k.data.html}
                            </div>

                            <div class="pt-4 mt-4 border-t border-sky-200/80 flex items-center justify-between text-[11px] text-sky-800 font-medium">
                                <span>T\u1ECDa \u0111\u1ED9 D\u1EEF li\u1EC7u SVG</span>
                                <span class="bg-sky-200/60 px-2 py-0.5 rounded uppercase tracking-tighter">B\u1EA3n \u0111\u1ED3 \u0111\u1ED9ng</span>
                            </div>
                        </div>
                    `:v()}catch{v()}finally{u=!1}},m=(t,e)=>{let a=p.get(t);if(!a)return;a.pathIds&&a.pathIds.forEach(s=>{let o=l.querySelector(`#${s}`);o&&(e?o.classList.add("jankx-map-hover"):o.classList.remove("jankx-map-hover"))});let n=r.querySelector(`.jankx-marker-btn[data-region-id="${t}"]`);n&&(e?n.classList.add("jankx-map-marker-hover"):n.classList.remove("jankx-map-marker-hover"))};x.forEach(t=>{t.pathIds&&t.pathIds.forEach(e=>{let a=l.querySelector(`#${e}`);a&&(a.classList.add("jankx-map-region-clickable"),a.addEventListener("click",n=>{n.preventDefault(),y(t.id)}),a.addEventListener("mouseenter",()=>m(t.id,!0)),a.addEventListener("mouseleave",()=>m(t.id,!1)))})}),r.querySelectorAll(".jankx-marker-btn").forEach(t=>{let e=t.getAttribute("data-region-id");t.addEventListener("click",a=>{a.preventDefault(),e&&y(e)}),t.addEventListener("mouseenter",()=>{e&&m(e,!0)}),t.addEventListener("mouseleave",()=>{e&&m(e,!1)})})})});})();
