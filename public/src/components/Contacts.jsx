import React, { useState, useEffect, useContext } from "react";
import styled from "styled-components";
import Logo from "../assets/logo.svg";
import { AuthContext } from "../context/AuthProvider";

export default function Contacts({contacts,changeChat,socket}) {
  const [currentSelected, setCurrentSelected] = useState(undefined);
  const {auth} = useContext(AuthContext)
  const [onlineIds,setOnlineIds]=useState([])
  const userimg= auth.avatarImage || localStorage.getItem("image")
 
  const changeCurrentChat = (index, contact) => {
    setCurrentSelected(index);
    changeChat(contact)
  };

  useEffect(()=>{
       socket.current.on("online-user", (id) => {
        setOnlineIds((prev)=> [...prev,id])
        })

       socket.current.on("offline-user", (id) => {
        setOnlineIds((prev)=> prev.filter((Id)=> Id != id))
        })
  
  },[])

  function checkOnline(id){
    if(onlineIds ?.length>0) return onlineIds.find(ID=> ID==id)
  }
  return (
    <>
        <Container>
          <div className="brand">
            <img src={Logo} alt="logo" />
            <h3>snappy</h3>
          </div>
          <div className="contacts">
            {contacts.map((contact, index) => {
              return (
                <div
                  key={contact._id}
                  className={`contact ${
                    index === currentSelected ? "selected" : ""
                  }`}
                  onClick={() => changeCurrentChat(index, contact)}
                >
                  <div className="avatar">
                    <img
                      src={`data:image/svg+xml;base64,${contact.avatarImage}`}
                      alt=""
                    />
                  </div>
                  <div className="username">
                    <h3>{contact.username}</h3>
                    {checkOnline(contact._id) || contact.isOnline ? <span style={{color:"green"}}>Online</span> : <span style={{color:"red"}}>Offline</span>}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="current-user">
            <div className="avatar">
              <img
                src={`data:image/svg+xml;base64,${userimg}`}
                alt="avatar"
              />
            </div>
            <div className="username">
              <h2>{auth.username}</h2>
            </div>
          </div>
        </Container>
    </>
  );
}
const Container = styled.div`
  display: grid;
  height:100%;
  grid-template-rows: 10% 75% 15%;
  overflow: hidden;
  background-color: #080420;
  .brand {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;
    img {
      height: 2rem;
    }
    h3 {
      color: white;
      text-transform: uppercase;
    }
  }
  .contacts {
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: auto;
    gap: 0.8rem;
    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }
    .contact {
      background-color: #ffffff34;
      min-height: 4rem;
      cursor: pointer;
      width: 90%;
      border-radius: 0.2rem;
      padding: 0.4rem;
      display: flex;
      gap: 1rem;
      align-items: center;
      transition: 0.5s ease-in-out;
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
    .selected {
      background-color: #9a86f3;
    }
  }

  .current-user {
    background-color: #0d0d30;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    .avatar {
      img {
        height: 4rem;
        max-inline-size: 100%;
      }
    }
    .username {
      h2 {
        color: white;
      }
    }
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      gap: 0.5rem;
      .username {
        h2 {
          font-size: 1rem;
        }
      }
    }
  }
`;