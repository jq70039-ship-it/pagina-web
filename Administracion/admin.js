/* =========================================================
   CONEXIÓN SUPABASE - NOIR
========================================================= */

const SUPABASE_URL = "https://kazdukaltcziaizqiobd.supabase.co";

/* CONSERVA AQUÍ TU CLAVE PÚBLICA DE SUPABASE */
const SUPABASE_KEY = "PEGA_AQUI_TU_SUPABASE_PUBLISHABLE_KEY";


const SUPABASE_HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json"
};


/* =========================================================
   DATOS LOCALES INICIALES
========================================================= */

let data = JSON.parse(
    localStorage.getItem("noir_admin_data") || "null"
) || structuredClone(DEFAULT);


/* ID DEL REGISTRO DEL ESTUDIO EN SUPABASE */

let studioId = null;


/* VARIABLES GENERALES */

let currentFilter = "ALL";
let pendingImage = "";
let editingWorkId = null;


/* =========================================================
   UTILIDADES
========================================================= */

const $ = s => document.querySelector(s);

const $$ = s => document.querySelectorAll(s);


const toast = msg => {
    const t = $("#toast");

    if (!t) return;

    t.textContent = msg;

    t.classList.add("show");

    setTimeout(() => {
        t.classList.remove("show");
    }, 2200);
};


const esc = s =>
    String(s || "").replace(
        /[&<>"']/g,
        m => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        }[m])
    );


/* =========================================================
   GUARDAR COPIA LOCAL
========================================================= */

function saveLocal() {

    localStorage.setItem(
        "noir_admin_data",
        JSON.stringify(data)
    );

}


/* =========================================================
   CARGAR DATOS DEL ESTUDIO DESDE SUPABASE
========================================================= */

async function loadStudioFromSupabase() {

    try {

        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/studio_content?select=*&order=created_at.desc&limit=1`,
            {
                method: "GET",
                headers: SUPABASE_HEADERS
            }
        );


        if (!response.ok) {

            const errorText = await response.text();

            console.error(
                "ERROR AL CARGAR SUPABASE:",
                errorText
            );

            return false;

        }


        const result = await response.json();


        if (result && result.length > 0) {

            const studio = result[0];


            /* GUARDAMOS EL ID PARA ACTUALIZAR
               SIEMPRE EL MISMO REGISTRO */

            studioId = studio.id;


            /* CONVERTIMOS COLUMNAS DE SUPABASE
               A LOS NOMBRES QUE USA TU PÁGINA */

            data.studio = {

                studioName: studio.name || "",

                city: studio.city || "",

                instagram: studio.Instagram || "",

                contact: studio.contact || "",

                studioDescription: studio.description || ""

            };


            saveLocal();


            console.log(
                "Datos cargados correctamente desde Supabase"
            );

            return true;

        }


        console.log(
            "No existe todavía un registro en Supabase"
        );

        return false;


    } catch (error) {

        console.error(
            "ERROR COMPLETO AL CARGAR SUPABASE:",
            error
        );

        return false;

    }

}


/* =========================================================
   GUARDAR DATOS DEL ESTUDIO EN SUPABASE
========================================================= */

async function saveStudioToSupabase() {

    try {


        /* CONVERTIMOS LOS DATOS DE LA PÁGINA
           A LOS NOMBRES EXACTOS DE LAS COLUMNAS
           DE TU TABLA SUPABASE */

        const studioData = {

            name: data.studio.studioName || "",

            city: data.studio.city || "",

            Instagram: data.studio.instagram || "",

            description:
                data.studio.studioDescription || "",

            contact:
                data.studio.contact || ""

        };


        let response;


        /* =====================================================
           SI YA EXISTE EL REGISTRO -> ACTUALIZAR
        ===================================================== */

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

        }


        /* =====================================================
           SI NO EXISTE -> CREAR REGISTRO NUEVO
        ===================================================== */

        else {

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

        }


        /* =====================================================
           VERIFICAR ERROR
        ===================================================== */

        if (!response.ok) {

            const errorText = await response.text();

            console.error(
                "ERROR DE SUPABASE:",
                errorText
            );

            throw new Error(
                "Error al guardar en Supabase"
            );

        }


        const result = await response.json();


        /* SI SUPABASE DEVUELVE EL REGISTRO
           GUARDAMOS SU ID */

        if (result && result.length > 0) {

            studioId = result[0].id;

        }


        console.log(
            "Información guardada correctamente en Supabase"
        );


        return true;


    } catch (error) {

        console.error(
            "ERROR COMPLETO DE SUPABASE:",
            error
        );

        return false;

    }

}


/* =========================================================
   FUNCIÓN GENERAL DE GUARDADO
========================================================= */

async function save() {

    /* GUARDAR PRIMERO EN EL NAVEGADOR */

    saveLocal();


    /* GUARDAR LOS DATOS DEL ESTUDIO EN SUPABASE */

    const saved = await saveStudioToSupabase();


    if (!saved) {

        toast(
            "No se pudo guardar en Supabase."
        );

        return false;

    }


    return true;

}


/* =========================================================
   RENDERIZAR TODO
========================================================= */

function renderAll() {

    renderDashboard();

    renderGallery();

    renderStyles();

    renderStudio();

}


/* =========================================================
   DASHBOARD
========================================================= */

function renderDashboard() {

    const counts = {};


    [
        "FINE LINE",
        "BLACKWORK",
        "ORNAMENTAL",
        "BODY FLOW"
    ].forEach(s => {

        counts[s] =
            data.works.filter(
                w => w.style === s
            ).length;

    });


    $("#statImages").textContent =
        data.works.length;


    $("#fineCount").textContent =
        counts["FINE LINE"] || 0;


    $("#blackCount").textContent =
        counts["BLACKWORK"] || 0;


    $("#ornamentalCount").textContent =
        counts["ORNAMENTAL"] || 0;


    $("#bodyCount").textContent =
        counts["BODY FLOW"] || 0;


    $("#recentWorks").innerHTML =
        data.works
            .slice(-5)
            .reverse()
            .map(w => `

                <div class="recent-work">

                    ${
                        w.image

                            ? `<img src="${w.image}">`

                            : `
                                <div
                                    style="
                                        width:58px;
                                        height:58px;
                                        background:#25211e
                                    "
                                ></div>
                              `
                    }

                    <div>

                        <strong>
                            ${esc(w.title)}
                        </strong>

                        <small>
                            ${esc(w.style)}
                        </small>

                    </div>

                    <span
                        style="
                            color:#777;
                            font-size:10px
                        "
                    >
                        Editar
                    </span>

                </div>

            `)
            .join("")

        ||

        "<small>No hay obras todavía.</small>";

}


/* =========================================================
   GALERÍA
========================================================= */

function renderGallery() {

    const works =
        data.works.filter(
            w =>
                currentFilter === "ALL" ||
                w.style === currentFilter
        );


    $("#galleryAdminGrid").innerHTML =
        works.map(w => `

            <article class="work-card">

                <div class="work-image">

                    ${
                        w.image

                            ? `
                                <img
                                    src="${w.image}"
                                    alt="${esc(w.title)}"
                                >
                              `

                            : `
                                <div class="no-image">
                                    Sin imagen
                                </div>
                              `
                    }

                </div>


                <div class="work-body">

                    <small>
                        ${esc(w.style)}
                    </small>


                    <h3>
                        ${esc(w.title)}
                    </h3>


                    <p>
                        ${esc(w.description)}
                    </p>


                    <div class="work-actions">

                        <button
                            onclick="editWork('${w.id}')"
                        >
                            Editar
                        </button>


                        <button
                            class="delete"
                            onclick="deleteWork('${w.id}')"
                        >
                            Eliminar
                        </button>

                    </div>

                </div>

            </article>

        `)
        .join("")

        ||

        `
            <div
                class="empty-state"
                style="grid-column:1/-1"
            >

                <span>+</span>

                <h3>
                    Sin obras aquí
                </h3>

                <p>
                    Agrega una nueva fotografía
                    para comenzar tu galería.
                </p>

            </div>
        `;

}


/* =========================================================
   ESTILOS
========================================================= */

function renderStyles() {

    const keys =
        Object.keys(data.styles);


    $("#stylesAdminList").innerHTML =
        keys.map((k, i) => {

            const s =
                data.styles[k];


            return `

                <article class="style-row">

                    <div class="style-index">

                        0${i + 1}

                    </div>


                    <div>

                        <h3>
                            ${esc(s.name)}
                        </h3>

                        <p>
                            ${esc(s.description)}
                        </p>

                    </div>


                    <button
                        onclick="editStyle('${k}')"
                    >
                        Editar estilo
                    </button>

                </article>

            `;

        })
        .join("");

}


/* =========================================================
   INFORMACIÓN DEL ESTUDIO
========================================================= */

function renderStudio() {

    const f =
        $("#studioForm");


    if (!f) return;


    Object.entries(
        data.studio
    ).forEach(([k, v]) => {

        if (f.elements[k]) {

            f.elements[k].value =
                v || "";

        }

    });

}


/* =========================================================
   CAMBIAR VISTA
========================================================= */

function showView(id) {

    $$(".view").forEach(v =>
        v.classList.toggle(
            "active",
            v.id === id
        )
    );


    $$(".nav-link").forEach(b =>
        b.classList.toggle(
            "active",
            b.dataset.view === id
        )
    );


    const names = {

        dashboard: [
            "CONTROL ROOM",
            "Bienvenido a NOIR."
        ],

        gallery: [
            "PORTFOLIO MANAGEMENT",
            "Galería."
        ],

        styles: [
            "IDENTITY SYSTEM",
            "Estilos."
        ],

        artists: [
            "NOIR COLLECTIVE",
            "Artistas."
        ],

        studio: [
            "STUDIO SETTINGS",
            "Studio."
        ]

    };


    $("#sectionEyebrow").textContent =
        names[id][0];


    $("#pageTitle").textContent =
        names[id][1];

}


/* =========================================================
   NAVEGACIÓN
========================================================= */

$$(".nav-link").forEach(b =>

    b.onclick = () =>
        showView(
            b.dataset.view
        )

);


$$("[data-go]").forEach(b =>

    b.onclick = () =>
        showView(
            b.dataset.go
        )

);


/* =========================================================
   LOGIN ADMIN
========================================================= */

$("#enterAdmin").onclick = () => {

    const n =
        $("#adminName")
            .value
            .trim()

        ||

        "Administrador";


    localStorage.setItem(
        "noir_admin_name",
        n
    );


    $("#adminDisplay").textContent =
        n;


    $("#adminInitial").textContent =
        n[0].toUpperCase();


    $("#loginScreen")
        .classList
        .add("hidden");


    $("#app")
        .classList
        .remove("hidden");

};


const savedName =
    localStorage.getItem(
        "noir_admin_name"
    );


if (savedName) {

    $("#adminName").value =
        savedName;

}


/* =========================================================
   GALERÍA - ABRIR MODAL
========================================================= */

$("#openAddWork").onclick =
    () => openWork();


$$("[data-close]").forEach(b =>

    b.onclick = () =>
        $("#" + b.dataset.close)
            .classList
            .add("hidden")

);


$("#workModal").onclick = e => {

    if (
        e.target.id === "workModal"
    ) {

        $("#workModal")
            .classList
            .add("hidden");

    }

};


$("#styleModal").onclick = e => {

    if (
        e.target.id === "styleModal"
    ) {

        $("#styleModal")
            .classList
            .add("hidden");

    }

};


/* =========================================================
   AGREGAR / EDITAR OBRA
========================================================= */

function openWork(work = null) {

    editingWorkId =
        work?.id || null;


    pendingImage =
        work?.image || "";


    $("#modalTitle").textContent =
        work

            ? "Editar obra"

            : "Agregar obra";


    const f =
        $("#workForm");


    f.reset();


    f.elements.id.value =
        work?.id || "";


    f.elements.title.value =
        work?.title || "";


    f.elements.style.value =
        work?.style ||
        "FINE LINE";


    f.elements.description.value =
        work?.description || "";


    renderPreview();


    $("#workModal")
        .classList
        .remove("hidden");

}


/* =========================================================
   IMAGEN
========================================================= */

$("#workImage").onchange = e => {

    const file =
        e.target.files[0];


    if (!file) return;


    if (
        file.size >
        4 * 1024 * 1024
    ) {

        toast(
            "La imagen debe ser menor de 4 MB."
        );

        return;

    }


    const r =
        new FileReader();


    r.onload = () => {

        pendingImage =
            r.result;

        renderPreview();

    };


    r.readAsDataURL(
        file
    );

};


function renderPreview() {

    const p =
        $("#uploadPreview");


    p.innerHTML =
        pendingImage

            ? `
                <img
                    src="${pendingImage}"
                    alt="Vista previa"
                >
              `

            : `
                <span>+</span>

                <strong>
                    Seleccionar fotografía
                </strong>

                <small>
                    JPG, PNG o WEBP · máximo 4 MB
                </small>
              `;

}


/* =========================================================
   GUARDAR OBRA
========================================================= */

$("#workForm").onsubmit =
    async e => {

        e.preventDefault();


        const f =
            e.currentTarget;


        const item = {

            id:
                editingWorkId ||
                ("work-" + Date.now()),

            title:
                f.elements.title.value.trim(),

            style:
                f.elements.style.value,

            description:
                f.elements.description
                    .value
                    .trim(),

            image:
                pendingImage

        };


        if (editingWorkId) {

            data.works =
                data.works.map(w =>

                    w.id === editingWorkId

                        ? item

                        : w

                );

        }

        else {

            data.works.push(
                item
            );

        }


        /* POR AHORA SE GUARDA LOCALMENTE.
           PARA SUPABASE NECESITAMOS
           UNA TABLA PARA LAS OBRAS. */

        saveLocal();


        renderAll();


        $("#workModal")
            .classList
            .add("hidden");


        toast(

            editingWorkId

                ? "Obra actualizada."

                : "Nueva obra agregada."

        );

};


/* =========================================================
   EDITAR OBRA
========================================================= */

window.editWork = id =>
    openWork(
        data.works.find(
            w => w.id === id
        )
    );


/* =========================================================
   ELIMINAR OBRA
========================================================= */

window.deleteWork = id => {

    if (
        confirm(
            "¿Eliminar esta obra?"
        )
    ) {

        data.works =
            data.works.filter(
                w => w.id !== id
            );


        saveLocal();


        renderAll();


        toast(
            "Obra eliminada."
        );

    }

};


/* =========================================================
   FILTROS
========================================================= */

$$(".filter").forEach(b =>

    b.onclick = () => {

        currentFilter =
            b.dataset.filter;


        $$(".filter").forEach(x =>

            x.classList.toggle(
                "active",
                x === b
            )

        );


        renderGallery();

    }

);


/* =========================================================
   EDITAR ESTILO
========================================================= */

window.editStyle = key => {

    const s =
        data.styles[key];


    const f =
        $("#styleForm");


    f.elements.styleKey.value =
        key;


    f.elements.name.value =
        s.name;


    f.elements.description.value =
        s.description;


    $("#styleModal")
        .classList
        .remove("hidden");

};


/* =========================================================
   GUARDAR ESTILO
========================================================= */

$("#styleForm").onsubmit =
    e => {

        e.preventDefault();


        const f =
            e.currentTarget;


        const key =
            f.elements.styleKey.value;


        data.styles[key] = {

            name:
                f.elements.name
                    .value
                    .trim(),

            description:
                f.elements.description
                    .value
                    .trim()

        };


        saveLocal();


        renderAll();


        $("#styleModal")
            .classList
            .add("hidden");


        toast(
            "Estilo actualizado."
        );

};


/* =========================================================
   GUARDAR INFORMACIÓN DEL ESTUDIO
========================================================= */

$("#studioForm").onsubmit =
    async e => {

        e.preventDefault();


        const fd =
            new FormData(
                e.currentTarget
            );


        data.studio =
            Object.fromEntries(
                fd.entries()
            );


        const saved =
            await save();


        if (saved) {

            toast(
                "Información guardada en Supabase."
            );

        }

};


/* =========================================================
   EXPORTAR DATOS
========================================================= */

$("#exportData").onclick =
    () => {

        const blob =
            new Blob(

                [
                    JSON.stringify(
                        data,
                        null,
                        2
                    )
                ],

                {
                    type:
                        "application/json"
                }

            );


        const a =
            document.createElement(
                "a"
            );


        a.href =
            URL.createObjectURL(
                blob
            );


        a.download =
            "NOIR_contenido.json";


        a.click();


        URL.revokeObjectURL(
            a.href
        );

};


/* =========================================================
   IMPORTAR DATOS
========================================================= */

$("#importData").onchange =
    e => {

        const file =
            e.target.files[0];


        if (!file) return;


        const r =
            new FileReader();


        r.onload = () => {

            try {

                const imported =
                    JSON.parse(
                        r.result
                    );


                if (
                    !imported.works ||
                    !imported.styles
                ) {

                    throw 0;

                }


                data =
                    imported;


                saveLocal();


                renderAll();


                toast(
                    "Contenido importado correctamente."
                );

            }

            catch {

                toast(
                    "El archivo no es válido."
                );

            }

        };


        r.readAsText(
            file
        );

};


/* =========================================================
   RESTABLECER DATOS
========================================================= */

$("#resetData").onclick =
    () => {

        if (

            confirm(
                "Esto restaurará la demostración y eliminará los cambios guardados en este navegador."
            )

        ) {

            data =
                structuredClone(
                    DEFAULT
                );


            saveLocal();


            renderAll();


            toast(
                "Demostración restablecida."
            );

        }

};


/* =========================================================
   ARTISTAS
========================================================= */

$("#artistDemo").onclick =
    () =>

        toast(
            "La gestión de artistas será el siguiente módulo."
        );


/* =========================================================
   INICIAR APLICACIÓN
========================================================= */

async function initApp() {

    console.log(
        "Iniciando NOIR Admin..."
    );


    /* PRIMERO MOSTRAR DATOS LOCALES */

    renderAll();


    /* DESPUÉS CARGAR DATOS DE SUPABASE */

    await loadStudioFromSupabase();


    /* VOLVER A RENDERIZAR
       CON LOS DATOS ACTUALIZADOS */

    renderAll();


    console.log(
        "NOIR Admin iniciado correctamente."
    );

}


initApp();
