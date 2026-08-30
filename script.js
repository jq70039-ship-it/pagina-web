const menuButton=document.getElementById('menuButton');
const nav=document.getElementById('nav');
if(menuButton&&nav){menuButton.addEventListener('click',()=>{nav.classList.toggle('active');menuButton.textContent=nav.classList.contains('active')?'×':'☰'});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('active');menuButton.textContent='☰'}));}
const form=document.getElementById('bookingForm');
const message=document.getElementById('formMessage');
if(form){form.addEventListener('submit',e=>{e.preventDefault();message.textContent='Solicitud registrada. El siguiente paso será conectar este formulario con correo o WhatsApp.';form.reset();});}
