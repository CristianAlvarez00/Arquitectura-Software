//Esta es la dirección base de la API desarrollada en Spring Boot.
const API_URL = 'http://localhost:8088/api';

//Convierte una respuesta del servidor en datos o en un error entendible.
async function readResponse(response) {
  if (response.status === 204) return null; //DELETE responde sin contenido.

  const data = await response.json(); //Leemos el JSON que devuelve el backend.

  if (!response.ok) throw new Error(typeof data === 'string' ? data : 'No se pudo completar la solicitud.');

  return data; //Entregamos los datos a la vista que hizo la solicitud.
}

//Pide al backend la lista de todos los clientes.
export async function getCustomers() {
  return readResponse(await fetch(`${API_URL}/customers`));
}

//Crea un cliente nuevo con los datos recibidos desde el formulario.
export async function createCustomer(customer) {
  return readResponse(await fetch(`${API_URL}/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customer),
  }));
}

//Actualiza un cliente usando la ruta opcional agregada al controlador.
export async function updateCustomer(id, customer) {
  return readResponse(await fetch(`${API_URL}/customers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customer),
  }));
}

//Elimina un cliente usando la ruta opcional agregada al controlador.
export async function deleteCustomer(id) {
  return readResponse(await fetch(`${API_URL}/customers/${id}`, { method: 'DELETE' }));
}

//Envía el dinero de una cuenta a otra.
export async function transferMoney(transfer) {
  return readResponse(await fetch(`${API_URL}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transfer),
  }));
}

//Consulta el histórico de movimientos de una cuenta específica.
export async function getTransactions(accountNumber) {
  return readResponse(await fetch(`${API_URL}/transactions/${accountNumber}`));
}
