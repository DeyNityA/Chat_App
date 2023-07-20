import React, { useState, useEffect, useRef, useContext } from "react";

import styled from "styled-components";

import Logout from "./Logout";
import ChatInput from "./ChatInput";
import { AuthContext } from "../context/AuthProvider";
import { getMsgRoute, setMsgRoute } from "../utils/APIRoute";

export default function ChatContainer({ currentChat, socket }) {
  const { auth } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [arrivalMessage, setArrivalMessage] = useState({});
  const scrollRef = useRef();

  const handleSendMsg = async (msg) => {
    try {
      const response = await fetch(setMsgRoute, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        headers: {
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify({
          msg: msg,
          sendTo: currentChat._id,
          sendBy: auth._id,
        }), // body data type must match "Content-Type" header
      });
      const data = await response.json();
      console.log(data);
      if (data.status === true) {
        setMessages((prevmsgs) => [
          ...prevmsgs,
          { fromSelf: true, message: msg },
        ]);

        socket.current.emit("send-msg", {
          msg: msg,
          to: currentChat._id,
          from: auth._id,
        });
      } else {
        console.log(data.msg);
      }
    } catch (err) {
      console.log(err.msg);
    }
  };


  useEffect(()=>{
    if (socket.current) {
      socket.current.on("msg-recieve", ({msg,from}) => {
      
        setArrivalMessage({ fromSelf: false, message: msg,from:from });
        })
    }
  },[])

  useEffect(() => {
    if(arrivalMessage.from===currentChat._id){
    setMessages((prev) => [...prev, {fromSelf: arrivalMessage.fromSelf, message: arrivalMessage.message}]);
    }
  }, [arrivalMessage]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const getMsg = async () => {
      try {
        const response = await fetch(getMsgRoute, {
          method: "POST", // *GET, POST, PUT, DELETE, etc.
          mode: "cors", // no-cors, *cors, same-origin
          headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: JSON.stringify({
            oppuser: currentChat._id,
            user: auth._id,
          }), // body data type must match "Content-Type" header
        });
        const data = await response.json();
        if (data.status === true) {
          setMessages(data.projectMessages);
        } else {
          console.log(data.msg);
        }
      } catch (err) {
        console.log(err.msg);
      }
    };
    getMsg();
  }, [currentChat]);

  return (
    <Container>
      <div className="chat-header">
        <div className="user-details">
          <div className="avatar">
            <img
              src={`data:image/svg+xml;base64,${currentChat.avatarImage}`}
              alt=""
            />
          </div>
          <div className="username">
            <h3>{currentChat.username}</h3>
          </div>
        </div>
        <Logout />
      </div>
      <div className="chat-messages">
        {messages.map((message, index) => {
          return (
            <div key={index}>
              <div
                ref={scrollRef}
                className={`message ${
                  message.fromSelf ? "sended" : "recieved"
                }`}
              >
                <div className="content ">
                  <p>{message.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <ChatInput handleSendMsg={handleSendMsg} />
    </Container>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 80% 10%;
  gap: 0.1rem;
  overflow: hidden;
  @media screen and (min-width: 720px) and (max-width: 1080px) {
    grid-template-rows: 15% 70% 15%;
  }
  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;
      .avatar {
        img {
          height: 3rem;
        }
      }
      .username {
        h3 {
          color: white;
        }
      }
    }
  }
  .chat-messages {
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: auto;
    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }
    .message {
      display: flex;
      align-items: center;
      .content {
        max-width: 40%;
        overflow-wrap: break-word;
        padding: 1rem;
        font-size: 1.1rem;
        border-radius: 1rem;
        color: #d1d1d1;
        @media screen and (min-width: 720px) and (max-width: 1080px) {
          max-width: 70%;
        }
      }
    }
    .sended {
      justify-content: flex-end;
      .content {
        background-color: #2d755b;
      }
    }
    .recieved {
      justify-content: flex-start;
      .content {
        background-color: #9900ff20;
      }
    }
  }
`;
