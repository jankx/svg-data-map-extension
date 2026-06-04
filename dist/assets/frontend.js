(()=>{document.addEventListener("DOMContentLoaded",()=>{let T=document.querySelectorAll(".jankx-svg-data-map-runtime"),A=document.querySelectorAll(".jankx-svg-data-map-info-runtime"),w=new Map;A.forEach(r=>{let x=r.getAttribute("data-map-id")||"default-map",h=r.querySelector(".jankx-svg-map-info-content");h&&w.set(x,h)}),T.forEach(r=>{let x=r.getAttribute("data-config"),h=r.getAttribute("data-map-id")||"default-map";if(!x)return;let b;try{b=JSON.parse(x)}catch{return}let E=b.regions||[],f=r.querySelector(".jankx-svg-map-wrapper svg"),c=r.querySelector(".jankx-svg-map-info-panel")||w.get(h);if(!f||!c)return;let m=new Map;E.forEach(e=>m.set(e.id,e));let v=!1,g=null,D=()=>{c&&(c.innerHTML=`
                <div class="flex flex-col items-center justify-center h-full space-y-4 py-10">
                    <div class="w-10 h-10 border-4 border-white/30 border-t-[#1E4D65] rounded-full animate-spin"></div>
                    <p class="text-[#1E4D65] font-bold text-xs uppercase tracking-widest">\u0110ang t\xECm ki\u1EBFm...</p>
                </div>
            `)},j=()=>{c&&(c.innerHTML=`
                <div class="flex flex-col items-center justify-center h-full text-center text-[#1E4D65]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-10 h-10 mb-2 opacity-50"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <p class="font-bold text-sm">Kh\xF4ng th\u1EC3 t\u1EA3i th\xF4ng tin</p>
                </div>
            `)},S=async e=>{if(v||g===e)return;let t=m.get(e);if(!t)return;if(g){let a=m.get(g);a&&a.pathIds&&a.pathIds.forEach(y=>{let p=f.querySelector(`#${y}`);p&&p.classList.remove("jankx-map-active")});let n=r.querySelector(`.jankx-marker-btn[data-region-id="${g}"]`);n&&n.classList.remove("jankx-map-active")}g=e,t.pathIds&&t.pathIds.forEach(a=>{let n=f.querySelector(`#${a}`);n&&n.classList.add("jankx-map-active")});let s=r.querySelector(`.jankx-marker-btn[data-region-id="${e}"]`);s&&s.classList.add("jankx-map-active");let o=r.querySelector(".jankx-map-active-title")||(c.parentElement?c.parentElement.querySelector(".jankx-map-active-title"):null);o&&(o.textContent=t.name||t.label||"Khu v\u1EF1c");let l="";t.items&&t.items.length>0&&t.items.forEach(a=>{l+=`
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
                    `});let i=(a="")=>{c.innerHTML=`
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
                            ${l}
                            ${a}
                        </div>

                        <div class="pt-4 mt-4 border-t border-sky-200/80 flex items-center justify-between text-[11px] text-sky-800 font-medium">
                            <span>T\u1ECDa \u0111\u1ED9 D\u1EEF li\u1EC7u SVG</span>
                            <span class="bg-sky-200/60 px-2 py-0.5 rounded uppercase tracking-tighter">B\u1EA3n \u0111\u1ED3 \u0111\u1ED9ng</span>
                        </div>
                    </div>
                `};if(!t.termId){console.log("SVG Map: No termId, showing manual data only"),i();return}D(),v=!0;try{let a=window.jankxViewsData?.ajaxUrl||"/wp-admin/admin-ajax.php",n=new FormData;n.append("action","svg_data_map_fetch_posts"),n.append("term_id",t.termId),n.append("taxonomy",t.taxonomy||"category"),n.append("post_type",t.postType||"post");let p=await(await fetch(a,{method:"POST",body:n})).json();p.success?i(p.data.html):j()}catch(a){console.error("SVG Map: AJAX error:",a),j()}finally{v=!1}},u=(e,t)=>{let s=m.get(e);if(!s)return;s.pathIds&&s.pathIds.forEach(l=>{let i=f.querySelector(`#${l}`);i&&(t?i.classList.add("jankx-map-hover"):i.classList.remove("jankx-map-hover"))});let o=r.querySelector(`.jankx-marker-btn[data-region-id="${e}"]`);o&&(t?o.classList.add("jankx-map-marker-hover"):o.classList.remove("jankx-map-marker-hover"))};E.forEach(e=>{e.pathIds&&e.pathIds.forEach(t=>{let s=f.querySelector(`#${t}`);s&&(s.classList.add("jankx-map-region-clickable"),s.addEventListener("click",o=>{o.preventDefault(),S(e.id)}),s.addEventListener("mouseenter",()=>u(e.id,!0)),s.addEventListener("mouseleave",()=>u(e.id,!1)))})});let d=1,L=Array.from(r.querySelectorAll(".jankx-marker-btn")),G=()=>{L.forEach(e=>{e.style.transform=`translate(-50%, -50%) scale(${d})`,e.style.transformOrigin="center bottom"})};L.forEach(e=>{let t=e.getAttribute("data-region-id"),s=e.getAttribute("data-path-id"),o=()=>{if(s){let l=f,i=l.querySelector(`#${s}`),a=r.querySelector(".jankx-markers-layer");if(i&&a&&typeof i.getBBox=="function")try{let n=i.getBBox(),y=n.x+n.width/2,p=n.y+n.height/2,M=i.getCTM();if(M){let k=l.createSVGPoint();k.x=y,k.y=p;let $=k.matrixTransform(M),q=a.getBoundingClientRect(),V=($.x-q.left)/d,H=($.y-q.top)/d,I=m.get(t),C=(I?.marker?.markerOffsetX??0)/d,O=(I?.marker?.markerOffsetY??0)/d;e.style.left=`${V+C}px`,e.style.top=`${H+O}px`,e.style.transform="translate(-50%, -50%)",e.style.transformOrigin="center bottom",e.style.display="flex",e.style.position="absolute"}}catch(n){console.error("SVG Map: Failed to calculate bbox for",s,n)}}};o(),window.addEventListener("resize",()=>{o()}),e.addEventListener("click",l=>{l.preventDefault(),l.stopPropagation(),t&&S(t)}),e.addEventListener("mouseenter",()=>{t&&u(t,!0)}),e.addEventListener("mouseleave",()=>{t&&u(t,!1)})}),(r.querySelector("#map-container-root")||r).addEventListener("wheel",e=>{e.preventDefault();let t=e.deltaY<0?.05:-.05;d=Math.max(.5,Math.min(5,d+t)),G()},{passive:!1})})});})();
