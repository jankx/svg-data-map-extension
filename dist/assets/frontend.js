(()=>{document.addEventListener("DOMContentLoaded",()=>{let E=document.querySelectorAll(".jankx-svg-data-map-runtime"),x=document.querySelectorAll(".jankx-svg-data-map-info-runtime");console.log("SVG Map: Found info elements:",x.length);let h=new Map;x.forEach(s=>{let c=s.getAttribute("data-map-id")||"default-map",l=s.querySelector(".jankx-svg-map-info-content");console.log("SVG Map: Registered info panel for mapId:",c,!!l),l&&h.set(c,l)}),E.forEach(s=>{let c=s.getAttribute("data-config"),l=s.getAttribute("data-map-id")||"default-map";if(console.log("SVG Map: Initializing map:",l),!c)return;let v;try{v=JSON.parse(c)}catch{return}let k=v.regions||[],d=s.querySelector(".jankx-svg-map-wrapper svg"),i=s.querySelector(".jankx-svg-map-info-panel")||h.get(l);if(!d||!i)return;let f=new Map;k.forEach(e=>f.set(e.id,e));let u=!1,p=null,S=()=>{i&&(i.innerHTML=`
                <div class="flex flex-col items-center justify-center h-full space-y-4 py-10">
                    <div class="w-10 h-10 border-4 border-white/30 border-t-[#1E4D65] rounded-full animate-spin"></div>
                    <p class="text-[#1E4D65] font-bold text-xs uppercase tracking-widest">\u0110ang t\xECm ki\u1EBFm...</p>
                </div>
            `)},y=()=>{i&&(i.innerHTML=`
                <div class="flex flex-col items-center justify-center h-full text-center text-[#1E4D65]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-10 h-10 mb-2 opacity-50"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <p class="font-bold text-sm">Kh\xF4ng th\u1EC3 t\u1EA3i th\xF4ng tin</p>
                </div>
            `)},w=async e=>{if(console.log("SVG Map: Selecting region:",e),u||p===e)return;let t=f.get(e);if(console.log("SVG Map: Region data:",t),!t||!t.termId){console.warn("SVG Map: Region or termId missing for region:",e);return}if(p){let r=f.get(p);r&&r.pathIds&&r.pathIds.forEach(j=>{let m=d.querySelector(`#${j}`);m&&m.classList.remove("jankx-map-active")});let a=s.querySelector(`.jankx-marker-btn[data-region-id="${p}"]`);a&&a.classList.remove("jankx-map-active")}p=e,t.pathIds&&t.pathIds.forEach(r=>{let a=d.querySelector(`#${r}`);a&&a.classList.add("jankx-map-active")});let n=s.querySelector(`.jankx-marker-btn[data-region-id="${e}"]`);n&&n.classList.add("jankx-map-active");let o=s.querySelector(".jankx-map-active-title")||(i.parentElement?i.parentElement.querySelector(".jankx-map-active-title"):null);o&&(o.textContent=t.name||t.label||"Khu v\u1EF1c"),S(),u=!0;try{let r=window.jankxViewsData?.ajaxUrl||"/wp-admin/admin-ajax.php",a=new FormData;a.append("action","svg_data_map_fetch_posts"),a.append("term_id",t.termId),a.append("taxonomy",t.taxonomy||"category"),a.append("post_type",t.postType||"post");let m=await(await fetch(r,{method:"POST",body:a})).json();m.success?i.innerHTML=`
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
                                ${m.data.html}
                            </div>

                            <div class="pt-4 mt-4 border-t border-sky-200/80 flex items-center justify-between text-[11px] text-sky-800 font-medium">
                                <span>T\u1ECDa \u0111\u1ED9 D\u1EEF li\u1EC7u SVG</span>
                                <span class="bg-sky-200/60 px-2 py-0.5 rounded uppercase tracking-tighter">B\u1EA3n \u0111\u1ED3 \u0111\u1ED9ng</span>
                            </div>
                        </div>
                    `:y()}catch{y()}finally{u=!1}},g=(e,t)=>{let n=f.get(e);if(!n)return;n.pathIds&&n.pathIds.forEach(r=>{let a=d.querySelector(`#${r}`);a&&(t?a.classList.add("jankx-map-hover"):a.classList.remove("jankx-map-hover"))});let o=s.querySelector(`.jankx-marker-btn[data-region-id="${e}"]`);o&&(t?o.classList.add("jankx-map-marker-hover"):o.classList.remove("jankx-map-marker-hover"))};k.forEach(e=>{e.pathIds&&e.pathIds.forEach(t=>{let n=d.querySelector(`#${t}`);n&&(n.classList.add("jankx-map-region-clickable"),n.addEventListener("click",o=>{o.preventDefault(),w(e.id)}),n.addEventListener("mouseenter",()=>g(e.id,!0)),n.addEventListener("mouseleave",()=>g(e.id,!1)))})}),s.querySelectorAll(".jankx-marker-btn").forEach(e=>{let t=e.getAttribute("data-region-id");e.addEventListener("click",n=>{n.preventDefault(),t&&w(t)}),e.addEventListener("mouseenter",()=>{t&&g(t,!0)}),e.addEventListener("mouseleave",()=>{t&&g(t,!1)})})})});})();
