(()=>{document.addEventListener("DOMContentLoaded",()=>{let j=document.querySelectorAll(".jankx-svg-data-map-runtime"),E=document.querySelectorAll(".jankx-svg-data-map-info-runtime"),g=new Map;E.forEach(s=>{let p=s.getAttribute("data-map-id")||"default-map",f=s.querySelector(".jankx-svg-map-info-content");f&&g.set(p,f)}),j.forEach(s=>{let p=s.getAttribute("data-config"),f=s.getAttribute("data-map-id")||"default-map";if(!p)return;let v;try{v=JSON.parse(p)}catch{return}let h=v.regions||[],l=s.querySelector(".jankx-svg-map-wrapper svg"),i=s.querySelector(".jankx-svg-map-info-panel")||g.get(f);if(!l||!i)return;let m=new Map;h.forEach(t=>m.set(t.id,t));let x=!1,c=null,b=()=>{i&&(i.innerHTML=`
                <div class="flex flex-col items-center justify-center h-full space-y-4 py-10">
                    <div class="w-10 h-10 border-4 border-white/30 border-t-[#1E4D65] rounded-full animate-spin"></div>
                    <p class="text-[#1E4D65] font-bold text-xs uppercase tracking-widest">\u0110ang t\xECm ki\u1EBFm...</p>
                </div>
            `)},k=()=>{i&&(i.innerHTML=`
                <div class="flex flex-col items-center justify-center h-full text-center text-[#1E4D65]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-10 h-10 mb-2 opacity-50"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <p class="font-bold text-sm">Kh\xF4ng th\u1EC3 t\u1EA3i th\xF4ng tin</p>
                </div>
            `)},y=async t=>{if(x||c===t)return;let e=m.get(t);if(!e||!e.termId)return;if(c){let r=m.get(c);r&&r.pathIds&&r.pathIds.forEach(w=>{let d=l.querySelector(`#${w}`);d&&d.classList.remove("jankx-map-active")});let a=s.querySelector(`.jankx-marker-btn[data-region-id="${c}"]`);a&&a.classList.remove("jankx-map-active")}c=t,e.pathIds&&e.pathIds.forEach(r=>{let a=l.querySelector(`#${r}`);a&&a.classList.add("jankx-map-active")});let n=s.querySelector(`.jankx-marker-btn[data-region-id="${t}"]`);n&&n.classList.add("jankx-map-active");let o=s.querySelector(".jankx-map-active-title")||(i.parentElement?i.parentElement.querySelector(".jankx-map-active-title"):null);o&&(o.textContent=e.name||e.label||"Khu v\u1EF1c"),b(),x=!0;try{let r=window.jankxViewsData?.ajaxUrl||"/wp-admin/admin-ajax.php",a=new FormData;a.append("action","svg_data_map_fetch_posts"),a.append("term_id",e.termId),a.append("taxonomy",e.taxonomy||"category"),a.append("post_type",e.postType||"post");let d=await(await fetch(r,{method:"POST",body:a})).json();d.success?i.innerHTML=`
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
                                ${d.data.html}
                            </div>

                            <div class="pt-4 mt-4 border-t border-sky-200/80 flex items-center justify-between text-[11px] text-sky-800 font-medium">
                                <span>T\u1ECDa \u0111\u1ED9 D\u1EEF li\u1EC7u SVG</span>
                                <span class="bg-sky-200/60 px-2 py-0.5 rounded uppercase tracking-tighter">B\u1EA3n \u0111\u1ED3 \u0111\u1ED9ng</span>
                            </div>
                        </div>
                    `:k()}catch{k()}finally{x=!1}},u=(t,e)=>{let n=m.get(t);if(!n)return;n.pathIds&&n.pathIds.forEach(r=>{let a=l.querySelector(`#${r}`);a&&(e?a.classList.add("jankx-map-hover"):a.classList.remove("jankx-map-hover"))});let o=s.querySelector(`.jankx-marker-btn[data-region-id="${t}"]`);o&&(e?o.classList.add("jankx-map-marker-hover"):o.classList.remove("jankx-map-marker-hover"))};h.forEach(t=>{t.pathIds&&t.pathIds.forEach(e=>{let n=l.querySelector(`#${e}`);n&&(n.classList.add("jankx-map-region-clickable"),n.addEventListener("click",o=>{o.preventDefault(),y(t.id)}),n.addEventListener("mouseenter",()=>u(t.id,!0)),n.addEventListener("mouseleave",()=>u(t.id,!1)))})}),s.querySelectorAll(".jankx-marker-btn").forEach(t=>{let e=t.getAttribute("data-region-id");t.addEventListener("click",n=>{n.preventDefault(),e&&y(e)}),t.addEventListener("mouseenter",()=>{e&&u(e,!0)}),t.addEventListener("mouseleave",()=>{e&&u(e,!1)})})})});})();
