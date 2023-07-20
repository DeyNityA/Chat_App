import React, { useEffect, useRef, useState } from "react";
import { useContext } from "react";
import { AuthContext } from "../context/AuthProvider";
import { ToastContainer, toast } from "react-toastify";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { allUsersRoute, host } from "../utils/APIRoute";
import Contacts from "../components/Contacts";
import Welcome from "../components/Welcome";
import ChatContainer from "../components/ChatContainer";
import { io } from "socket.io-client";

function Chat() {
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const [contacts, setContacts] = useState([]);
  const [currentChat, setCurrentChat] = useState(undefined);
  const socket = useRef();

  const toastOptions = {
    position: "bottom-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
  };

  async function getAllOppUsers() {
    try {
      const response = await fetch(`${allUsersRoute}/${auth._id}`);
      const data = await response.json();
      if (data.status) setContacts(data.users);
      else {
        data.msg
          ? toast.error(data.msg, toastOptions)
          : toast.error("Can't Fetch users. Please try again", toastOptions);
      }
    } catch (err) {
      toast.error("Server Not Responding", toastOptions);
    }
  }

  const handleChatChange = (chat) => {
    setCurrentChat(chat);
  };

  useEffect(() => {
    if (!localStorage.getItem("image") && !auth.isAvatarImageSet)
      navigate("/setavatar");
    else {
      getAllOppUsers();
    }
  }, [currentChat]);

  useEffect(() => {
    socket.current = io(host,{
      auth:{
        token:auth._id
      }
    });
    socket.current.emit("add-user", auth._id);
  }, []);
  return (
    <>
      <Container>
        <div className="container">
          {socket.current ? (
            <Contacts
              contacts={contacts}
              socket={socket}
              changeChat={handleChatChange}
            />
          ) : (
            <></>
          )}
          {currentChat === undefined ? (
            <Welcome />
          ) : (
            <ChatContainer currentChat={currentChat} socket={socket} />
          )}
        </div>
      </Container>
    </>
  );
}

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: #131324;
  .container {
    height: 90vh;
    width: 90vw;
    background-color: #00000076;
    display: grid;
    grid-template-columns: 25% 75%;
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      grid-template-columns: 35% 65%;
    }
  }
`;

export default Chat;
