import Sidebar from './components/common/Iconbutton';
import Message from './components/Message';

//export const socket = io('http://localhost:3001',{autoConnect:true});

//socket.connect();

function App(){
    return(
    
   <div className='bg-[#282A2E] flex h-dvh w-dvw'>
        {/* Sidebarsection */}
        <Sidebar/>
        {/* Message section */}
        <Message/>
        
    </div>
    )
}

export default App
