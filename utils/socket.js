import { io } from "socket.io-client";

const socket = io('https://chatnow-c646.onrender.com', {
    autoConnect: false
})

export default socket