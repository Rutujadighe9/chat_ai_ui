import { useState } from "react";
import ChatPage from "./components/ChatPage.jsx";
import LoginPage from "./components/LoginPage.jsx";

export default function App() {
  const [user, setUser] = useState(null);
  return user ? <ChatPage user={user} /> : <LoginPage onLogin={setUser} />;
}
