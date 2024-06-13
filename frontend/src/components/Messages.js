import React, { useEffect, useState } from 'react';
import axios from 'axios';
import getKeycloakInstance from '../keycloakService';

function Messages() {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');

  const keycloak = getKeycloakInstance();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/messages`, {
          headers: {
            Authorization: `Bearer ${keycloak.token}`,
          },
        });
        setMessages(response.data);
      } catch (error) {
        alert('Failed to fetch messages');
      }
    };
    fetchMessages();
  }, [keycloak.token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/messages`, { content }, {
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
        },
      });
      setContent('');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/messages`, {
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
        },
      });
      setMessages(response.data);
    } catch (error) {
      alert('Failed to send message');
    }
  };

  return (
    <div>
      <h2>Messages</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Your message" value={content} onChange={(e) => setContent(e.target.value)} />
        <button type="submit">Send</button>
      </form>
      <ul>
        {messages.map((message) => (
          <li key={message.id}>{message.User.username}: {message.content}</li>
        ))}
      </ul>
    </div>
  );
}

export default Messages;
