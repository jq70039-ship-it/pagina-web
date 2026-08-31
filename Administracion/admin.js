/* =========================
   CONEXIÓN SUPABASE — NOIR
========================= */

const SUPABASE_URL = "https://kazdukaltcziaizqiobd.supabase.co";

const SUPABASE_KEY = "sb_publishable_quZbWPkFptypIV83vqISNg_I47uRnBc";

const SUPABASE_HEADERS = {
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json"
};


/* =========================
   DATOS PREDETERMINADOS
========================= */

const PREDETERMINADO = {
  works: [
    {id:"demo-1",title:"Botanical Silence",style:"FINE LINE",description:"Líneas suaves y composición orgánica.",image:""},
    {id:"demo-2",title:"Dark Anatomy",style:"BLACKWORK",description:"Contraste, sombra y presencia.",image:""},
    {id:"demo-3",title:"Sacred Form",style:"ORNAMENTAL",description:"Simetría y detalle ornamental.",image:""},
    {id:"demo-4",title:"Movement",style:"BODY FLOW",description:"Diseño que acompaña el cuerpo.",image:""}
  ],
  styles: {
    "FINE LINE": {name:"Fine Line",description:"Líneas delicadas, composiciones ligeras y detalles que respetan la anatomía."},
    "BLACKWORK": {name:"Blackwork",description:"Contraste profundo, tinta sólida y composiciones de gran presencia visual."},
    "ORNAMENTAL": {name:"Ornamental",description:"Simetría, estructuras decorativas y precisión en cada detalle."},
    "BODY FLOW": {name:"Body Flow",description:"Diseños contemporáneos pensados para seguir el movimiento natural del cuerpo."}
  },
  studio:{studioName:"NOIR Tattoo Studio",city:"",instagram:"",contact:"",studioDescription:""}
};
let data = JSON.parse(localStorage.getItem("noir_admin_data") || "null") || structuredClone(DEFAULT);
let studioId = null;
let currentFilter="ALL", pendingImage="", editingWorkId=null;

const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const save = async () => {

    // Mantener también una copia local
    localStorage.setItem("noir_admin_data", JSON.stringify(data));

    const studioData = {
        name: data.studio.studioName,
        city: data.studio.city,
        instagram: data.studio.instagram,
        contact: data.studio.contact,
        description: data.studio.studioDescription
    };

    try {

        let response;

        // Si ya existe un registro, actualizarlo
        if (studioId) {

            response = await fetch(
                `${SUPABASE_URL}/rest/v1/studio_content?id=eq.${studioId}`,
                {
                    method: "PATCH",
                    headers: {
                        ...SUPABASE_HEADERS,
                        "Prefer": "return=representation"
                    },
                    body: JSON.stringify(studioData)
                }
            );

        } else {

            // Si todavía no existe, crear uno
            response = await fetch(
                `${SUPABASE_URL}/rest/v1/studio_content`,
                {
                    method: "POST",
                    headers: {
                        ...SUPABASE_HEADERS,
                        "Prefer": "return=representation"
                    },
                    body: JSON.stringify(studioData)
                }
            );

            const result = await response.json();

            if (result && result[0]) {
                studioId = result[0].id;
            }
        }

        if (!response.ok) {
            throw new Error("Error al guardar en Supabase");
        }

        console.log("Información guardada en Supabase");

    } catch (error) {

        console.error("Error:", error);
    }
};
const toast=msg=>{const t=$("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200)}
const esc=s=>String(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));

function renderAll(){renderDashboard();renderGallery();renderStyles();renderStudio()}
function renderDashboard(){
 const counts={};["FINE LINE","BLACKWORK","ORNAMENTAL","BODY FLOW"].forEach(s=>counts[s]=data.works.filter(w=>w.style===s).length);
 $("#statImages").textContent=data.works.length;
 $("#fineCount").textContent=counts["FINE LINE"]||0;$("#blackCount").textContent=counts["BLACKWORK"]||0;$("#ornamentalCount").textContent=counts["ORNAMENTAL"]||0;$("#bodyCount").textContent=counts["BODY FLOW"]||0;
 $("#recentWorks").innerHTML=data.works.slice(-5).reverse().map(w=>`<div class="recent-work">${w.image?`<img src="${w.image}">`:`<div style="width:58px;height:58px;background:#25211e"></div>`}<div><strong>${esc(w.title)}</strong><small>${esc(w.style)}</small></div><span style="color:#777;font-size:10px">Editar</span></div>`).join("")||"<small>No hay obras todavía.</small>";
}
function renderGallery(){
 const works=data.works.filter(w=>currentFilter==="ALL"||w.style===currentFilter);
 $("#galleryAdminGrid").innerHTML=works.map(w=>`<article class="work-card"><div class="work-image">${w.image?`<img src="${w.image}" alt="${esc(w.title)}">`:`<div class="no-image">Sin imagen</div>`}</div><div class="work-body"><small>${esc(w.style)}</small><h3>${esc(w.title)}</h3><p>${esc(w.description)}</p><div class="work-actions"><button onclick="editWork('${w.id}')">Editar</button><button class="delete" onclick="deleteWork('${w.id}')">Eliminar</button></div></div></article>`).join("")||'<div class="empty-state" style="grid-column:1/-1"><span>+</span><h3>Sin obras aquí</h3><p>Agrega una nueva fotografía para comenzar tu galería.</p></div>';
}
function renderStyles(){
 const keys=Object.keys(data.styles);
 $("#stylesAdminList").innerHTML=keys.map((k,i)=>{const s=data.styles[k];return `<article class="style-row"><div class="style-index">0${i+1}</div><div><h3>${esc(s.name)}</h3><p>${esc(s.description)}</p></div><button onclick="editStyle('${k}')">Editar estilo</button></article>`}).join("");
}
function renderStudio(){const f=$("#studioForm");Object.entries(data.studio).forEach(([k,v])=>{if(f.elements[k])f.elements[k].value=v||""})}

function showView(id){
 $$(".view").forEach(v=>v.classList.toggle("active",v.id===id));$$(".nav-link").forEach(b=>b.classList.toggle("active",b.dataset.view===id));
 const names={dashboard:["CONTROL ROOM","Bienvenido a NOIR."],gallery:["PORTFOLIO MANAGEMENT","Galería."],styles:["IDENTITY SYSTEM","Estilos."],artists:["NOIR COLLECTIVE","Artistas."],studio:["STUDIO SETTINGS","Studio."]};
 $("#sectionEyebrow").textContent=names[id][0];$("#pageTitle").textContent=names[id][1];
}
$$(".nav-link").forEach(b=>b.onclick=()=>showView(b.dataset.view));$$("[data-go]").forEach(b=>b.onclick=()=>showView(b.dataset.go));
$("#enterAdmin").onclick=()=>{const n=$("#adminName").value.trim()||"Administrador";localStorage.setItem("noir_admin_name",n);$("#adminDisplay").textContent=n;$("#adminInitial").textContent=n[0].toUpperCase();$("#loginScreen").classList.add("hidden");$("#app").classList.remove("hidden")}
const savedName=localStorage.getItem("noir_admin_name");if(savedName){$("#adminName").value=savedName}

$("#openAddWork").onclick=()=>openWork();
$$("[data-close]").forEach(b=>b.onclick=()=>$("#"+b.dataset.close).classList.add("hidden"));
$("#workModal").onclick=e=>{if(e.target.id==="workModal")$("#workModal").classList.add("hidden")}
$("#styleModal").onclick=e=>{if(e.target.id==="styleModal")$("#styleModal").classList.add("hidden")}

function openWork(work=null){
 editingWorkId=work?.id||null;pendingImage=work?.image||"";
 $("#modalTitle").textContent=work?"Editar obra":"Agregar obra";
 const f=$("#workForm");f.reset();f.elements.id.value=work?.id||"";
 f.elements.title.value=work?.title||"";f.elements.style.value=work?.style||"FINE LINE";f.elements.description.value=work?.description||"";
 renderPreview();$("#workModal").classList.remove("hidden");
}
$("#workImage").onchange=e=>{const file=e.target.files[0];if(!file)return;if(file.size>4*1024*1024){toast("La imagen debe ser menor de 4 MB.");return}const r=new FileReader();r.onload=()=>{pendingImage=r.result;renderPreview()};r.readAsDataURL(file)}
function renderPreview(){const p=$("#uploadPreview");p.innerHTML=pendingImage?`<img src="${pendingImage}" alt="Vista previa">`:`<span>+</span><strong>Seleccionar fotografía</strong><small>JPG, PNG o WEBP · máximo 4 MB</small>`}
$("#workForm").onsubmit=e=>{e.preventDefault();const f=e.currentTarget;const item={id:editingWorkId||("work-"+Date.now()),title:f.elements.title.value.trim(),style:f.elements.style.value,description:f.elements.description.value.trim(),image:pendingImage};if(editingWorkId){data.works=data.works.map(w=>w.id===editingWorkId?item:w)}else data.works.push(item);save();renderAll();$("#workModal").classList.add("hidden");toast(editingWorkId?"Obra actualizada.":"Nueva obra agregada.")}

window.editWork=id=>openWork(data.works.find(w=>w.id===id));
window.deleteWork=id=>{if(confirm("¿Eliminar esta obra?")){data.works=data.works.filter(w=>w.id!==id);save();renderAll();toast("Obra eliminada.")}}
$$(".filter").forEach(b=>b.onclick=()=>{currentFilter=b.dataset.filter;$$(".filter").forEach(x=>x.classList.toggle("active",x===b));renderGallery()})

window.editStyle=key=>{const s=data.styles[key],f=$("#styleForm");f.elements.styleKey.value=key;f.elements.name.value=s.name;f.elements.description.value=s.description;$("#styleModal").classList.remove("hidden")}
$("#styleForm").onsubmit=e=>{e.preventDefault();const f=e.currentTarget,key=f.elements.styleKey.value;data.styles[key]={name:f.elements.name.value.trim(),description:f.elements.description.value.trim()};save();renderAll();$("#styleModal").classList.add("hidden");toast("Estilo actualizado.")}
$("#studioForm").onsubmit=e=>{e.preventDefault();const fd=new FormData(e.currentTarget);data.studio=Object.fromEntries(fd.entries());save();toast("Información guardada. Actualiza NOIR para verla.")}
$("#exportData").onclick=()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="NOIR_contenido.json";a.click();URL.revokeObjectURL(a.href)}
$("#importData").onchange=e=>{const file=e.target.files[0];if(!file)return;const r=new FileReader();r.onload=()=>{try{const imported=JSON.parse(r.result);if(!imported.works||!imported.styles)throw 0;data=imported;save();renderAll();toast("Contenido importado correctamente.")}catch{toast("El archivo no es válido.")}};r.readAsText(file)}
$("#resetData").onclick=()=>{if(confirm("Esto restaurará la demostración y eliminará los cambios guardados en este navegador.")){data=structuredClone(DEFAULT);save();renderAll();toast("Demostración restablecida.")}}
$("#artistDemo").onclick=()=>toast("La gestión de artistas será el siguiente módulo.");
renderAll();
