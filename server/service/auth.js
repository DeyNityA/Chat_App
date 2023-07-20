const jwt= require('jsonwebtoken')


const createToken= async (user)=>{
try{
    const payload= {
        _id:user._id,
        username:user.username,
        email:user.email,
        isAvatarImageSet:user.isAvatarImageSet,
        avatarImage: user.avatarImage
    }
  const token = await jwt.sign(payload,process.env.SECRET_KEY,{expiresIn:'3d'});
  console.log(token);
  return token;
  
  
}catch(err){
    console.log(err.message);
}
}


 async function getUser(token){
    try{
    const user= await jwt.verify(token,process.env.SECRET_KEY);
    return user;
    }catch(err){
        console.log(err.message);
    }
}

module.exports ={
    getUser,
    createToken,
};