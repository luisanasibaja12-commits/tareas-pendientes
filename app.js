const form = document.getElementById('form');
const titleInput = document.getElementById('title');
const dueInput = document.getElementById('due');
const tasksEl = document.getElementById('tasks');

// Pedir permiso para mostrar notificaciones del navegador
if (Notification.permission !== "granted") {
  Notification.requestPermission();
} 

// Cargar tareas desde localStorage
let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');

function sendNotification(title, message) {
  if (Notification.permission === "granted") {
    new Notification(title, { body: message });
  }
}

function render() {
  tasksEl.innerHTML = '';
  
 // Eliminar tareas vencidas automáticamente
  const now = Date.now();
  tasks = tasks.filter(t => new Date(t.due) > now);
  localStorage.setItem('tasks', JSON.stringify(tasks));

  if (!tasks.length) {
    tasksEl.innerHTML = '<li>No hay tareas</li>';
    return;
  }

  // Ordenar tareas por fecha de entrega (más próximas primero)
  tasks.sort((a, b) => new Date(a.due) - new Date(b.due));

  tasks.forEach((t, index) => {
    const li = document.createElement('li');

    // Colores según cercanía
    const hoursLeft = (new Date(t.due) - Date.now()) / (1000 * 60 * 60);
// Enviar notificaciones según el tiempo restante
  if (hoursLeft <= 24 && !t.notified24) {
    sendNotification(" Tarea urgente", "La tarea '" + t.title + "' vence en menos de 24 horas.");
    t.notified24 = true;
  } else if (hoursLeft <= 48 && !t.notified48) {
    sendNotification(" Tarea próxima", "La tarea '" + t.title + "' vence en menos de 48 horas.");
    t.notified48 = true;
  } else if (hoursLeft <= 192 && !t.notified8d) {
    sendNotification(" Tarea próxima semana", "La tarea '" + t.title + "' vence en menos de 8 días.");
    t.notified8d = true;
  }


    if (hoursLeft <= 24) {
  // Menos de 24 horas → rojo (urgente)
  li.style.background = "#ffb3b3";
} else if (hoursLeft <= 48) {
  // Menos de 48 horas → rosa (próxima)
  li.style.background = "#ffd6e7";
} else if (hoursLeft <= 192) {
  // Menos de 8 días (8×24=192 horas) → amarillo (en plazo)
  li.style.background = "#fff7b3";
} else {
  // Más de 8 días → azul (lejana)
  li.style.background = "#cce0ff";
}


    li.innerHTML = `
      <div>
        <strong>${t.title}</strong> <span class="small">(${new Date(t.due).toLocaleString()})</span>
      </div>
      <button class="btn-delete" data-index="${index}">Eliminar</button>
    `;
    tasksEl.appendChild(li);
  });

  // Botones de eliminar
  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = btn.getAttribute('data-index');
      tasks.splice(idx, 1);
      localStorage.setItem('tasks', JSON.stringify(tasks));
      render();
    });
  });
}

// Agregar nueva tarea
form.addEventListener('submit', e => {
  e.preventDefault();
  const task = {
    title: titleInput.value,
    due: dueInput.value
  };
  tasks.push(task);
  localStorage.setItem('tasks', JSON.stringify(tasks));
  render();
  form.reset();
});

// Mostrar tareas guardadas al iniciar
render();
// Actualizar automáticamente cada minuto
setInterval(render, 60000);