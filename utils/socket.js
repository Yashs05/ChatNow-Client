import { io } from "socket.io-client";

const socket = io('https://chatnow-49sw.onrender.com', {
    autoConnect: false
})

export default socket