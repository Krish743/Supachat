import React, { useState, useEffect, useRef } from "react";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { collection, addDoc, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";
import { Filter } from "bad-words";

const filter = new Filter();
const provider = new GoogleAuthProvider();

const SpaceBackground = () => (
  <div className="space-bg">
    <svg className="space-doodle rocket" viewBox="0 0 100 100">
      <path d="M50 10c-1 0-2 1-2.5 20L40 50l-10 5v10l20-10 20 10V55l-10-5-7.5-20C52 11 51 10 50 10z" fill="currentColor"/>
    </svg>
    
    <svg className="space-doodle planet1" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="40" fill="currentColor"/>
      <ellipse cx="50" cy="50" rx="40" ry="10" fill="currentColor" opacity="0.3"/>
    </svg>
    
    <svg className="space-doodle planet2" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="35" fill="currentColor"/>
      <circle cx="35" cy="40" r="10" fill="currentColor" opacity="0.3"/>
    </svg>
    
    <svg className="space-doodle stars1" viewBox="0 0 100 100">
      {[...Array(8)].map((_, i) => (
        <path 
          key={i} 
          d={`M${50 + 30 * Math.cos(i * Math.PI / 4)} ${50 + 30 * Math.sin(i * Math.PI / 4)} L${50} 50`} 
          stroke="currentColor" 
          strokeWidth="2"
        />
      ))}
    </svg>
    
    <svg className="space-doodle stars2" viewBox="0 0 100 100">
      {[...Array(12)].map((_, i) => (
        <circle
          key={i}
          cx={50 + 25 * Math.cos(i * Math.PI / 6)}
          cy={50 + 25 * Math.sin(i * Math.PI / 6)}
          r="2"
          fill="currentColor"
        />
      ))}
    </svg>
    
    <svg className="space-doodle comet" viewBox="0 0 120 60">
      <path d="M10 30 L100 30 L90 20 L100 30 L90 40" stroke="currentColor" fill="none" strokeWidth="2"/>
      <circle cx="100" cy="30" r="5" fill="currentColor"/>
    </svg>
  </div>
);

const App = () => {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const chatContainerRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, "messages"), orderBy("timestamp"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setMessages(snapshot.docs.map((doc) => doc.data()));
      });
      return unsubscribe;
    }
  }, [user]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const signIn = async () => {
    const result = await signInWithPopup(auth, provider);
    setUser(result.user);
  };

  const handleSignOut = () => {
    signOut(auth);
    setUser(null);
    setMenuOpen(false);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (text.trim()) {
      try {
        setIsSending(true);
        
        // Filter the text before sending
        const originalText = text.trim();
        const hasProfanity = filter.isProfane(originalText);
        const cleanText = hasProfanity ? filter.clean(originalText) : originalText;
        
        await addDoc(collection(db, "messages"), {
          text: cleanText,
          uid: user.uid,
          photoURL: user.photoURL,
          timestamp: serverTimestamp(),
          displayName: user.displayName,
          containedProfanity: hasProfanity
        });
        
        setText("");
      } catch (error) {
        console.error("Error sending message:", error);
        alert("Failed to send message. Please try again.");
      } finally {
        setIsSending(false);
      }
    }
  };

  if (!user) {
    return (
      <>
        <SpaceBackground />
        <div className="app">
          <div className="sign-in-container">
            <div className="sign-in-brand">Supachat 🔥</div>
            <div className="sign-in-footer">made with 💖 by Krish.</div>
            <button className="btn sign-in" onClick={signIn}>
              Sign in with Google
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="brand">Supachat🔥</div>
        <div className="menu-container" ref={menuRef}>
          <div className="menu-dots" onClick={() => setMenuOpen(!menuOpen)}>
            ⋮
          </div>
          {menuOpen && (
            <div className="dropdown-menu">
              <button onClick={handleSignOut}>Sign Out</button>
            </div>
          )}
        </div>
      </header>
      <div className="chat-container" ref={chatContainerRef}>
        <div className="messages">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`message ${msg.uid === user?.uid ? "sent" : "received"}`}
            >
              <img src={msg.photoURL} alt="Avatar" className="avatar" />
              <div>
                <strong>{msg.displayName}</strong>
                <p>
                  {msg.text}
                  {msg.containedProfanity && (
                    <span className="filtered-badge">
                      (filtered)
                    </span>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <form className="message-form" onSubmit={sendMessage}>
        <input
          className="message-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          disabled={isSending}
        />
        <button className="btn send" type="submit" disabled={isSending}>
          {isSending ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
};

export default App;