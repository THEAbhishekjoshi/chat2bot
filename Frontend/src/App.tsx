import { io } from 'socket.io-client'
import ChatBot from './components/ChatBot';

import Sidebar from './components/common/Iconbutton';
import Message from './components/Message';

export const socket = io('http://localhost:3001');

function App(){
    return(
    
   <div className='bg-[#282A2E] flex h-dvh w-dvw'>
     
        {/* <ChatBot/> */}

        {/* Sidebarsection */}
        <Sidebar/>
        {/* Message section */}
        <Message/>
        
    </div>
    )
}

export default App
