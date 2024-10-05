import React, { useState, useEffect } from "react";
import { Form, Button, Collapse, InputGroup } from "react-bootstrap";
import { fetchContacts, saveContact } from "../../services/firestoreTransactionService";
import { FaEnvelope, FaUser, FaPlusCircle, FaList } from "react-icons/fa"; // Importa los íconos de react-icons

const Contacts = ({ currentUser, setError, setSuccess, onContactSelect }) => {
  const [newContactEmail, setNewContactEmail] = useState("");
  const [newContactAlias, setNewContactAlias] = useState("");
  const [contacts, setContacts] = useState([]);
  const [showContactList, setShowContactList] = useState(false);
  const [showAddContactForm, setShowAddContactForm] = useState(false);

  useEffect(() => {
    const loadContacts = async () => {
      try {
        const userContacts = await fetchContacts(currentUser.uid);
        setContacts(userContacts);
      } catch (error) {
        setError("Error al cargar contactos.");
      }
    };

    loadContacts();
  }, [currentUser.uid, setError]);

  const handleAddContact = async (e) => {
    e.preventDefault();
    if (!newContactEmail || !newContactAlias) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    try {
      await saveContact(currentUser.uid, newContactEmail, newContactAlias);
      setSuccess("Contacto guardado con éxito.");
      setNewContactEmail("");
      setNewContactAlias("");
      const userContacts = await fetchContacts(currentUser.uid);
      setContacts(userContacts);
    } catch (error) {
      setError("Hubo un error al guardar el contacto.");
    }
  };

  return (
    <>
      <Form.Group className="mb-3">
        <Form.Check 
          type="checkbox" 
          label={<><FaList /> Mostrar lista de contactos</>}
          onChange={(e) => setShowContactList(e.target.checked)} 
        />
        <Collapse in={showContactList}>
          <div>
            <Form.Group className="mt-4">
              <Form.Label>Selecciona un Contacto</Form.Label>
              <Form.Select onChange={(e) => onContactSelect(e.target.value)}>
                <option value="">Selecciona un contacto</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.email}>
                    {contact.alias} ({contact.email})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </div>
        </Collapse>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Check 
          type="checkbox" 
          label={<><FaPlusCircle /> Agregar nuevo contacto</>}
          onChange={(e) => setShowAddContactForm(e.target.checked)} 
        />
        <Collapse in={showAddContactForm}>
          <div>
            <Form onSubmit={handleAddContact}>
              <Form.Group className="mb-3">
                <Form.Label>Correo Electrónico</Form.Label>
                <InputGroup>
                  <InputGroup.Text><FaEnvelope /></InputGroup.Text>
                  <Form.Control
                    type="email"
                    value={newContactEmail}
                    onChange={(e) => setNewContactEmail(e.target.value)}
                    placeholder="Ingresa el correo del contacto"
                  />
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Alias</Form.Label>
                <InputGroup>
                  <InputGroup.Text><FaUser /></InputGroup.Text>
                  <Form.Control
                    type="text"
                    value={newContactAlias}
                    onChange={(e) => setNewContactAlias(e.target.value)}
                    placeholder="Ingresa un alias para el contacto"
                  />
                </InputGroup>
              </Form.Group>

              <Button variant="secondary" type="submit">
                Guardar Contacto
              </Button>
            </Form>
          </div>
        </Collapse>
      </Form.Group>
    </>
  );
};

export default Contacts;
