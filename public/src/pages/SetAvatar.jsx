import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { ToastContainer, toast } from "react-toastify";
import { Buffer } from "buffer";
import Loader from "../assets/loader.gif";
import { AuthContext } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import { setAvatarRoute } from "../utils/APIRoute";

function SetAvatar() {
  const navigate = useNavigate();
  const { auth, setAuth } = useContext(AuthContext);
  const api = `https://api.multiavatar.com`;
  const [avatars, setAvatars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState(undefined);
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

  const setProfilePicture = async () => {
    if (selectedAvatar === undefined)
      toast.error("Please select an avatar", toastOptions);
    else {
      try {
        const response = await fetch(`${setAvatarRoute}/${auth._id}`, {
          method: "POST", // *GET, POST, PUT, DELETE, etc.
          mode: "cors", // no-cors, *cors, same-origin
          headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: JSON.stringify({
            img: avatars[selectedAvatar],
          }), // body data type must match "Content-Type" header
        });
        const data = await response.json();
        if (data.isSet) {
          localStorage.setItem("image", avatars[selectedAvatar]);
          // setAuth({...auth,isAvatarImageSet:true,avatarImage:avatars[selectedAvatar]})
          navigate("/");
        } else {
          data.msg
            ? toast.error(data.msg, toastOptions)
            : toast.error(
                "Error setting avatar. Please try again",
                toastOptions
              );
        }
      } catch (err) {
        toast.error("Server Not Responding", toastOptions);
      }
    }
  };

  const LoadAvatars = async () => {
    const data = [];
    try {
      for (let i = 0; i < 4; i++) {
        const resp = await fetch(`${api}/${Math.round(Math.random() * 1000)}`);
        const img = await resp.text();
        const buffer = new Buffer(img);
        data.push(buffer.toString("base64"));
        // setAvatars((prev_avt)=>{
        //   console.log(prev_avt)
        //   return [...prev_avt,data]
        // });
      }
      setAvatars(data);
      setIsLoading(false);
    } catch (err) {
      toast.error("Can't load avatar");
      console.log(err.message);
    }
  };
  useEffect(() => {
    if (auth.isAvatarImageSet || localStorage.getItem("image")) navigate("/");
    else LoadAvatars();
  }, []);
  
  return (
    <>
      {isLoading ? (
        <Container>
          <img src={Loader} alt="loader" className="loader" />
        </Container>
      ) : (
        <Container>
          <div className="title-container">
            <h2 className="wlcm_msg">Welcome {auth.username}</h2>
            <h1>Pick an Avatar as your profile picture</h1>
          </div>
          <div className="avatars">
            {avatars.map((img, index) => {
              return (
                <div
                  key={index}
                  className={`avatar ${
                    selectedAvatar === index ? "selected" : ""
                  }`}
                >
                  <img
                    src={`data:image/svg+xml;base64,${img}`}
                    alt="avatar"
                    onClick={() => setSelectedAvatar(index)}
                  />
                </div>
              );
            })}
          </div>
          <button onClick={setProfilePicture} className="submit-btn">
            Set as Profile Picture
          </button>
          <ToastContainer />
        </Container>
      )}
    </>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 3rem;
  background-color: #131324;
  height: 100vh;
  width: 100vw;

  .loader {
    max-inline-size: 100%;
  }
  .wlcm_msg {
    text-align: center;
    padding: 2rem;
    color: Tomato;
  }

  .title-container {
    h1 {
      color: white;
    }
  }
  .avatars {
    display: flex;
    gap: 2rem;

    .avatar {
      border: 0.4rem solid transparent;
      padding: 0.4rem;
      border-radius: 5rem;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: 0.5s ease-in-out;
      img {
        height: 6rem;
        transition: 0.5s ease-in-out;
      }
      img:hover {
        cursor: default;
        transform: rotate(360deg);
        transition: all 0.3s ease-in-out 0s;
      }
    }
    .selected {
      border: 0.4rem solid #4e0eff;
    }
  }
  .submit-btn {
    background-color: #4e0eff;
    color: white;
    padding: 1rem 2rem;
    border: none;
    font-weight: bold;
    cursor: pointer;
    border-radius: 0.4rem;
    font-size: 1rem;
    text-transform: uppercase;
    &:hover {
      background-color: #4e0eff;
    }
  }
`;

export default SetAvatar;
