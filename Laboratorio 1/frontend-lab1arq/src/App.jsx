//Este componente contiene las tres vistas solicitadas en el ejercicio.
import { useEffect, useState } from 'react';
import {
  createCustomer,
  deleteCustomer,
  getCustomers,
  getTransactions,
  transferMoney,
  updateCustomer,
} from './api';

//Valor inicial para reutilizar el formulario de crear y editar clientes.
const emptyCustomer = { firstName: '', lastName: '', accountNumber: '', balance: '' };

//Da formato de dinero colombiano a los valores que vienen de la API.
function money(value) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(value || 0);
}

//Da formato legible a la fecha que entrega el backend.
function date(value) {
  return value ? new Date(value).toLocaleString('es-CO') : 'Sin fecha';
}

export default function App() {
  const [view, setView] = useState('customers'); //Controla cuál de las tres vistas se muestra.
  const [customers, setCustomers] = useState([]); //Guarda los clientes recibidos desde la API.
  const [customerForm, setCustomerForm] = useState(emptyCustomer); //Guarda lo escrito en el formulario.
  const [editingId, setEditingId] = useState(null); //Indica si el formulario está editando un cliente.
  const [transfer, setTransfer] = useState({ senderAccountNumber: '', receiverAccountNumber: '', amount: '' }); //Datos de la transferencia.
  const [historyAccount, setHistoryAccount] = useState(''); //Cuenta elegida para ver su histórico.
  const [transactions, setTransactions] = useState([]); //Movimientos de la cuenta seleccionada.
  const [message, setMessage] = useState(''); //Mensaje visible de éxito o error.
  const [loading, setLoading] = useState(false); //Evita enviar acciones mientras la API responde.

  //Cargamos los clientes apenas abre la aplicación.
  useEffect(() => { loadCustomers(); }, []);

  //Consulta y guarda todos los clientes actuales.
  async function loadCustomers() {
    try {
      setLoading(true);
      setCustomers(await getCustomers());
    } catch (error) {
      setMessage(`Error al consultar clientes: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  //Actualiza un campo del formulario de cliente sin modificar los demás.
  function changeCustomer(event) {
    const { name, value } = event.target;
    setCustomerForm({ ...customerForm, [name]: value });
  }

  //Crea o actualiza un cliente según el modo del formulario.
  async function saveCustomer(event) {
    event.preventDefault(); //Evita que el navegador recargue la página.
    try {
      setLoading(true);
      const customer = { ...customerForm, balance: Number(customerForm.balance) }; //El saldo debe viajar como número.
      if (editingId) {
        await updateCustomer(editingId, customer);
        setMessage('Cliente actualizado correctamente.');
      } else {
        await createCustomer(customer);
        setMessage('Cliente creado correctamente.');
      }
      setCustomerForm(emptyCustomer); //Limpiamos el formulario al terminar.
      setEditingId(null); //Volvemos al modo crear.
      await loadCustomers(); //Refrescamos la tabla con los nuevos datos.
    } catch (error) {
      setMessage(`No se pudo guardar el cliente: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  //Carga los datos de una fila dentro del formulario para poder editarla.
  function editCustomer(customer) {
    setCustomerForm({ firstName: customer.firstName, lastName: customer.lastName, accountNumber: customer.accountNumber, balance: customer.balance });
    setEditingId(customer.id);
    setMessage(`Editando a ${customer.firstName} ${customer.lastName}.`);
  }

  //Elimina al cliente únicamente cuando el usuario lo confirma.
  async function removeCustomer(id) {
    if (!window.confirm('¿Seguro que deseas eliminar este cliente?')) return;
    try {
      setLoading(true);
      await deleteCustomer(id);
      setMessage('Cliente eliminado correctamente.');
      await loadCustomers();
    } catch (error) {
      setMessage(`No se pudo eliminar el cliente: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  //Actualiza un campo del formulario de transferencias.
  function changeTransfer(event) {
    const { name, value } = event.target;
    setTransfer({ ...transfer, [name]: value });
  }

  //Envía la transferencia a la API y actualiza los saldos mostrados.
  async function sendTransfer(event) {
    event.preventDefault();
    try {
      setLoading(true);
      await transferMoney({ ...transfer, amount: Number(transfer.amount) });
      setTransfer({ senderAccountNumber: '', receiverAccountNumber: '', amount: '' });
      setMessage('Transferencia realizada correctamente.');
      await loadCustomers();
    } catch (error) {
      setMessage(`No se pudo realizar la transferencia: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  //Consulta los movimientos asociados a la cuenta digitada.
  async function searchHistory(event) {
    event.preventDefault();
    if (!historyAccount.trim()) return setMessage('Escribe un número de cuenta para consultar el histórico.');
    try {
      setLoading(true);
      setTransactions(await getTransactions(historyAccount));
      setMessage('Histórico consultado correctamente.');
    } catch (error) {
      setTransactions([]);
      setMessage(`No se pudo consultar el histórico: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  //Muestra la vista de clientes con el formulario y su tabla.
  function customersView() {
    return <section className="grid two-columns">
      <article className="card">
        <h2>{editingId ? 'Editar cliente' : 'Crear cliente'}</h2>
        <form onSubmit={saveCustomer} className="form">
          <input name="firstName" placeholder="Nombres" value={customerForm.firstName} onChange={changeCustomer} required />
          <input name="lastName" placeholder="Apellidos" value={customerForm.lastName} onChange={changeCustomer} required />
          <input name="accountNumber" placeholder="Número de cuenta" value={customerForm.accountNumber} onChange={changeCustomer} required />
          <input name="balance" type="number" min="0" step="0.01" placeholder="Saldo inicial" value={customerForm.balance} onChange={changeCustomer} required />
          <button disabled={loading}>{editingId ? 'Guardar cambios' : 'Crear cliente'}</button>
          {editingId && <button type="button" className="secondary" onClick={() => { setEditingId(null); setCustomerForm(emptyCustomer); }}>Cancelar edición</button>}
        </form>
      </article>
      <article className="card table-card">
        <div className="heading-row"><h2>Consultar clientes</h2><button className="secondary small" onClick={loadCustomers}>Actualizar</button></div>
        <div className="table-wrapper"><table><thead><tr><th>Cliente</th><th>Cuenta</th><th>Saldo</th><th>Acciones</th></tr></thead>
          <tbody>{customers.length ? customers.map((customer) => <tr key={customer.id}><td>{customer.firstName} {customer.lastName}</td><td>{customer.accountNumber}</td><td>{money(customer.balance)}</td><td className="actions"><button className="small secondary" onClick={() => editCustomer(customer)}>Editar</button><button className="small danger" onClick={() => removeCustomer(customer.id)}>Eliminar</button></td></tr>) : <tr><td colSpan="4">No hay clientes para mostrar.</td></tr>}</tbody>
        </table></div>
      </article>
    </section>;
  }

  //Muestra la segunda vista: formulario para mover dinero entre cuentas.
  function transferView() {
    return <section className="card narrow"><h2>Realizar transferencia</h2><p>Ingresa las cuentas y el valor que deseas transferir.</p>
      <form onSubmit={sendTransfer} className="form"><input name="senderAccountNumber" placeholder="Cuenta de origen" value={transfer.senderAccountNumber} onChange={changeTransfer} required /><input name="receiverAccountNumber" placeholder="Cuenta de destino" value={transfer.receiverAccountNumber} onChange={changeTransfer} required /><input name="amount" type="number" min="0.01" step="0.01" placeholder="Monto" value={transfer.amount} onChange={changeTransfer} required /><button disabled={loading}>Transferir dinero</button></form>
    </section>;
  }

  //Muestra la tercera vista: tabla del histórico de una cuenta.
  function historyView() {
    return <section className="card"><h2>Histórico de transacciones</h2><form onSubmit={searchHistory} className="inline-form"><input placeholder="Número de cuenta" value={historyAccount} onChange={(event) => setHistoryAccount(event.target.value)} required /><button disabled={loading}>Consultar histórico</button></form>
      <div className="table-wrapper"><table><thead><tr><th>Fecha</th><th>Origen</th><th>Destino</th><th>Monto</th></tr></thead><tbody>{transactions.length ? transactions.map((transaction) => <tr key={transaction.id}><td>{date(transaction.timestamp)}</td><td>{transaction.senderAccountNumber}</td><td>{transaction.receiverAccountNumber}</td><td>{money(transaction.amount)}</td></tr>) : <tr><td colSpan="4">Consulta una cuenta para ver sus movimientos.</td></tr>}</tbody></table></div>
    </section>;
  }

  return <main className="app"><header><span className="logo">U</span><div><h1>UdeA Bank</h1><p>Administración básica de clientes y transferencias.</p></div></header>
    <nav><button className={view === 'customers' ? 'active' : ''} onClick={() => setView('customers')}>Clientes</button><button className={view === 'transfer' ? 'active' : ''} onClick={() => setView('transfer')}>Transferir dinero</button><button className={view === 'history' ? 'active' : ''} onClick={() => setView('history')}>Histórico</button></nav>
    {message && <p className="message">{message}</p>}
    {view === 'customers' && customersView()}{view === 'transfer' && transferView()}{view === 'history' && historyView()}
  </main>;
}
