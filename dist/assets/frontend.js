(()=>{document.addEventListener("DOMContentLoaded",()=>{let E=document.querySelectorAll(".jankx-svg-data-map-runtime"),k=document.querySelectorAll(".jankx-svg-data-map-info-runtime");console.log("SVG Map: Found info elements:",k.length);let y=new Map;k.forEach(i=>{let m=i.getAttribute("data-map-id")||"default-map",f=i.querySelector(".jankx-svg-map-info-content");console.log("SVG Map: Registered info panel for mapId:",m,!!f),f&&y.set(m,f)}),E.forEach(i=>{let m=i.getAttribute("data-config"),f=i.getAttribute("data-map-id")||"default-map";if(console.log("SVG Map: Initializing map:",f),!m)return;let w;try{w=JSON.parse(m)}catch{return}let b=w.regions||[],d=i.querySelector(".jankx-svg-map-wrapper svg"),c=i.querySelector(".jankx-svg-map-info-panel")||y.get(f);if(!d||!c)return;let x=new Map;b.forEach(t=>x.set(t.id,t));let v=!1,g=null,L=()=>{c&&(c.innerHTML=`
                <div class="flex flex-col items-center justify-center h-full space-y-4 py-10">
                    <div class="w-10 h-10 border-4 border-white/30 border-t-[#1E4D65] rounded-full animate-spin"></div>
                    <p class="text-[#1E4D65] font-bold text-xs uppercase tracking-widest">\u0110ang t\xECm ki\u1EBFm...</p>
                </div>
            `)},j=()=>{c&&(c.innerHTML=`
                <div class="flex flex-col items-center justify-center h-full text-center text-[#1E4D65]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-10 h-10 mb-2 opacity-50"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <p class="font-bold text-sm">Kh\xF4ng th\u1EC3 t\u1EA3i th\xF4ng tin</p>
                </div>
            `)},S=async t=>{if(console.log("SVG Map: Selecting region:",t),v||g===t)return;let e=x.get(t);if(console.log("SVG Map: Region data:",e),!e){console.warn("SVG Map: Region not found:",t);return}if(g){let a=x.get(g);a&&a.pathIds&&a.pathIds.forEach(h=>{let p=d.querySelector(`#${h}`);p&&p.classList.remove("jankx-map-active")});let o=i.querySelector(`.jankx-marker-btn[data-region-id="${g}"]`);o&&o.classList.remove("jankx-map-active")}g=t,e.pathIds&&e.pathIds.forEach(a=>{let o=d.querySelector(`#${a}`);o&&o.classList.add("jankx-map-active")});let n=i.querySelector(`.jankx-marker-btn[data-region-id="${t}"]`);n&&n.classList.add("jankx-map-active");let r=i.querySelector(".jankx-map-active-title")||(c.parentElement?c.parentElement.querySelector(".jankx-map-active-title"):null);r&&(r.textContent=e.name||e.label||"Khu v\u1EF1c");let l="";e.items&&e.items.length>0&&e.items.forEach(a=>{l+=`
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
                `};if(!e.termId){console.log("SVG Map: No termId, showing manual data only"),s();return}L(),v=!0;try{let a=window.jankxViewsData?.ajaxUrl||"/wp-admin/admin-ajax.php",o=new FormData;o.append("action","svg_data_map_fetch_posts"),o.append("term_id",e.termId),o.append("taxonomy",e.taxonomy||"category"),o.append("post_type",e.postType||"post");let p=await(await fetch(a,{method:"POST",body:o})).json();p.success?s(p.data.html):j()}catch(a){console.error("SVG Map: AJAX error:",a),j()}finally{v=!1}},u=(t,e)=>{let n=x.get(t);if(!n)return;n.pathIds&&n.pathIds.forEach(l=>{let s=d.querySelector(`#${l}`);s&&(e?s.classList.add("jankx-map-hover"):s.classList.remove("jankx-map-hover"))});let r=i.querySelector(`.jankx-marker-btn[data-region-id="${t}"]`);r&&(e?r.classList.add("jankx-map-marker-hover"):r.classList.remove("jankx-map-marker-hover"))};b.forEach(t=>{t.pathIds&&t.pathIds.forEach(e=>{let n=d.querySelector(`#${e}`);n&&(n.classList.add("jankx-map-region-clickable"),n.addEventListener("click",r=>{r.preventDefault(),S(t.id)}),n.addEventListener("mouseenter",()=>u(t.id,!0)),n.addEventListener("mouseleave",()=>u(t.id,!1)))})}),i.querySelectorAll(".jankx-marker-btn").forEach(t=>{let e=t,n=e.getAttribute("data-region-id"),r=e.getAttribute("data-path-id");if(r){let l=d.querySelector(`#${r}`);if(l&&typeof l.getBBox=="function")try{let s=l.getBBox(),a=s.x+s.width/2,o=s.y+s.height/2,h=d.getAttribute("viewBox")?.split(" ").map(Number)||[0,0,1e3,1e3],p=h[2],M=h[3],$=a/p*100,q=o/M*100;e.style.left=`${$}%`,e.style.top=`${q}%`,e.style.display="flex",e.style.position="absolute"}catch(s){console.error("SVG Map: Failed to calculate bbox for",r,s)}}e.addEventListener("click",l=>{l.preventDefault(),l.stopPropagation(),console.log("SVG Map: Marker clicked for region:",n),n&&S(n)}),e.addEventListener("mouseenter",()=>{n&&u(n,!0)}),e.addEventListener("mouseleave",()=>{n&&u(n,!1)})})})});})();
