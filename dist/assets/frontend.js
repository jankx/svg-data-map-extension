(()=>{document.addEventListener("DOMContentLoaded",()=>{let I=document.querySelectorAll(".jankx-svg-data-map-runtime"),T=document.querySelectorAll(".jankx-svg-data-map-info-runtime"),k=new Map;T.forEach(o=>{let g=o.getAttribute("data-map-id")||"default-map",x=o.querySelector(".jankx-svg-map-info-content");x&&k.set(g,x)}),I.forEach(o=>{let g=o.getAttribute("data-config"),x=o.getAttribute("data-map-id")||"default-map";if(!g)return;let b;try{b=JSON.parse(g)}catch{return}let E=b.regions||[],p=o.querySelector(".jankx-svg-map-wrapper svg"),c=o.querySelector(".jankx-svg-map-info-panel")||k.get(x);if(!p||!c)return;let h=new Map;E.forEach(e=>h.set(e.id,e));let v=!1,m=null,A=()=>{c&&(c.innerHTML=`
                <div class="flex flex-col items-center justify-center h-full space-y-4 py-10">
                    <div class="w-10 h-10 border-4 border-white/30 border-t-[#1E4D65] rounded-full animate-spin"></div>
                    <p class="text-[#1E4D65] font-bold text-xs uppercase tracking-widest">\u0110ang t\xECm ki\u1EBFm...</p>
                </div>
            `)},j=()=>{c&&(c.innerHTML=`
                <div class="flex flex-col items-center justify-center h-full text-center text-[#1E4D65]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-10 h-10 mb-2 opacity-50"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <p class="font-bold text-sm">Kh\xF4ng th\u1EC3 t\u1EA3i th\xF4ng tin</p>
                </div>
            `)},S=async e=>{if(v||m===e)return;let t=h.get(e);if(!t)return;if(m){let a=h.get(m);a&&a.pathIds&&a.pathIds.forEach(y=>{let d=p.querySelector(`#${y}`);d&&d.classList.remove("jankx-map-active")});let n=o.querySelector(`.jankx-marker-btn[data-region-id="${m}"]`);n&&n.classList.remove("jankx-map-active")}m=e,t.pathIds&&t.pathIds.forEach(a=>{let n=p.querySelector(`#${a}`);n&&n.classList.add("jankx-map-active")});let s=o.querySelector(`.jankx-marker-btn[data-region-id="${e}"]`);s&&s.classList.add("jankx-map-active");let r=o.querySelector(".jankx-map-active-title")||(c.parentElement?c.parentElement.querySelector(".jankx-map-active-title"):null);r&&(r.textContent=t.name||t.label||"Khu v\u1EF1c");let i="";t.items&&t.items.length>0&&t.items.forEach(a=>{i+=`
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
                    `});let l=(a="")=>{c.innerHTML=`
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
                            ${i}
                            ${a}
                        </div>

                        <div class="pt-4 mt-4 border-t border-sky-200/80 flex items-center justify-between text-[11px] text-sky-800 font-medium">
                            <span>T\u1ECDa \u0111\u1ED9 D\u1EEF li\u1EC7u SVG</span>
                            <span class="bg-sky-200/60 px-2 py-0.5 rounded uppercase tracking-tighter">B\u1EA3n \u0111\u1ED3 \u0111\u1ED9ng</span>
                        </div>
                    </div>
                `};if(!t.termId){console.log("SVG Map: No termId, showing manual data only"),l();return}A(),v=!0;try{let a=window.jankxViewsData?.ajaxUrl||"/wp-admin/admin-ajax.php",n=new FormData;n.append("action","svg_data_map_fetch_posts"),n.append("term_id",t.termId),n.append("taxonomy",t.taxonomy||"category"),n.append("post_type",t.postType||"post");let d=await(await fetch(a,{method:"POST",body:n})).json();d.success?l(d.data.html):j()}catch(a){console.error("SVG Map: AJAX error:",a),j()}finally{v=!1}},u=(e,t)=>{let s=h.get(e);if(!s)return;s.pathIds&&s.pathIds.forEach(i=>{let l=p.querySelector(`#${i}`);l&&(t?l.classList.add("jankx-map-hover"):l.classList.remove("jankx-map-hover"))});let r=o.querySelector(`.jankx-marker-btn[data-region-id="${e}"]`);r&&(t?r.classList.add("jankx-map-marker-hover"):r.classList.remove("jankx-map-marker-hover"))};E.forEach(e=>{e.pathIds&&e.pathIds.forEach(t=>{let s=p.querySelector(`#${t}`);s&&(s.classList.add("jankx-map-region-clickable"),s.addEventListener("click",r=>{r.preventDefault(),S(e.id)}),s.addEventListener("mouseenter",()=>u(e.id,!0)),s.addEventListener("mouseleave",()=>u(e.id,!1)))})});let f=1,L=Array.from(o.querySelectorAll(".jankx-marker-btn")),D=()=>{L.forEach(e=>{e.style.transform=`translate(-50%, -50%) scale(${f})`,e.style.transformOrigin="center bottom"})};L.forEach(e=>{let t=e.getAttribute("data-region-id"),s=e.getAttribute("data-path-id"),r=()=>{if(s){let i=p,l=i.querySelector(`#${s}`),a=o.querySelector(".jankx-markers-layer");if(l&&a&&typeof l.getBBox=="function")try{let n=l.getBBox(),y=n.x+n.width/2,d=n.y+n.height/2,M=i.getScreenCTM();if(M){let w=i.createSVGPoint();w.x=y,w.y=d;let $=w.matrixTransform(M),q=a.getBoundingClientRect(),G=($.x-q.left)/f,V=($.y-q.top)/f;e.style.left=`${G}px`,e.style.top=`${V}px`,e.style.transform=`translate(-50%, -50%) scale(${f})`,e.style.transformOrigin="center bottom",e.style.display="flex",e.style.position="absolute"}}catch(n){console.error("SVG Map: Failed to calculate bbox for",s,n)}}};r(),window.addEventListener("resize",()=>{r()}),e.addEventListener("click",i=>{i.preventDefault(),i.stopPropagation(),t&&S(t)}),e.addEventListener("mouseenter",()=>{t&&u(t,!0)}),e.addEventListener("mouseleave",()=>{t&&u(t,!1)})}),(o.querySelector("#map-container-root")||o).addEventListener("wheel",e=>{e.preventDefault();let t=e.deltaY<0?.05:-.05;f=Math.max(.5,Math.min(5,f+t)),D()},{passive:!1})})});})();
