import React, { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "../auth/authContex";
import { useNavigate } from "react-router-dom";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { app } from "../firebaseConfig";
import { Transactions } from "../components/Transactions";
import { Chat } from "../components/Chat";
import { SoporteChat } from "../components/SoporteChat";
import { TransactionHistory } from "../components/TransactionHistory";
import { downloadPDF } from "../utils/downloadPDF";
import UserCards from "../components/UserCard";
import { Container, Row, Col, Card, Button, Spinner } from "react-bootstrap";

export const Profile = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [accountData, setAccountData] = useState(null);
  const [transactions, setTransactions] = useState([]); // Estado para las transacciones

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      const db = getFirestore(app);

      // Verificar rol del usuario
      const rolesCollection = collection(db, "roles");
      const q = query(rolesCollection, where("email", "==", currentUser.email));
      const rolesSnapshot = await getDocs(q);

      if (!rolesSnapshot.empty) {
        const userRoleData = rolesSnapshot.docs[0].data();
        setUserRole(userRoleData.role);
      }

      // Obtener datos de la cuenta
      const accountsCollection = collection(db, "accounts");
      const q2 = query(accountsCollection, where("ownerId", "==", currentUser.uid));
      const querySnapshot = await getDocs(q2);

      if (querySnapshot.empty) {
        navigate('/crear-cuenta');
      } else {
        const accountInfo = querySnapshot.docs[0].data();
        setAccountData(accountInfo);

        // Obtener transacciones
        const transactionsRef = collection(db, "transactions");
        const q3 = query(transactionsRef, where("account_id", "==", `account_${currentUser.uid}`));
        const transactionsSnapshot = await getDocs(q3);
        
        const transactionsData = [];
        transactionsSnapshot.forEach((doc) => {
          transactionsData.push(doc.data());
        });

        transactionsData.sort((a, b) => b.transaction_date.toDate() - a.transaction_date.toDate());
        setTransactions(transactionsData);
      }

      setLoading(false);
    };

    fetchUserData();
  }, [currentUser, navigate]);

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <Card className="p-4 shadow-sm">
        <Card.Body>
          <Row className="text-center mb-4">
            <Col>
              <FaUserCircle size={100} className="mb-3" />
              <h2>Perfil</h2>
              <p className="h4">Bienvenido, {currentUser.displayName}</p>
              <p className="text-muted">{currentUser.email}</p>
            </Col>
          </Row>
          <UserCards />
          {accountData && (
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>Información de la Cuenta</Card.Title>
                <Card.Text>
                  <p><strong>Tipo de cuenta:</strong> {accountData.accountType}</p>
                  <p><strong>Saldo:</strong> ${accountData.balance} MXN</p>
                </Card.Text>
                <Button 
                  variant="primary"
                  onClick={() => downloadPDF(accountData, currentUser, transactions)}
                >
                  Descargar Estado de Cuenta
                </Button>
              </Card.Body>
            </Card>
          )}

          <Row>
            <Col md={6} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title>Transacciones</Card.Title>
                  <Transactions updateBalance={(newBalance) => setAccountData(prevState => ({ ...prevState, balance: newBalance }))} />
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title>Historial de Transacciones</Card.Title>
                  <TransactionHistory />
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card className="mt-4">
            <Card.Body>
              <Card.Title>Chat en Tiempo Real</Card.Title>
              {userRole === 'soporte' ? <SoporteChat /> : <Chat />}
            </Card.Body>
          </Card>

          {userRole === 'admin' && (
            <Button 
              variant="secondary"
              className="mt-4"
              onClick={() => navigate('/admin/users')}
            >
              Panel de Administración
            </Button>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};
