import React, { useContext, useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { authRoute } from "./utils/APIRoute";
import { AuthContext } from "./context/AuthProvider";

function ProtectRouter() {
    const {setAuth}= useContext(AuthContext)
  const [status, setStatus] = useState({ loading: true, redirect: false });
  const { loading, redirect } = status;
  const [msg,setMsg] = useState(null)

  const findUser = async () => {
    const isToken = localStorage.getItem("Token");
    if (isToken) {
      try {
        const response = await fetch(authRoute, {
          method: "POST", // *GET, POST, PUT, DELETE, etc.
          mode: "cors", // no-cors, *cors, same-origin
          headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: JSON.stringify({
            token: isToken,
          }), // body data type must match "Content-Type" header
        });
        const data = await response.json();

        if (data.status === true) {
          setAuth(data.user)
          setStatus({ ...status, loading: false });
        } else {
          data.msg? setMsg(data.msg): setStatus({ ...status, loading: false, redirect: true }) 
        }
      } catch (err) {
        setMsg('Server Not Responding')
      }
    } else {
      setStatus({ ...status, loading: false, redirect: true });
    }
  };

  useEffect(() => {
    findUser();
  }, []);

  if(msg) return(
    <h1>{msg}</h1>
  )

  if (loading) {
    return null;
  }

  return redirect ? <Navigate to="/login" /> : <Outlet />;
}

export default ProtectRouter;
